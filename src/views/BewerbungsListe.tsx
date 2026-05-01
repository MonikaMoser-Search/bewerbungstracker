import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AppData, Bewerbung, Status } from '../types';
import { ALLE_STATUS } from '../types';
import { bewerbungLoeschen, ladeAppData } from '../data/storage';
import { reminderAbsagen } from '../lib/notifications';
import { statusFarbe, formatiereDatum } from '../lib/format';
import {
  BackupErinnerungBanner,
  FaelligeRemindersBanner,
  faelligeRemindersFinden,
} from '../components/StartBanner';

const BACKUP_ERINNERUNG_TAGE = 7;

type StatusFilter = Status | 'Alle' | 'Aktiv';

const ABGESCHLOSSEN: Status[] = ['Angenommen', 'Absage', 'Zurückgezogen'];

export function BewerbungsListe() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [bewerbungen, setBewerbungen] = useState<Bewerbung[] | null>(null);
  const [suche, setSuche] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Aktiv');

  useEffect(() => {
    const data = ladeAppData();
    setAppData(data);
    const sortiert = [...data.bewerbungen].sort(
      (a, b) =>
        new Date(b.aktualisiert_am).getTime() -
        new Date(a.aktualisiert_am).getTime()
    );
    setBewerbungen(sortiert);
  }, []);

  const faellige = useMemo(
    () => (bewerbungen ? faelligeRemindersFinden(bewerbungen) : []),
    [bewerbungen]
  );

  function handleDemoLoeschen(b: Bewerbung) {
    if (!bewerbungen) return;
    b.reminders.forEach((r) => reminderAbsagen(r.id));
    bewerbungLoeschen(b.id);
    setBewerbungen(bewerbungen.filter((x) => x.id !== b.id));
  }

  const gefiltert = useMemo(() => {
    if (bewerbungen === null) return [];
    const sucheNorm = suche.trim().toLowerCase();
    return bewerbungen.filter((b) => {
      if (statusFilter === 'Aktiv') {
        if (ABGESCHLOSSEN.includes(b.status)) return false;
      } else if (statusFilter !== 'Alle' && b.status !== statusFilter) {
        return false;
      }
      if (sucheNorm) {
        const treffer =
          b.firma.toLowerCase().includes(sucheNorm) ||
          b.position.toLowerCase().includes(sucheNorm) ||
          b.standort.toLowerCase().includes(sucheNorm) ||
          b.notizen.toLowerCase().includes(sucheNorm) ||
          b.ansprechpartner.toLowerCase().includes(sucheNorm);
        if (!treffer) return false;
      }
      return true;
    });
  }, [bewerbungen, suche, statusFilter]);

  if (bewerbungen === null) {
    return null;
  }

  const gesamt = bewerbungen.length;
  const sichtbar = gefiltert.length;
  const filterAktiv = sichtbar !== gesamt;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <header className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Bewerbungstracker</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {gesamt === 0
              ? 'Keine Bewerbungen erfasst'
              : filterAktiv
                ? `${sichtbar} von ${gesamt} ${gesamt === 1 ? 'Bewerbung' : 'Bewerbungen'}`
                : `${gesamt} ${gesamt === 1 ? 'Bewerbung' : 'Bewerbungen'}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/einstellungen"
            className="rounded-lg border border-stone-300 bg-white text-stone-700 px-3 py-2 text-sm font-medium hover:bg-stone-50 transition-colors whitespace-nowrap"
          >
            Einstellungen
          </Link>
          <Link
            to="/neu"
            className="rounded-lg bg-mm-orange text-white px-4 py-2 text-sm font-medium hover:bg-mm-orange-hover transition-colors whitespace-nowrap"
          >
            + Neue Bewerbung
          </Link>
        </div>
      </header>

      {faellige.length > 0 && <FaelligeRemindersBanner items={faellige} />}

      {gesamt > 0 && appData && (
        <BackupErinnerungBanner
          letzterBackup={appData.einstellungen.letzter_export}
          schwelleTage={BACKUP_ERINNERUNG_TAGE}
        />
      )}

      {gesamt > 0 && (
        <FilterLeiste
          suche={suche}
          setSuche={setSuche}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      )}

      {gesamt === 0 ? (
        <EmptyState />
      ) : sichtbar === 0 ? (
        <KeinTreffer onZuruecksetzen={() => {
          setSuche('');
          setStatusFilter('Alle');
        }} />
      ) : (
        <ul className="space-y-2">
          {gefiltert.map((b) => (
            <BewerbungCard
              key={b.id}
              bewerbung={b}
              onDemoLoeschen={handleDemoLoeschen}
            />
          ))}
        </ul>
      )}

      <footer className="mt-10 pt-6 border-t border-stone-200 text-xs text-stone-500 text-center">
        Entwickelt von{' '}
        <a
          href="https://www.mmsearch.de"
          target="_blank"
          rel="noopener noreferrer"
          className="text-mm-orange-dark hover:underline"
        >
          Monika Moser Executive Search
        </a>
        <span className="block mt-1 text-stone-400">
          Deine Daten bleiben bei dir — wir sehen nichts davon.
        </span>
        <nav className="mt-3 flex justify-center gap-4">
          <Link to="/impressum" className="hover:text-stone-700 hover:underline">
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:text-stone-700 hover:underline">
            Datenschutz
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function FilterLeiste({
  suche,
  setSuche,
  statusFilter,
  setStatusFilter,
}: {
  suche: string;
  setSuche: (v: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="relative flex-1">
        <input
          type="search"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Firma, Position, Notizen…"
          className="block w-full rounded-md border border-stone-300 bg-white px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        {suche && (
          <button
            type="button"
            onClick={() => setSuche('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 leading-none text-lg px-1"
            aria-label="Suche zurücksetzen"
          >
            ×
          </button>
        )}
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 sm:w-auto"
      >
        <option value="Aktiv">Aktive Bewerbungen</option>
        <option value="Alle">Alle Bewerbungen</option>
        <optgroup label="Nur Status">
          {ALLE_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 p-10 text-center bg-white">
      <p className="text-stone-700 mb-1">Noch keine Bewerbungen erfasst.</p>
      <p className="text-sm text-stone-500">
        Tippe oben auf „+ Neue Bewerbung", um zu starten.
      </p>
    </div>
  );
}

function KeinTreffer({ onZuruecksetzen }: { onZuruecksetzen: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center bg-white">
      <p className="text-stone-700 mb-3">Keine Bewerbung passt zu deinen Filtern.</p>
      <button
        type="button"
        onClick={onZuruecksetzen}
        className="text-sm text-mm-orange-dark hover:underline"
      >
        Filter zurücksetzen
      </button>
    </div>
  );
}

function BewerbungCard({
  bewerbung,
  onDemoLoeschen,
}: {
  bewerbung: Bewerbung;
  onDemoLoeschen: (b: Bewerbung) => void;
}) {
  const offeneReminder = bewerbung.reminders.filter((r) => !r.erledigt).length;

  function handleDemoEntfernen(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    onDemoLoeschen(bewerbung);
  }

  return (
    <li>
      <Link
        to={`/bewerbung/${bewerbung.id}`}
        className="block rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400 hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-medium text-stone-900 truncate">
                {bewerbung.firma}
              </h2>
              {bewerbung.ist_demo && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleDemoEntfernen}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleDemoEntfernen(e);
                  }}
                  className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-700 transition-colors flex-shrink-0 cursor-pointer select-none"
                  aria-label={`Beispiel-Bewerbung ${bewerbung.firma} entfernen`}
                >
                  Beispiel ×
                </span>
              )}
            </div>
            <p className="text-sm text-stone-600 truncate">{bewerbung.position}</p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusFarbe[bewerbung.status]}`}
          >
            {bewerbung.status}
          </span>
        </div>
        <div className="text-xs text-stone-500 flex flex-wrap gap-x-3 gap-y-1">
          <span>Beworben: {formatiereDatum(bewerbung.bewerbung_datum)}</span>
          {bewerbung.standort && <span>· {bewerbung.standort}</span>}
          {offeneReminder > 0 && (
            <span className="text-mm-orange-dark">
              · {offeneReminder} {offeneReminder === 1 ? 'Erinnerung' : 'Erinnerungen'}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
