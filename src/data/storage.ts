import type { AppData, Bewerbung } from '../types';
import { demoAppData } from './demoData';

const STORAGE_KEY = 'bewerbungstracker.v1';

export function ladeAppData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    speichereAppData(demoAppData);
    return demoAppData;
  }
  try {
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.schema_version !== 1) {
      console.warn('Unbekannte Schema-Version, lade Standard.');
      return leereAppData();
    }
    return parsed;
  } catch {
    return leereAppData();
  }
}

export function speichereAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function leereAppData(): AppData {
  return {
    schema_version: 1,
    einstellungen: {
      coaching_aktiv: true,
      reminder_default_tage: 10,
    },
    bewerbungen: [],
  };
}

export type NeueBewerbungEingabe = Omit<
  Bewerbung,
  'id' | 'reminders' | 'interviews' | 'erstellt_am' | 'aktualisiert_am' | 'status_geaendert_am'
>;

export function bewerbungErstellen(eingabe: NeueBewerbungEingabe): Bewerbung {
  const daten = ladeAppData();
  const jetzt = new Date().toISOString();
  const neueBewerbung: Bewerbung = {
    ...eingabe,
    id: crypto.randomUUID(),
    status_geaendert_am: jetzt,
    reminders: [],
    interviews: [],
    erstellt_am: jetzt,
    aktualisiert_am: jetzt,
  };
  daten.bewerbungen.push(neueBewerbung);
  speichereAppData(daten);
  return neueBewerbung;
}

export function bewerbungAktualisieren(aktualisierte: Bewerbung): void {
  const daten = ladeAppData();
  const idx = daten.bewerbungen.findIndex((b) => b.id === aktualisierte.id);
  if (idx === -1) {
    throw new Error(`Bewerbung mit ID ${aktualisierte.id} nicht gefunden.`);
  }
  daten.bewerbungen[idx] = {
    ...aktualisierte,
    aktualisiert_am: new Date().toISOString(),
  };
  speichereAppData(daten);
}

export function bewerbungLoeschen(id: string): void {
  const daten = ladeAppData();
  daten.bewerbungen = daten.bewerbungen.filter((b) => b.id !== id);
  speichereAppData(daten);
}

export function einstellungenAktualisieren(
  patches: Partial<AppData['einstellungen']>
): void {
  const daten = ladeAppData();
  daten.einstellungen = { ...daten.einstellungen, ...patches };
  speichereAppData(daten);
}

export function alleDatenZuruecksetzen(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function alleDatenAlsJson(): string {
  const daten = ladeAppData();
  return JSON.stringify(daten, null, 2);
}

export function alleDatenImportieren(json: string): void {
  const parsed = JSON.parse(json);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Ungültige Datei: Kein Objekt gefunden.');
  }
  if (parsed.schema_version !== 1) {
    throw new Error(
      `Ungültige Datei: Schema-Version ${parsed.schema_version} wird nicht unterstützt.`
    );
  }
  if (!Array.isArray(parsed.bewerbungen) || typeof parsed.einstellungen !== 'object') {
    throw new Error('Ungültige Datei: Erforderliche Felder fehlen.');
  }
  speichereAppData(parsed as AppData);
}
