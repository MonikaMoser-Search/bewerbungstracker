import { useState, type FormEvent } from 'react';
import { passwortStaerke } from '../lib/crypto';

type Modus = 'neu' | 'eingabe';

type Props = {
  modus: Modus;
  titel: string;
  beschreibung: string;
  arbeitend?: boolean;
  fehler?: string;
  onAbbrechen: () => void;
  onBestaetigen: (passwort: string) => void;
};

export function PasswortDialog({
  modus,
  titel,
  beschreibung,
  arbeitend = false,
  fehler,
  onAbbrechen,
  onBestaetigen,
}: Props) {
  const [passwort, setPasswort] = useState('');
  const [wiederholung, setWiederholung] = useState('');
  const [zeigen, setZeigen] = useState(false);
  const [bestaetigt, setBestaetigt] = useState(false);

  const staerke = modus === 'neu' ? passwortStaerke(passwort) : null;
  const passwoerterIdentisch = passwort === wiederholung;
  const langGenug = passwort.length >= 12;

  const kannSpeichern =
    modus === 'eingabe'
      ? passwort.length > 0 && !arbeitend
      : langGenug && passwoerterIdentisch && bestaetigt && !arbeitend;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!kannSpeichern) return;
    onBestaetigen(passwort);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onAbbrechen}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-stone-900 mb-2">{titel}</h2>
        <p className="text-sm text-stone-600 mb-4 leading-relaxed">{beschreibung}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block">
              <span className="text-sm font-medium text-stone-700">Master-Passwort</span>
              <div className="relative mt-1">
                <input
                  type={zeigen ? 'text' : 'password'}
                  value={passwort}
                  onChange={(e) => setPasswort(e.target.value)}
                  autoFocus
                  autoComplete={modus === 'neu' ? 'new-password' : 'current-password'}
                  className="block w-full rounded-md border border-stone-300 px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setZeigen((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-800 px-1"
                  tabIndex={-1}
                >
                  {zeigen ? 'verbergen' : 'zeigen'}
                </button>
              </div>
            </label>

            {modus === 'neu' && passwort.length > 0 && staerke && (
              <StaerkeAnzeige staerke={staerke} />
            )}

            {modus === 'neu' && passwort.length > 0 && passwort.length < 12 && (
              <p className="text-xs text-mm-orange-dark mt-1">
                Mindestens 12 Zeichen — länger ist besser.
              </p>
            )}
          </div>

          {modus === 'neu' && (
            <label className="block">
              <span className="text-sm font-medium text-stone-700">
                Passwort wiederholen
              </span>
              <input
                type={zeigen ? 'text' : 'password'}
                value={wiederholung}
                onChange={(e) => setWiederholung(e.target.value)}
                autoComplete="new-password"
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 ${
                  wiederholung && !passwoerterIdentisch
                    ? 'border-red-400'
                    : 'border-stone-300'
                }`}
              />
              {wiederholung && !passwoerterIdentisch && (
                <p className="text-xs text-red-600 mt-1">
                  Passwörter stimmen nicht überein.
                </p>
              )}
            </label>
          )}

          {modus === 'neu' && (
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={bestaetigt}
                onChange={(e) => setBestaetigt(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400"
              />
              <span className="text-xs text-stone-700 leading-relaxed">
                Ich habe mein Passwort sicher notiert. Ich verstehe, dass MM
                Executive Search es nicht wiederherstellen kann — wenn ich es
                verliere, sind die Backups verloren.
              </span>
            </label>
          )}

          {fehler && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
              {fehler}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onAbbrechen}
              disabled={arbeitend}
              className="text-sm text-stone-600 hover:text-stone-900 px-3 py-1.5 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!kannSpeichern}
              className="rounded-md bg-mm-orange text-white px-4 py-1.5 text-sm font-medium hover:bg-mm-orange-hover disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              {arbeitend
                ? 'Bitte warten…'
                : modus === 'neu'
                  ? 'Verschlüsseln & speichern'
                  : 'Entschlüsseln'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StaerkeAnzeige({
  staerke,
}: {
  staerke: ReturnType<typeof passwortStaerke>;
}) {
  const farben = [
    'bg-red-400',
    'bg-red-400',
    'bg-amber-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-emerald-500',
  ];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < staerke.punkte ? farben[staerke.punkte] : 'bg-stone-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-stone-500">Stärke: {staerke.label}</p>
    </div>
  );
}
