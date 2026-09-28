"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * Il pannello di modifica della scheda in griglia, aperto dall'icona sopra la
 * copertina.
 *
 * Era un `details` lasciato al browser, e il browser lo teneva aperto anche
 * dopo il salvataggio: la pagina si aggiornava, il capitolo nuovo compariva
 * sotto la copertina, e il pannello restava li' a coprirla come se ci fosse
 * ancora qualcosa da fare. Qui lo stato e' di React, per tre motivi:
 *
 * - salvare capitolo e stato chiude il pannello, perche' e' l'aggiornamento
 *   di tutti i giorni e dopo il lavoro e' finito. Lo fa l'invio del form
 *   marcato `data-closes-panel`, cioe' `ProgressForm`: gli altri form del
 *   pannello non lo chiudono, perche' "Modifica" puo' finire con un errore
 *   (link gia' presente) che deve restare visibile;
 * - si parte sempre chiusi, quindi ricaricando la pagina il pannello e'
 *   nascosto;
 * - Esc e un click fuori lo chiudono, come ci si aspetta da un pannello
 *   posato sopra la scheda.
 */
export const GridEditPanel = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  return (
    // `pointer-events-none` sul contenitore e `auto` sui due pezzi che
    // contano: chiuso, il `details` e' una fascia larga quanto la scheda alta
    // trentadue pixel, e senza questo intercetterebbe i click su una striscia
    // di copertina per niente.
    //
    // `z-20`: aperto, il pannello puo' superare l'altezza della scheda e finire
    // sopra quelle della riga sotto. Senza, sarebbero loro a coprirlo, perche'
    // a parita' di livello vince chi viene dopo.
    <details
      ref={panelRef}
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      onSubmit={(event) => {
        // Il form resta montato anche a pannello chiuso: chiudere non
        // interrompe l'azione, che e' gia' partita con l'invio.
        if (
          event.target instanceof HTMLFormElement &&
          event.target.hasAttribute("data-closes-panel")
        ) {
          setIsOpen(false);
        }
      }}
      className="pointer-events-none absolute inset-x-0 top-0 z-20"
    >
      {/* Le classi sono scritte qui e non prese da `BUTTON_ICON_SM_CLASS`
          perche' il pulsante dev'essere di livello blocco per potersi
          spingere a destra con `ml-auto`, e quella costante e' `inline-flex`.
          `list-none` e la regola webkit tolgono il triangolino: qui il
          comando e' l'icona, e un marcatore accanto sarebbe rumore. */}
      <summary className="pointer-events-auto ml-auto flex h-8 w-8 cursor-pointer list-none items-center justify-center border-2 border-secondary bg-neutral-light hover:border-primary hover:text-primary [&::-webkit-details-marker]:hidden">
        <Icon name="edit" />
        {/* Il nome del comando resta scritto, per chi non vede l'icona. */}
        <span className="sr-only">{label}</span>
      </summary>

      {/* Fondo pieno e bordo: aperto copre la copertina, e deve leggersi come
          un pannello posato sopra, non come testo sull'immagine. */}
      <div className="pointer-events-auto mt-step-1 flex flex-col gap-step-1 border-2 border-secondary bg-neutral-light p-step-1">
        {children}
      </div>
    </details>
  );
};
