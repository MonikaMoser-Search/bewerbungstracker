import { Link } from 'react-router-dom';
import type { Bewerbung, Reminder } from '../types';

export type FaelligeReminder = {
  reminder: Reminder;
  bewerbung: Bewerbung;
};

export function faelligeRemindersFinden(
  bewerbungen: Bewerbung[]
): FaelligeReminder[] {
  const jetzt = Date.now();
  const ergebnis: FaelligeReminder[] = [];
  for (const b of bewerbungen) {
    for (const r of b.reminders) {
      if (!r.erledigt && new Date(r.zeitpunkt).getTime() <= jetzt) {
        ergebnis.push({ reminder: r, bewerbung: b });
      }
    }
  }
  return ergebnis.sort(
    (a, b) =>
      new Date(a.reminder.zeitpunkt).getTime() -
      new Date(b.reminder.zeitpunkt).getTime()
  );
}

export function FaelligeRemindersBanner({
  items,
}: {
  items: FaelligeReminder[];
}) {
  if (items.length === 0) return null;
  const limit = 5;
  const sichtbar = items.slice(0, limit);
  const rest = items.length - limit;

  return (
    <div className="rounded-lg bg-mm-cream border border-mm-orange/30 p-4 mb-4">
      <h3 className="font-medium text-mm-brown mb-2 text-sm">
        {items.length === 1
          ? '1 Erinnerung ist fällig'
          : `${items.length} Erinnerungen sind fällig`}
      </h3>
      <ul className="space-y-1.5">
        {sichtbar.map(({ reminder, bewerbung }) => (
          <li key={reminder.id}>
            <Link
              to={`/bewerbung/${bewerbung.id}`}
              className="text-sm text-mm-brown hover:underline flex items-baseline gap-2"
            >
              <span className="font-medium">{bewerbung.firma}</span>
              <span className="text-stone-700">— {reminder.nachricht}</span>
            </Link>
          </li>
        ))}
        {rest > 0 && (
          <li className="text-xs text-mm-orange-dark">
            … und {rest} weitere
          </li>
        )}
      </ul>
    </div>
  );
}

export function BackupErinnerungBanner({
  letzterBackup,
  schwelleTage,
}: {
  letzterBackup?: string;
  schwelleTage: number;
}) {
  let tageHer: number | null = null;
  if (letzterBackup) {
    const ms = Date.now() - new Date(letzterBackup).getTime();
    tageHer = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (tageHer < schwelleTage) return null;
  }

  return (
    <div className="rounded-lg bg-mm-cream-soft border border-stone-200 p-4 mb-4 text-sm flex items-start justify-between gap-4">
      <div className="text-stone-700">
        {tageHer === null
          ? 'Du hast noch nie ein Backup erstellt.'
          : `Letztes Backup vor ${tageHer} Tagen.`}{' '}
        Empfohlen, damit deine Daten sicher sind.
      </div>
      <Link
        to="/einstellungen"
        className="text-sm font-medium text-mm-orange-dark hover:underline whitespace-nowrap"
      >
        Backup erstellen
      </Link>
    </div>
  );
}
