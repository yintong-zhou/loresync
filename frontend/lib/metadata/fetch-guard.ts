import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import { isIP } from "node:net";

/**
 * Blocca gli indirizzi che non devono essere raggiungibili da una richiesta
 * originata dall'utente (punto 2 di `directives/extract_manga_metadata.md`).
 *
 * Il controllo va fatto sull'indirizzo risolto, non sul nome: un dominio
 * pubblico puo' benissimo puntare a 127.0.0.1, ed e' esattamente cosi' che si
 * aggira un filtro basato sulla stringa dell'host.
 *
 * Gli indirizzi vengono confrontati sui byte, non sul testo: lo stesso IPv6 ha
 * molte grafie (`::ffff:127.0.0.1` e `::ffff:7f00:1` sono lo stesso loopback,
 * e il parser URL produce la seconda), e un confronto fra stringhe ne lascia
 * sempre passare qualcuna.
 */
export const isPrivateAddress = (address: string): boolean => {
  const version = isIP(address);

  if (version === 4) return isPrivateIPv4(parseIPv4(address));
  if (version === 6) {
    const bytes = parseIPv6(address);
    // Grafia che `isIP` accetta ma che non sappiamo leggere: nel dubbio no.
    return bytes ? isPrivateIPv6(bytes) : true;
  }

  // Non e' un indirizzo IP: chi chiama deve risolverlo prima.
  return true;
};

const parseIPv4 = (address: string): number[] => address.split(".").map(Number);

const isPrivateIPv4 = ([a = 0, b = 0, c = 0]: number[]): boolean => {
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local, incluso metadata cloud
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true; // 192.168/16
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true; // 192.0.0/24, 192.0.2/24
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmark 198.18/15
  if (a === 198 && b === 51 && c === 100) return true; // documentazione
  if (a === 203 && b === 0 && c === 113) return true; // documentazione
  if (a >= 224) return true; // multicast e riservati
  return false;
};

/** I 16 byte di un IPv6, qualunque grafia usi; `null` se non si legge. */
const parseIPv6 = (address: string): number[] | null => {
  // L'identificativo di zona (`fe80::1%eth0`) non cambia l'indirizzo.
  let text = address.toLowerCase().replace(/%.*$/, "");

  // Coda IPv4 puntata (`::ffff:1.2.3.4`): diventa due gruppi esadecimali.
  const dotted = text.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted?.[1] && dotted[2]) {
    const [a = 0, b = 0, c = 0, d = 0] = parseIPv4(dotted[2]);
    text = `${dotted[1]}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }

  const halves = text.split("::");
  if (halves.length > 2) return null;

  const toGroups = (part: string | undefined): string[] =>
    part ? part.split(":") : [];
  const head = toGroups(halves[0]);
  const tail = toGroups(halves[1]);
  const missing = 8 - head.length - tail.length;

  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;

  const groups = [...head, ...Array<string>(missing).fill("0"), ...tail];
  const bytes: number[] = [];
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(group)) return null;
    const value = Number.parseInt(group, 16);
    bytes.push(value >> 8, value & 0xff);
  }
  return bytes;
};

const startsWith = (bytes: number[], prefix: number[]): boolean =>
  prefix.every((value, index) => bytes[index] === value);

const isPrivateIPv6 = (bytes: number[]): boolean => {
  const [b0 = 0, b1 = 0] = bytes;
  const embeddedV4 = (offset: number): number[] => bytes.slice(offset, offset + 4);

  // IPv4 mappato (::ffff:0:0/96) e NAT64 (64:ff9b::/96): la connessione va
  // all'IPv4 in coda, quindi decide quello.
  if (startsWith(bytes, [...Array<number>(10).fill(0), 0xff, 0xff])) {
    return isPrivateIPv4(embeddedV4(12));
  }
  if (startsWith(bytes, [0x00, 0x64, 0xff, 0x9b, ...Array<number>(8).fill(0)])) {
    return isPrivateIPv4(embeddedV4(12));
  }
  // 6to4 (2002::/16): l'IPv4 sta nei byte 2-5.
  if (b0 === 0x20 && b1 === 0x02) return isPrivateIPv4(embeddedV4(2));

  // Unicast globale e' solo 2000::/3. Tutto il resto — ::, ::1, IPv4
  // compatibile, fc00::/7, fe80::/10, fec0::/10, ff00::/8 — resta fuori.
  if ((b0 & 0xe0) !== 0x20) return true;

  if (b0 === 0x20 && b1 === 0x01) {
    // 2001::/23 (Teredo e assegnazioni di protocollo) e 2001:db8::/32
    // (documentazione) non sono destinazioni reali.
    if ((bytes[2] ?? 0) < 0x02) return true;
    if (bytes[2] === 0x0d && bytes[3] === 0xb8) return true;
  }

  return false;
};

/** Errore della lookup vincolata: il fetch lo vede come connessione rifiutata. */
export class BlockedHostError extends Error {
  readonly code = "EBLOCKEDHOST";

  constructor(hostname: string) {
    super(`blocked host: ${hostname}`);
    this.name = "BlockedHostError";
  }
}

/**
 * Risolve l'host e ammette la risposta solo se tutti gli indirizzi sono
 * pubblici. Ritorna gli indirizzi approvati: sono quelli su cui ci si deve
 * connettere, non altri.
 */
export const resolvePublicAddresses = async (
  hostname: string,
): Promise<LookupAddress[]> => {
  const bare = hostname.replace(/^\[|\]$/g, "");

  if (isIP(bare)) {
    if (isPrivateAddress(bare)) throw new BlockedHostError(hostname);
    return [{ address: bare, family: isIP(bare) }];
  }
  if (bare === "localhost" || bare.endsWith(".localhost")) {
    throw new BlockedHostError(hostname);
  }
  // Nomi interni tipici delle reti aziendali e di Docker.
  if (!bare.includes(".")) throw new BlockedHostError(hostname);

  const addresses = await lookup(bare, { all: true });
  if (addresses.length === 0) throw new BlockedHostError(hostname);
  if (addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new BlockedHostError(hostname);
  }
  return addresses;
};

/**
 * Vero se l'host e' sicuro da contattare.
 * In caso di errore DNS ritorna `false`: davanti a un dubbio non si scarica.
 *
 * Da solo non basta: fra questo controllo e la connessione il DNS puo'
 * cambiare risposta. La connessione vera passa da `pinnedLookup`.
 */
export const isPublicHost = async (hostname: string): Promise<boolean> => {
  try {
    await resolvePublicAddresses(hostname);
    return true;
  } catch {
    return false;
  }
};

type LookupCallback = (
  error: NodeJS.ErrnoException | null,
  address: string | LookupAddress[],
  family?: number,
) => void;

/**
 * `lookup` da passare a `http.request`: la verifica avviene dentro la
 * risoluzione usata dalla connessione, quindi l'indirizzo controllato e'
 * esattamente quello a cui ci si collega. Chiude il DNS rebinding, in cui un
 * dominio risponde con un IP pubblico al controllo e con uno interno subito
 * dopo.
 */
export const pinnedLookup = (
  hostname: string,
  options: { all?: boolean } | number,
  callback: LookupCallback,
): void => {
  const all = typeof options === "object" && options.all === true;

  resolvePublicAddresses(hostname).then(
    (addresses) => {
      if (all) {
        callback(null, addresses);
        return;
      }
      const first = addresses[0] as LookupAddress;
      callback(null, first.address, first.family);
    },
    (error: NodeJS.ErrnoException) => callback(error, ""),
  );
};
