import assert from "node:assert/strict";
import { test } from "node:test";
import { countHosts, hostFromInput, swapHost } from "./url.ts";

test("il dominio si legge sia scritto a mano sia da un link", () => {
  assert.equal(hostFromInput(" Manga.IT "), "manga.it");
  assert.equal(hostFromInput("https://www.manga.it/serie/x?p=1"), "www.manga.it");
  assert.equal(hostFromInput(""), null);
  assert.equal(hostFromInput("manga"), null);
  assert.equal(hostFromInput("ht tp://x"), null);
});

test("cambia solo il dominio, il resto del link resta com'e'", () => {
  assert.equal(
    swapHost("https://manga.it/serie/one-piece/chapter-10?lang=it", "manga.it", "manga.com"),
    "https://manga.com/serie/one-piece/chapter-10?lang=it",
  );
});

test("un link su un altro dominio, anche un sottodominio, non si tocca", () => {
  assert.equal(swapHost("https://cdn.manga.it/x.jpg", "manga.it", "manga.com"), null);
  assert.equal(swapHost("https://altro.it/x", "manga.it", "manga.com"), null);
  assert.equal(swapHost("non un link", "manga.it", "manga.com"), null);
});

test("i siti contano le serie, non i link", () => {
  assert.deepEqual(
    countHosts([
      ["https://b.it/x", "https://b.it/x/ch-1", "https://cdn.b.it/x.jpg"],
      ["https://a.it/y", null, null],
      ["https://b.it/z", "non un link", null],
    ]),
    [
      { host: "b.it", count: 2 },
      { host: "a.it", count: 1 },
      { host: "cdn.b.it", count: 1 },
    ],
  );
});
