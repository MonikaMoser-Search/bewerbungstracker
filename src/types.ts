export type Status =
  | "Entwurf"
  | "Beworben"
  | "Eingangsbestätigung"
  | "Interview geplant"
  | "Interview erledigt"
  | "Angebot"
  | "Angenommen"
  | "Absage"
  | "Zurückgezogen";

export const ALLE_STATUS: Status[] = [
  "Entwurf",
  "Beworben",
  "Eingangsbestätigung",
  "Interview geplant",
  "Interview erledigt",
  "Angebot",
  "Angenommen",
  "Absage",
  "Zurückgezogen",
];

export type InterviewTyp = "Telefon" | "Video" | "Persönlich" | "Sonstiges";
export type InterviewRunde = "1. Runde" | "2. Runde" | "3. Runde" | "Final" | "Andere";

export type Reminder = {
  id: string;
  zeitpunkt: string;
  nachricht: string;
  erledigt: boolean;
  auto_erstellt: boolean;
};

export type Interview = {
  id: string;
  datum: string;
  typ: InterviewTyp;
  runde: InterviewRunde;
  ort_oder_link: string;
  teilnehmer: string;
  meine_fragen: string;
  notizen_nachher: string;
};

export type Bewerbung = {
  id: string;
  firma: string;
  position: string;
  standort: string;
  bewerbung_datum: string;
  status: Status;
  status_geaendert_am: string;
  ansprechpartner: string;
  kontakt_info: string;
  anzeigen_url: string;
  gehalt_vorstellung: number | null;
  notizen: string;
  reminders: Reminder[];
  interviews: Interview[];
  erstellt_am: string;
  aktualisiert_am: string;
  ist_demo?: boolean;
};

export type Einstellungen = {
  coaching_aktiv: boolean;
  reminder_default_tage: number;
  letzter_export?: string;
};

export type AppData = {
  schema_version: 1;
  einstellungen: Einstellungen;
  bewerbungen: Bewerbung[];
};
