/**
 * Una cifra con la sua etichetta.
 *
 * Il contrasto di scala e' il punto: il numero e' il contenuto, l'etichetta
 * dice soltanto di cosa si tratta. Scritti dello stesso corpo sarebbero due
 * informazioni pari, e la dashboard diventerebbe una tabella.
 *
 * `tabular-nums`: le cifre proporzionali hanno larghezze diverse, e due
 * riquadri accanto con numeri di lunghezza simile risulterebbero disallineati
 * senza un motivo visibile.
 */
export const Stat = ({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  /** Riga piccola sotto l'etichetta, quando il numero da solo non basta. */
  hint?: string;
}) => (
  <div className="border-t-2 border-secondary pt-step-1">
    <p className="font-heading text-5xl leading-none tabular-nums md:text-6xl">
      {value}
    </p>
    <p className="mt-step-1 text-sm font-bold uppercase tracking-wide">
      {label}
    </p>
    {hint ? (
      <p className="text-sm uppercase tracking-wide text-neutral-dark">
        {hint}
      </p>
    ) : null}
  </div>
);
