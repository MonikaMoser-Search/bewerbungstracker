import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Bewerbung, Interview, Reminder, Status } from '../types';
import { ALLE_STATUS } from '../types';
import {
  bewerbungAktualisieren,
  bewerbungLoeschen,
  ladeAppData,
} from '../data/storage';
import {
  statusFarbe,
  formatiereDatum,
  formatiereGehalt,
} from '../lib/format';
import { autoErinnerungenFuerStatus, coachingTipps } from '../lib/coaching';
import { reminderAbsagen, reminderPlanen } from '../lib/notifications';
import { ErinnerungenSektion } from '../components/ErinnerungenSektion';
import { InterviewsSektion } from '../components/InterviewsSektion';

export function BewerbungsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bewerbung, setBewerbung] = useState<Bewerbung | null | undefined>(undefined);
  const [coachingNachricht, setCoachingNachricht] = useState<string | null>(null);

  useEffect(() => {
    const data = ladeAppData();
    const gefunden = data.bewerbungen.find((b) => b.id === id);
    setBewerbung(gefunden ?? null);
  }, [id]);

  useEffect(() => {
    if (coachingNachricht === null) return;
    const timer = setTimeout(() => setCoachingNachricht(null), 12000);
    return () => clearTimeout(timer);
  }, [coachingNachricht]);

  function handleLoeschen() {
    if (!bewerbung) return;
    const bestaetigt = window.confirm(
      `Bewerbung „${bewerbung.firma} – ${bewerbung.position}" wirklich löschen?\n\nDie Bewerbung wird unwiderruflich entfernt.`
    );
    if (!bestaetigt) return;
    bewerbung.reminders.forEach((r) => reminderAbsagen(r.id));
    bewerbungLoeschen(bewerbung.id);
    navigate('/');
  }

  function handleStatusWechsel(neuerStatus: Status) {
    if (!bewerbung || neuerStatus === bewerbung.status) return;

    const daten = ladeAppData();
    const coachingAktiv = daten.einstellungen.coaching_aktiv;
    const autoReminderAktiv = daten.einstellungen.auto_reminder_aktiv;
    const reminderTage = daten.einstellungen.reminder_default_tage;

    const neueAutoReminders: Reminder[] = autoReminderAktiv
      ? autoErinnerungenFuerStatus(
          neuerStatus,
          bewerbung.firma,
          reminderTage
        ).map((r) => ({ ...r, id: crypto.randomUUID() }))
      : [];

    const aktualisiert: Bewerbung = {
      ...bewerbung,
      status: neuerStatus,
      status_geaendert_am: new Date().toISOString(),
      reminders: [...bewerbung.reminders, ...neueAutoReminders],
    };

    bewerbungAktualisieren(aktualisiert);
    setBewerbung(aktualisiert);

    neueAutoReminders.forEach((r) =>
      reminderPlanen(r, { id: aktualisiert.id, firma: aktualisiert.firma })
    );

    if (coachingAktiv) {
      const tipp = coachingTipps[neuerStatus];
      if (tipp) setCoachingNachricht(tipp);
    }
  }

  function handleRemindersUpdate(neueReminders: Reminder[]) {
    if (!bewerbung) return;

    const alteIds = new Set(bewerbung.reminders.map((r) => r.id));
    const neueIds = new Set(neueReminders.map((r) => r.id));
    const ziel = { id: bewerbung.id, firma: bewerbung.firma };

    bewerbung.reminders.forEach((alter) => {
      if (!neueIds.has(alter.id)) reminderAbsagen(alter.id);
    });
    neueReminders.forEach((neuer) => {
      const alter = bewerbung.reminders.find((r) => r.id === neuer.id);
      if (!alteIds.has(neuer.id)) {
        reminderPlanen(neuer, ziel);
      } else if (alter && alter.erledigt !== neuer.erledigt) {
        reminderAbsagen(neuer.id);
        if (!neuer.erledigt) reminderPlanen(neuer, ziel);
      }
    });

    const aktualisiert: Bewerbung = { ...bewerbung, reminders: neueReminders };
    bewerbungAktualisieren(aktualisiert);
    setBewerbung(aktualisiert);
  }

  function handleInterviewAdd(neuer: Omit<Interview, 'id'>) {
    if (!bewerbung) return;
    const interview: Interview = { ...neuer, id: crypto.randomUUID() };
    let aktualisiert: Bewerbung = {
      ...bewerbung,
      interviews: [...bewerbung.interviews, interview],
    };

    const autoStatusKandidaten: Status[] = ['Beworben', 'Eingangsbestätigung'];
    const sollAutoStatus =
      autoStatusKandidaten.includes(bewerbung.status) &&
      bewerbung.status !== 'Interview geplant';

    if (sollAutoStatus) {
      aktualisiert = {
        ...aktualisiert,
        status: 'Interview geplant',
        status_geaendert_am: new Date().toISOString(),
      };
    }

    bewerbungAktualisieren(aktualisiert);
    setBewerbung(aktualisiert);

    if (sollAutoStatus) {
      const daten = ladeAppData();
      if (daten.einstellungen.coaching_aktiv) {
        setCoachingNachricht(
          'Status automatisch auf „Interview geplant" gesetzt — du kannst den Status oben jederzeit ändern.'
        );
      }
    }
  }

  function handleInterviewAktualisieren(aktualisierterInterview: Interview) {
    if (!bewerbung) return;
    const aktualisiert: Bewerbung = {
      ...bewerbung,
      interviews: bewerbung.interviews.map((iv) =>
        iv.id === aktualisierterInterview.id ? aktualisierterInterview : iv
      ),
    };
    bewerbungAktualisieren(aktualisiert);
    setBewerbung(aktualisiert);
  }

  function handleInterviewLoeschen(id: string) {
    if (!bewerbung) return;
    const aktualisiert: Bewerbung = {
      ...bewerbung,
      interviews: bewerbung.interviews.filter((iv) => iv.id !== id),
    };
    bewerbungAktualisieren(aktualisiert);
    setBewerbung(aktualisiert);
  }

  if (bewerbung === undefined) return null;

  if (bewerbung === null) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 text-center">
        <p className="text-stone-700 mb-3">Bewerbung nicht gefunden.</p>
        <Link to="/" className="text-mm-orange-dark hover:underline">
          Zurück zur Liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {coachingNachricht && (
        <CoachingToast
          nachricht={coachingNachricht}
          onSchliessen={() => setCoachingNachricht(null)}
        />
      )}

      <header className="mb-4 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          ← Zurück zur Liste
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={`/bewerbung/${bewerbung.id}/bearbeiten`}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          >
            Bearbeiten
          </Link>
          <button
            type="button"
            onClick={handleLoeschen}
            className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          >
            Löschen
          </button>
        </div>
      </header>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-stone-900">{bewerbung.firma}</h1>
            <p className="text-stone-700 mt-0.5">{bewerbung.position}</p>
          </div>
          <StatusWaehler
            aktuellerStatus={bewerbung.status}
            onStatusWechsel={handleStatusWechsel}
          />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <Feld label="Beworben am" wert={formatiereDatum(bewerbung.bewerbung_datum)} />
          {bewerbung.standort && <Feld label="Standort" wert={bewerbung.standort} />}
          {bewerbung.ansprechpartner && (
            <Feld label="Ansprechpartner" wert={bewerbung.ansprechpartner} />
          )}
          {bewerbung.kontakt_info && (
            <Feld label="Kontakt" wert={bewerbung.kontakt_info} />
          )}
          {bewerbung.gehalt_vorstellung !== null && (
            <Feld
              label="Gehaltsvorstellung"
              wert={formatiereGehalt(bewerbung.gehalt_vorstellung)}
            />
          )}
          {bewerbung.anzeigen_url && (
            <Feld
              label="Stellenanzeige"
              wert={
                <a
                  href={bewerbung.anzeigen_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mm-orange-dark hover:underline"
                >
                  Link öffnen
                </a>
              }
            />
          )}
        </dl>
      </section>

      {bewerbung.notizen && (
        <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
          <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
            Notizen
          </h2>
          <p className="text-stone-800 whitespace-pre-wrap text-sm leading-relaxed">
            {bewerbung.notizen}
          </p>
        </section>
      )}

      <ErinnerungenSektion
        reminders={bewerbung.reminders}
        onUpdate={handleRemindersUpdate}
      />

      <InterviewsSektion
        interviews={bewerbung.interviews}
        onAdd={handleInterviewAdd}
        onAktualisieren={handleInterviewAktualisieren}
        onLoeschen={handleInterviewLoeschen}
      />
    </div>
  );
}

