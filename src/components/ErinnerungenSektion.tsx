import { useState, type FormEvent } from 'react';
import type { Reminder } from '../types';
import { formatiereDatumZeit } from '../lib/format';

function in7TagenLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function localDateTimeToISO(local: string): string {
  return new Date(local).toISOString();
}

type Props = {
  reminders: Reminder[];
  onUpdate: (neueReminders: Reminder[]) => void;
};

export function ErinnerungenSektion({ reminders, onUpdate }: Props) {
  const [hinzufuegenOffen, setHinzufuegenOffen] = useState(false);

  const offeneAnzahl = reminders.filter((r) => !r.erledigt).length;

  const sortiert = [...reminders].sort((a, b) => {
    if (a.erledigt !== b.erledigt) return a.erledigt ? 1 : -1;
    return new Date(a.zeitpunkt).getTime() - new Date(b.zeitpunkt).getTime();
  });

  function handleHinzufuegen(neuer: Omit<Reminder, 'id'>) {
    const reminder: Reminder = { ...neuer, id: crypto.randomUUID() };
    onUpdate([...reminders, reminder]);
    setHinzufuegenOffen(false);
  }

  function handleToggle(id: string) {
    onUpdate(
      reminders.map((r) =>
        r.id === id ? { ...r, erledigt: !r.erledigt } : r
      )
    );
  }

  function handleLoeschen(id: string) {
    onUpdate(reminders.filter((r) => r.id !== id));
  }

  return (
    <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          Erinnerungen
          {offeneAnzahl > 0 && (
            <span className="ml-2 text-amber-700 normal-case">
              · {offeneAnzahl} offen
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => setHinzufuegenOffen((v) => !v)}
          className="text-sm text-stone-600 hover:text-stone-900"
        >
          {hinzufuegenOffen ? 'Abbrechen' : '+ Hinzufügen'}
        </button>
      </div>

      {hinzufuegenOffen && (
        <NeuerReminderFormular
          onAbbrechen={() => setHinzufuegenOffen(false)}
          onSpeichern={handleHinzufuegen}
        />
      )}

      {sortiert.length === 0 && !hinzufuegenOffen ? (
        <p className="text-sm text-stone-500">Keine Erinnerungen.</p>
      ) : sortiert.length > 0 ? (
        <ul className="space-y-1">
          {sortiert.map((r) => (
            <ReminderEintrag
              key={r.id}
              reminder={r}
              onToggle={() => handleToggle(r.id)}
              onLoeschen={() => handleLoeschen(r.id)}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function NeuerReminderFormular({
  onAbbrechen,
  onSpeichern,
}: {
  onAbbrechen: () => void;
  onSpeichern: (r: Omit<Reminder, 'id'>) => void;
}) {
  const [zeitpunkt, setZeitpunkt] = useState(in7TagenLocal());
  const [nachricht, setNachricht] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (nachricht.trim() === '') return;
    onSpeichern({
      zeitpunkt: localDateTimeToISO(zeitpunkt),
      nachricht: nachricht.trim(),
      erledigt: false,
      auto_erstellt: false,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-stone-50 border border-stone-200 rounded-md p-3 mb-3 space-y-2"
    >
      <label className="block">
        <span className="text-xs font-medium text-stone-600">Wann</span>
        <input
          type="datetime-local"
          value={zeitpunkt}
          onChange={(e) => setZeitpunkt(e.target.value)}
          className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-600">Nachricht</span>
        <input
          type="text"
          value={nachricht}
          onChange={(e) => setNachricht(e.target.value)}
          placeholder="z. B. Nachfass-Mail schreiben"
          autoFocus
          className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onAbbrechen}
          className="text-sm text-stone-600 hover:text-stone-900 px-2 py-1"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={nachricht.trim() === ''}
          className="rounded-md bg-mm-orange text-white px-3 py-1 text-sm font-medium hover:bg-mm-orange-hover disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          Hinzufügen
        </button>
      </div>
    </form>
  );
}

function ReminderEintrag({
  reminder,
  onToggle,
  onLoeschen,
}: {
  reminder: Reminder;
  onToggle: () => void;
  onLoeschen: () => void;
}) {
  return (
    <li
      className={`group text-sm flex items-start gap-3 py-1.5 ${
        reminder.erledigt ? 'text-stone-400' : 'text-stone-800'
      }`}
    >
      <input
        type="checkbox"
        checked={reminder.erledigt}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
        aria-label={reminder.erledigt ? 'Als offen markieren' : 'Als erledigt markieren'}
      />
      <span className="text-stone-500 tabular-nums whitespace-nowrap min-w-[7.5rem]">
        {formatiereDatumZeit(reminder.zeitpunkt)}
      </span>
      <span className={`flex-1 ${reminder.erledigt ? 'line-through' : ''}`}>
        {reminder.nachricht}
        {reminder.auto_erstellt && !reminder.erledigt && (
          <span className="ml-2 text-xs text-stone-400">automatisch</span>
        )}
      </span>
      <button
        type="button"
        onClick={onLoeschen}
        className="text-stone-300 hover:text-red-600 transition-colors px-1 leading-none text-lg"
        aria-label="Erinnerung löschen"
      >
        ×
      </button>
    </li>
  );
}
