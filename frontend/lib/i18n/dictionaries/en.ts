import type { Dictionary } from "./it";

/**
 * Dizionario inglese. L'annotazione `: Dictionary` e' il controllo: se una
 * chiave manca o cambia nome in it.ts, questo file non compila piu'.
 */
export const en: Dictionary = {
  meta: {
    title: "Loresync",
    description:
      "Keep track of the manga, manhwa and manhua you read online: link, chapter, and pick up right where you left off.",
  },
  common: {
    login: "Log in",
    languageLabel: "Language",
    languageName: "English",
  },
  landing: {
    hero: {
      line1: "Stop losing",
      line2: "your place",
      lead: "You follow twenty series at once and remember where you left off in three. Loresync keeps count for you: manga, manhwa and manhua read online, with the right chapter always one click away.",
      cta: "Start now",
    },
    steps: {
      title: "How it works",
      items: [
        {
          title: "Paste the link",
          body: "Loresync pulls the title from the link. You do not type it.",
        },
        {
          title: "Mark the chapter",
          body: "One number. Then tags and reading status, if you want them.",
        },
        {
          title: "Pick up again",
          body: "One click opens the chapter. Or the series page.",
        },
      ],
    },
    features: {
      title: "What it does",
      items: [
        "Title pulled from the link, automatically",
        "Genres and tags you choose, never guessed",
        "Four reading states for every series",
        "Search and filter by tag",
        "One account and one list per reader",
      ],
    },
    statuses: {
      title: "Reading status",
    },
    limits: {
      line1: "Loresync does",
      line2: "not read for you",
      items: [
        "No integration with reading platforms",
        "No automatic chapter sync",
        "No alerts about new chapters",
      ],
      note: "It records where you got to, and takes you back there. The rest is on you.",
    },
    final: {
      title: "Your library is waiting",
    },
    footer: "Loresync — a personal tool for people who read too much",
  },
  readingStatus: {
    in_corso: "Reading",
    completato: "Completed",
    in_pausa: "On hold",
    droppato: "Dropped",
  },
  auth: {
    loginTitle: "Log in to Loresync",
    loginPlaceholder: "Scaffolding: the auth form is not implemented yet.",
  },
  library: {
    title: "My library",
    placeholder:
      "Scaffolding: list, filters and search are not implemented yet.",
  },
  addManga: {
    title: "Add a series",
    placeholder: "Scaffolding: the form is not implemented yet.",
  },
};
