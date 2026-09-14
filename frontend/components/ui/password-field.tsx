"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  BUTTON_ICON_GHOST_CLASS,
  FIELD_CLASS,
  HINT_CLASS,
  LABEL_CLASS,
} from "@/components/ui/form-styles";

/**
 * Campo password con mostra/nascondi.
 *
 * Il toggle e' per campo e non uno per coppia: uno condiviso fra "password" e
 * "conferma" avrebbe richiesto di tenere lo stato sopra i due campi, e nella
 * pagina dell'account quei due arrivano come `children` da un server
 * component. Per campo costa un click in piu' e in cambio non ristruttura
 * niente; svelare la sola conferma, per confrontarla con quello che si ricorda
 * di aver scritto sopra, e' comodo di per se'.
 *
 * Il pulsante sta in fila con il campo, non dentro: sovrapporlo avrebbe voluto
 * dire bucare il padding di `FIELD_CLASS`, e il riquadro da 2px senza angoli
 * arrotondati non nasconde le sovrapposizioni. Affiancato invece non chiede
 * niente a nessuno, perche' altezza e bordo sono gia' quelli del campo.
 *
 * `type="button"` non e' una formalita': dentro un form un pulsante senza tipo
 * invia, e il toggle spedirebbe la registrazione a meta'.
 */
export const PasswordField = ({
  id,
  name,
  label,
  hint,
  autoComplete,
  showLabel,
  hideLabel,
}: {
  id: string;
  name: string;
  label: string;
  /** Suggerimento sotto il campo; omesso, non lascia spazio vuoto. */
  hint?: string;
  autoComplete: "current-password" | "new-password";
  /** Etichette del toggle: nominano l'azione, non lo stato. */
  showLabel: string;
  hideLabel: string;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      {/* Campo e pulsante sulla stessa riga: e' il caso per cui `form-styles`
          da' a ogni controllo lo stesso bordo e la stessa altezza fissa, cosi'
          i due combaciano senza aggiustamenti. */}
      <div className="mt-step-1 flex gap-step-1">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={8}
          maxLength={72}
          autoComplete={autoComplete}
          // `min-w-0` con `flex-1`: il `w-full` di `FIELD_CLASS` da solo
          // spingerebbe il campo oltre la riga e schiaccerebbe il pulsante.
          className={`min-w-0 flex-1 ${FIELD_CLASS}`}
        />
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          className={`${BUTTON_ICON_GHOST_CLASS} shrink-0`}
        >
          {/* Come in `AdultToggle`: l'icona racconta cosa succede premendo. */}
          <Icon name={visible ? "eye-off" : "eye"} />
          <span className="sr-only">{visible ? hideLabel : showLabel}</span>
        </button>
      </div>
      {hint ? <p className={HINT_CLASS}>{hint}</p> : null}
    </div>
  );
};
