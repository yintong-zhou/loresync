import { BUTTON_ICON_GHOST_FILTER_CLASS } from "@/components/ui/form-styles";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Dictionary } from "@/lib/i18n";
import { setTheme } from "@/lib/preferences/actions";
import { nextTheme, type ThemeMode } from "@/lib/theme";

/**
 * Cambia il tema: sistema, chiaro, scuro, e da capo.
 *
 * Un pulsante solo, che cicla, e non tre: sul telefono la riga in alto e' gia'
 * piena. Reggere il ciclo senza JavaScript e' possibile perche' il modo attuale
 * lo sa il server — "sistema" e' il cookie che manca — quindi anche il
 * successivo si calcola qui e viaggia nel form come campo nascosto.
 *
 * L'icona mostra il modo **attuale**, il testo `sr-only` dice cosa succede
 * premendo: la stessa convenzione dei selettori di vista e dei contenuti per
 * adulti. E' un form POST, vedi `setTheme`.
 */
export const ThemeToggle = ({
  current,
  labels,
}: {
  current: ThemeMode;
  labels: Dictionary["common"];
}) => {
  const next = nextTheme(current);

  const icon: Record<ThemeMode, IconName> = {
    system: "monitor",
    light: "sun",
    dark: "moon",
  };

  const action: Record<ThemeMode, string> = {
    system: labels.themeToSystem,
    light: labels.themeToLight,
    dark: labels.themeToDark,
  };

  return (
    <form action={setTheme}>
      <input type="hidden" name="mode" value={next} />
      <button type="submit" className={BUTTON_ICON_GHOST_FILTER_CLASS}>
        <Icon name={icon[current]} />
        <span className="sr-only">{action[next]}</span>
      </button>
    </form>
  );
};
