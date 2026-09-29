import Image from "next/image";
import onDark from "@/lib/img/logo-on-dark.png";
import onLight from "@/lib/img/logo-on-light.png";

/**
 * Il segno del marchio.
 *
 * Due file e non uno colorato via CSS: il logo non e' monocromatico — le barre
 * restano rosse in entrambe le versioni, e cambia solo il campo, nero su fondo
 * chiaro e bianco su fondo scuro. `surface` dice su che fondo sta il segno,
 * non di che colore e', cosi' chi lo usa non deve ricordarsi quale file e'
 * quale.
 *
 * `auto` e' per chi sta sul fondo della pagina, che cambia col tema: rende
 * entrambe le versioni e ne lascia visibile una sola, scelta dal CSS con la
 * stessa regola delle variabili di colore. Non si sceglie con JavaScript perche'
 * il tema lo decide il server o il dispositivo, e uno script mostrerebbe per un
 * istante il segno sbagliato. `light` e `dark` restano per i fondi fissi, che
 * non seguono il tema (le fasce nere).
 *
 * Qui `next/image` va bene, al contrario delle copertine: il file e' nostro e
 * sta nel progetto, quindi non c'e' nessun host esterno da autorizzare e in
 * cambio si ottengono le due densita' senza scriverle a mano.
 */
export const Logo = ({
  surface = "auto",
  size = 32,
  className = "",
}: {
  /** Fondo su cui appoggia il segno: quello della pagina (`auto`) o fisso. */
  surface?: "light" | "dark" | "auto";
  /** Lato in pixel: il segno e' quadrato. */
  size?: number;
  className?: string;
}) => {
  // Decorativo: ovunque compaia, accanto c'e' scritto "Loresync". Un testo
  // alternativo lo farebbe leggere due volte a chi usa uno screen reader.
  if (surface !== "auto") {
    return (
      <Image
        src={surface === "dark" ? onDark : onLight}
        alt=""
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return (
    <>
      <Image
        src={onLight}
        alt=""
        width={size}
        height={size}
        className={`${className} dark:hidden`}
      />
      <Image
        src={onDark}
        alt=""
        width={size}
        height={size}
        className={`${className} hidden dark:block`}
      />
    </>
  );
};
