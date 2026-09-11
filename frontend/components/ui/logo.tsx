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
 * Qui `next/image` va bene, al contrario delle copertine: il file e' nostro e
 * sta nel progetto, quindi non c'e' nessun host esterno da autorizzare e in
 * cambio si ottengono le due densita' senza scriverle a mano.
 */
export const Logo = ({
  surface = "light",
  size = 32,
  className = "",
}: {
  /** Fondo su cui appoggia il segno. */
  surface?: "light" | "dark";
  /** Lato in pixel: il segno e' quadrato. */
  size?: number;
  className?: string;
}) => (
  <Image
    src={surface === "dark" ? onDark : onLight}
    // Decorativo: ovunque compaia, accanto c'e' scritto "Loresync". Un testo
    // alternativo lo farebbe leggere due volte a chi usa uno screen reader.
    alt=""
    width={size}
    height={size}
    className={className}
  />
);
