import assert from "node:assert/strict";
import { test } from "node:test";
import {
  THEME_COOKIE,
  THEME_MODES,
  isThemeMode,
  nextTheme,
  resolveTheme,
} from "./theme.ts";

test("un cookie assente vale sistema", () => {
  assert.equal(resolveTheme(undefined), "system");
});

test("chiaro e scuro si leggono cosi' come sono", () => {
  assert.equal(resolveTheme("light"), "light");
  assert.equal(resolveTheme("dark"), "dark");
});

// Il cookie lo puo' riscrivere chiunque dal browser: qualunque altro valore
// ricade su sistema, senza errori e senza scegliere un tema a caso. Anche
// "system", che l'applicazione non scrive mai (per sistema cancella il cookie).
test("un cookie sconosciuto o manomesso vale sistema", () => {
  for (const value of ["", "purple", "system", "DARK", "dark; x", "__proto__"]) {
    assert.equal(resolveTheme(value), "system", value);
  }
});

test("il ciclo e' sistema, chiaro, scuro, poi di nuovo sistema", () => {
  assert.equal(nextTheme("system"), "light");
  assert.equal(nextTheme("light"), "dark");
  assert.equal(nextTheme("dark"), "system");
});

test("tre passi riportano al punto di partenza, da qualunque modo", () => {
  for (const start of THEME_MODES) {
    assert.equal(nextTheme(nextTheme(nextTheme(start))), start);
  }
});

// `isThemeMode` filtra il campo `mode` di un form POST, che chiunque sappia
// costruirne uno puo' riempire come vuole.
test("isThemeMode accetta solo i tre modi", () => {
  for (const value of THEME_MODES) assert.equal(isThemeMode(value), true);
  for (const value of ["", "auto", "Light", "__proto__", "constructor", "0"]) {
    assert.equal(isThemeMode(value), false, value);
  }
});

test("il cookie ha il prefisso dell'applicazione", () => {
  assert.equal(THEME_COOKIE, "loresync-theme");
});
