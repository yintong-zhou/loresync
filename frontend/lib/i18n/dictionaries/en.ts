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
    passwordShow: "Show password",
    passwordHide: "Hide password",
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
    da_leggere: "To read",
    in_corso: "Reading",
    completato: "Completed",
    in_pausa: "On hold",
    droppato: "Dropped",
  },
  nav: {
    dashboard: "Dashboard",
    library: "Library",
    add: "Add",
    account: "Account",
  },
  dashboard: {
    title: "Where you left off",
    empty: "Nothing here yet. Start from the link of a series.",
    statsSection: "Numbers",
    chaptersRead: "Chapters reached",
    series: "Series",
    recent: "Active · {days}d",
    statusSection: "By status",
  },
  auth: {
    loginTitle: "Log in to Loresync",
    signUpTitle: "Create an account",
    emailLabel: "Email",
    passwordLabel: "Password",
    passwordHint: "At least 8 characters.",
    displayNameLabel: "Display name",
    displayNameHint: "Optional. You can set it later from your account.",
    signInCta: "Log in",
    signUpCta: "Sign up",
    toSignUp: "No account yet? Sign up",
    toSignIn: "Already have an account? Log in",
    pending: "Wait...",
    checkEmail:
      "We sent you a confirmation email. Open it to activate your account.",
    confirmPasswordLabel: "Confirm password",
    passwordMismatch: "The two passwords do not match.",
    errors: {
      invalidCredentials: "Invalid email or password.",
      emailNotConfirmed:
        "You need to confirm your email before logging in. Check your inbox, " +
        "including the spam folder.",
      invalidInput: "Check the details you entered.",
      emailTaken: "An account with this email already exists.",
      weakPassword: "The password must be at least 8 characters.",
      rateLimited: "Too many attempts. Try again in a few minutes.",
      samePassword: "The new password matches the current one.",
      invalidLink: "That link is no longer valid. Request a new one.",
      generic: "Something went wrong. Try again.",
    },
  },
  account: {
    title: "Account",
    profileSection: "Profile",
    emailSection: "Email",
    passwordSection: "Password",
    preferredLocaleLabel: "Preferred language",
    preferredLocaleHint:
      "Also switches the interface language, right after saving.",
    currentEmail: "Current email",
    newEmailLabel: "New email",
    emailChangeHint:
      "The change only takes effect once you open the confirmation link.",
    emailChangeRequested:
      "We sent an email to the new address. Confirm it to complete the change.",
    newPasswordLabel: "New password",
    confirmPasswordLabel: "Confirm password",
    passwordMismatch: "The two passwords do not match.",
    passwordChanged: "Password updated.",
    save: "Save",
    saved: "Saved.",
    pending: "Saving...",
    signOut: "Log out",
    deleteSection: "Delete account",
    deleteWarning:
      "Deletes your account, your whole library and everything you put in " +
      "it. There is no way back and no copy to recover from.",
    deleteCta: "Delete my account",
    deletePasswordLabel: "Confirm with your password",
    deleteConfirm: "Delete permanently",
    errors: {
      invalidInput: "Check the details you entered.",
      notSignedIn: "Session expired. Log in again.",
      weakPassword: "The password must be at least 8 characters.",
      wrongPassword: "Wrong password. Your account was left untouched.",
      generic: "Could not save. Try again.",
    },
  },
  legal: {
    backHome: "Back to home",
    cookie: {
      title: "Cookies",
      intro:
        "Loresync uses technical cookies only: the ones that keep you signed " +
        "in and remember the choices you make in the interface. There is " +
        "nothing to accept or refuse, because without them the site would " +
        "not work, or would forget your preferences on every page.",
      tableName: "Name",
      tablePurpose: "What it does",
      tableDuration: "Lifetime",
      rows: {
        session: {
          name: "sb-<project>-auth-token",
          purpose:
            "Keeps you signed in: it identifies your session after login. " +
            "Set by Supabase, the service that handles authentication and " +
            "the database.",
          duration: "The session, renewed as you browse",
        },
        locale: {
          name: "NEXT_LOCALE",
          purpose: "Remembers the language you picked.",
          duration: "One year",
        },
        view: {
          name: "loresync-view",
          purpose: "Remembers whether the library opens as a list or a grid.",
          duration: "One year",
        },
        adult: {
          name: "loresync-adult",
          purpose: "Remembers whether adult content is hidden.",
          duration: "One year",
        },
        notice: {
          name: "loresync-cookie-notice",
          purpose:
            "Remembers that this notice has been read, so it is not shown " +
            "again on every page.",
          duration: "One year",
        },
      },
      noProfiling:
        "None of these cookies are third-party, none profile you and none " +
        "follow you outside this site. There is no traffic analytics, no " +
        "tracking pixel and no advertising script.",
      manageHeading: "How to delete them",
      manage:
        "Cookies can be deleted and blocked from your browser settings. " +
        "Blocking the session cookie stops login from working; blocking the " +
        "others resets your preferences on every visit.",
    },
    privacy: {
      title: "Privacy",
      whatHeading: "What data is collected",
      whatAccount:
        "For the account: email address, password, and — if you fill them " +
        "in — display name and preferred language. The password is never " +
        "stored in the clear and is not visible to anyone: Supabase keeps " +
        "only an encrypted version, which can tell whether the password you " +
        "typed is right but cannot reveal the password itself.",
      whatLibrary:
        "For the library: the links you paste, the chapter you reached, the " +
        "title, description and cover taken from the page, the tags you " +
        "assign and the reading status.",
      whyHeading: "Why",
      why:
        "Account data makes login work and tells one library from another. " +
        "Library data is the content you enter, and keeping it is the reason " +
        "the service exists. Neither is used for anything else.",
      whoHeading: "Who else processes it",
      whoSupabase:
        "Supabase, for the database and authentication: this is where the " +
        "data actually lives.",
      whoResend:
        "Resend, only to deliver service emails — address confirmation, " +
        "email change, password recovery. It receives the recipient address " +
        "and the content of those messages, and nothing else.",
      notHeading: "What is not done",
      not:
        "No traffic analytics, no profiling, no advertising, no automated " +
        "decisions about people, no sharing or selling of data to third " +
        "parties. Libraries are not visible between users: everyone sees " +
        "only their own.",
      rightsHeading: "Your rights",
      rightsIntro:
        "European regulation gives you the right to access your data, " +
        "correct it, erase it, restrict its processing, receive it in a " +
        "readable format, object to processing, and lodge a complaint with " +
        "a supervisory authority.",
      rightsInProduct:
        "Two of them you exercise straight from the app, without asking " +
        "anyone: the Account page corrects your name, language, email and " +
        "password, and deleting your account removes it together with your " +
        "entire library.",
    },
  },
  notice: {
    text:
      "This site uses technical cookies only: they keep you signed in and " +
      "remember your language, view and content filter. There are no " +
      "profiling cookies and nothing to accept.",
    cta: "Got it",
    cookieLink: "Cookie notice",
    privacyLink: "Privacy",
  },
  library: {
    title: "My library",
    searchLabel: "Search",
    searchPlaceholder: "Title or description",
    anyStatus: "All",
    anyTag: "All",
    filter: "Filter",
    clear: "Clear",
    viewLabel: "View",
    viewList: "List",
    viewGrid: "Grid",
    adultShow: "Show adult content",
    adultHide: "Hide adult content",
    sortLabel: "Sort",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortAz: "A-Z",
    sortZa: "Z-A",
    paginationLabel: "Pages",
    page: "Page",
    prevPage: "Previous",
    nextPage: "Next",
    empty: "Nothing here yet. Start from the link of a series.",
    noResults: "No series match these filters.",
  },
  manga: {
    addTitle: "Add a series",
    seriesUrlLabel: "Series link",
    seriesUrlHint: "Paste the link: Loresync pulls the title.",
    lookupPending: "Reading the title from the link...",
    lookupFailed: "No title could be read from this link: type it yourself.",
    coverFound: "Cover found on the source site.",
    titleLabel: "Title",
    titleHint: "Edit it freely: this is what gets saved.",
    chapterLabel: "Chapter",
    chapterShort: "ch.",
    chapterHint: "The link points to chapter",
    chapterUrlLabel: "Chapter link (optional)",
    chapterUrlHint: "Paste it and Resume opens the chapter directly.",
    statusLabel: "Status",
    tagsLabel: "Tags",
    tagsHint: "Comma separated. For example: action, fantasy",
    descriptionLabel: "Description (optional)",
    descriptionHint: "Only worth it if it helps you recognise the series.",
    descriptionEditHint: "Clear the field to delete it.",
    submit: "Add",
    pending: "Saving...",
    save: "Save",
    saved: "Saved.",
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: "Sure? Delete",
    resumeChapter: "Resume chapter",
    openSeries: "Open series",
    noValidLink: "Invalid link",
    staleLink: "The saved link points to another chapter: paste it again.",
    errors: {
      invalidInput: "Check the details you entered.",
      duplicate: "This series is already in your library.",
      generic: "Could not save. Try again.",
    },
  },
};