function Feld({ label, wert }: { label: string; wert: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-stone-500 mb-0.5">{label}</dt>
      <dd className="text-stone-800">{wert}</dd>
    </div>
  );
}

function StatusWaehler({
  aktuellerStatus,
  onStatusWechsel,
}: {
  aktuellerStatus: Status;
  onStatusWechsel: (s: Status) => void;
}) {
  const [offen, setOffen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!offen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOffen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [offen]);

  function handleAuswahl(neuerStatus: Status) {
    setOffen(false);
    onStatusWechsel(neuerStatus);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOffen((v) => !v)}
        className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-shadow hover:shadow-sm ${statusFarbe[aktuellerStatus]}`}
        aria-haspopup="listbox"
        aria-expanded={offen}
      >
        {aktuellerStatus} ▾
      </button>
      {offen && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-2 w-52 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-20"
        >
          {ALLE_STATUS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => handleAuswahl(s)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-stone-50 flex items-center justify-between gap-2 ${
                  s === aktuellerStatus ? 'font-semibold' : ''
                }`}
              >
                <span>{s}</span>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${statusFarbe[s].split(' ')[0]}`}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CoachingToast({
  nachricht,
  onSchliessen,
}: {
  nachricht: string;
  onSchliessen: () => void;
}) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="bg-mm-cream border border-mm-orange/30 text-mm-brown rounded-lg px-4 py-3 shadow-lg flex items-start gap-3">
        <div className="flex-1 text-sm leading-relaxed">
          <div className="text-xs font-semibold uppercase tracking-wide text-mm-orange-dark mb-1">
            Tipp aus der Personalberatung
          </div>
          {nachricht}
        </div>
        <button
          type="button"
          onClick={onSchliessen}
          className="text-mm-orange-dark hover:text-amber-900 leading-none text-xl -mt-1"
          aria-label="Schließen"
        >
          ×
        </button>
      </div>
    </div>
  );
}
