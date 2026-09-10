import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Blocca gli indirizzi che non devono essere raggiungibili da una richiesta
 * originata dall'utente (punto 2 di `directives/extract_manga_metadata.md`).
 *
 * Il controllo va fatto sull'indirizzo risolto, non sul nome: un dominio
 * pubblico puo' benissimo puntare a 127.0.0.1, ed e' esattamente cosi' che si
 * aggira un filtro basato sulla stringa dell'host.
 */
export const isPrivateAddress = (address: string): boolean => {
  const version = isIP(address);

  if (version === 4) {
    const parts = address.split(".").map(Number);
    const [a = 0, b = 0] = parts;

    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10/8
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local, incluso metadata cloud
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
    if (a === 192 && b === 168) return true; // 192.168/16
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
    if (a >= 224) return true; // multicast e riservati
    return false;
  }

  if (version === 6) {
    const value = address.toLowerCase();
    if (value === "::1" || value === "::") return true;
    if (value.startsWith("fe80")) return true; // link-local
    if (value.startsWith("fc") || value.startsWith("fd")) return true; // ULA
    // IPv4 mappato: ::ffff:127.0.0.1 aggirerebbe i controlli qui sopra.
    const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) return isPrivateAddress(mapped[1]);
    return false;
  }

  return false;
};

/**
 * Vero se l'host e' sicuro da contattare.
 * In caso di errore DNS ritorna `false`: davanti a un dubbio non si scarica.
 */
export const isPublicHost = async (hostname: string): Promise<boolean> => {
  const bare = hostname.replace(/^\[|\]$/g, "");

  if (isIP(bare)) return !isPrivateAddress(bare);
  if (bare === "localhost" || bare.endsWith(".localhost")) return false;
  // Nomi interni tipici delle reti aziendali e di Docker.
  if (!bare.includes(".")) return false;

  try {
    const addresses = await lookup(bare, { all: true });
    if (addresses.length === 0) return false;
    return addresses.every(({ address }) => !isPrivateAddress(address));
  } catch {
    return false;
  }
};
