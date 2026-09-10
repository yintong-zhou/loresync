"use client";

import { useState } from "react";

/**
 * Copertina caricata dal sito di origine.
 *
 * E' un componente client per un motivo solo: gestire `onError`. Il link
 * appartiene a una piattaforma terza e prima o poi smettera' di rispondere —
 * per un cambio di dominio, per un blocco dell'hotlinking, perche' la serie e'
 * stata rimossa. Quando succede si nasconde l'immagine, invece di lasciare in
 * pagina l'icona di immagine rotta.
 */
/**
 * Formato della copertina: 150x225, cioe' 2:3, il rapporto delle copertine dei
 * volumi. Le sorgenti arrivano nei formati piu' vari, quindi il riquadro e'
 * fisso e l'immagine viene ritagliata per riempirlo (`object-cover`): meglio
 * un bordo tagliato che una copertina schiacciata.
 */
export const COVER_WIDTH = 150;
export const COVER_HEIGHT = 225;

/** Riquadro 150x225 con ritaglio: le stesse classi ovunque compaia. */
export const COVER_CLASS =
  "w-[150px] h-[225px] shrink-0 object-cover border-2 border-secondary";

export const Cover = ({
  src,
  alt,
  className = COVER_CLASS,
  onBroken,
}: {
  src: string;
  alt: string;
  className?: string;
  /** Chiamato quando l'immagine non carica, per chi deve reagire attorno. */
  onBroken?: () => void;
}) => {
  const [broken, setBroken] = useState(false);

  if (broken) return null;

  // next/image richiederebbe di elencare in anticipo gli host consentiti, ma
  // le copertine arrivano da qualunque sito incolli l'utente. Con un tag
  // semplice l'immagine la carica il browser: il nostro server non fa da
  // tramite e non diventa un proxy verso host arbitrari.
  return (
    // eslint-disable-next-line @next/next/no-img-element -- host arbitrari, vedi sopra
    <img
      src={src}
      alt={alt}
      // Dimensioni dichiarate: il browser riserva lo spazio prima di scaricare
      // l'immagine, e la riga non salta quando arriva.
      width={COVER_WIDTH}
      height={COVER_HEIGHT}
      loading="lazy"
      // Non manda il nostro URL al sito che ospita l'immagine.
      referrerPolicy="no-referrer"
      className={className}
      onError={() => {
        setBroken(true);
        onBroken?.();
      }}
    />
  );
};
