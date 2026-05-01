import { useNavigate } from 'react-router-dom';
import type { Reminder } from '../types';
import {
  bewerbungAktualisieren,
  bewerbungErstellen,
  ladeAppData,
  type NeueBewerbungEingabe,
} from '../data/storage';
import { autoErinnerungenFuerStatus } from '../lib/coaching';
import { reminderPlanen } from '../lib/notifications';
import { BewerbungsFormular } from './BewerbungsFormular';

function heuteAlsISO(): string {
  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = String(heute.getMonth() + 1).padStart(2, '0');
  const tag = String(heute.getDate()).padStart(2, '0');
  return `${jahr}-${monat}-${tag}`;
}

const leereBewerbung: NeueBewerbungEingabe = {
  firma: '',
  position: '',
  standort: '',
  bewerbung_datum: heuteAlsISO(),
  status: 'Beworben',
  ansprechpartner: '',
  kontakt_info: '',
  anzeigen_url: '',
  gehalt_vorstellung: null,
  notizen: '',
};

export function NeueBewerbung() {
  const navigate = useNavigate();

  function handleSpeichern(eingabe: NeueBewerbungEingabe) {
    const neue = bewerbungErstellen(eingabe);

    const daten = ladeAppData();
    const autoReminders: Reminder[] = daten.einstellungen.auto_reminder_aktiv
      ? autoErinnerungenFuerStatus(
          neue.status,
          neue.firma,
          daten.einstellungen.reminder_default_tage
        ).map((r) => ({ ...r, id: crypto.randomUUID() }))
      : [];

    if (autoReminders.length > 0) {
      const aktualisiert = { ...neue, reminders: autoReminders };
      bewerbungAktualisieren(aktualisiert);
      autoReminders.forEach((r) =>
        reminderPlanen(r, { id: aktualisiert.id, firma: aktualisiert.firma })
      );
    }

    navigate(`/bewerbung/${neue.id}`);
  }

  return (
    <BewerbungsFormular
      modus="erstellen"
      initialwerte={leereBewerbung}
      abbrechenZiel="/"
      onSpeichern={handleSpeichern}
    />
  );
}
