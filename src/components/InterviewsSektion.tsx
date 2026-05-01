import { useState, type FormEvent } from 'react';
import type { Interview, InterviewRunde, InterviewTyp } from '../types';
import { formatiereDatumZeit } from '../lib/format';

const ALLE_TYPEN: InterviewTyp[] = ['Telefon', 'Video', 'Persönlich', 'Sonstiges'];
const ALLE_RUNDEN: InterviewRunde[] = [
  '1. Runde',
  '2. Runde',
  '3. Runde',
  'Final',
  'Andere',
];

function morgen10UhrLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function isoToLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function localToISO(local: string): string {
  return new Date(local).toISOString();
}

type Props = {
  interviews: Interview[];
  onAdd: (neuer: Omit<Interview, 'id'>) => void;
  onAktualisieren: (aktualisiert: Interview) => void;
  onLoeschen: (id: string) => void;
};

export function InterviewsSektion({
  interviews,
  onAdd,
  onAktualisieren,
  onLoeschen,
}: Props) {
  const [hinzufuegenOffen, setHinzufuegenOffen] = useState(false);

  const sortiert = [...interviews].sort(
    (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
  );

  function handleAdd(daten: Omit<Interview, 'id'>) {
    onAdd(daten);
    setHinzufuegenOffen(false);
  }

  return (
    <section className="bg-white rounded-lg border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          Interviews
          {sortiert.length > 0 && (
            <span className="ml-2 text-stone-500 normal-case">
              · {sortiert.length}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => setHinzufuegenOffen((v) => !v)}
          className="text-sm text-stone-600 hover:text-stone-900"
        >
          {hinzufuegenOffen ? 'Abbrechen' : '+ Interview anlegen'}
        </button>
      </div>

      {hinzufuegenOffen && (
        <InterviewFormular
          modus="neu"
          onAbbrechen={() => setHinzufuegenOffen(false)}
          onSpeichern={handleAdd}
        />
      )}

      {sortiert.length === 0 && !hinzufuegenOffen ? (
        <p className="text-sm text-stone-500">Keine Interviews erfasst.</p>
      ) : sortiert.length > 0 ? (
        <ul className="space-y-3 mt-2">
          {sortiert.map((iv) => (
            <InterviewKarte
              key={iv.id}
              interview={iv}
              onAktualisieren={onAktualisieren}
              onLoeschen={() => onLoeschen(iv.id)}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function InterviewKarte({
  interview,
  onAktualisieren,
  onLoeschen,
}: {
  interview: Interview;
  onAktualisieren: (i: Interview) => void;
  onLoeschen: () => void;
}) {
  const [bearbeiten, setBearbeiten] = useState(false);

  if (bearbeiten) {
    return (
      <li className="border-l-2 border-stone-300 pl-4">
        <InterviewFormular
          modus="bearbeiten"
          initialwerte={interview}
          onAbbrechen={() => setBearbeiten(false)}
          onSpeichern={(daten) => {
            onAktualisieren({ ...interview, ...daten });
            setBearbeiten(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className="border-l-2 border-stone-300 pl-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium text-stone-900">
          {interview.runde} · {interview.typ} ·{' '}
          {formatiereDatumZeit(interview.datum)}
        </div>
        <div className="flex items-center gap-1 -mr-1">
          <button
            type="button"
            onClick={() => setBearbeiten(true)}
            className="text-xs text-stone-500 hover:text-stone-900 px-2 py-1"
          >
            Bearbeiten
          </button>
          <button
            type="button"
            onClick={onLoeschen}
            className="text-stone-300 hover:text-red-600 transition-colors px-1 leading-none text-lg"
            aria-label="Interview löschen"
          >
            ×
          </button>
        </div>
      </div>
      {interview.teilnehmer && (
        <div className="text-sm text-stone-600 mt-1">
          Mit: {interview.teilnehmer}
        </div>
      )}
      {interview.ort_oder_link && (
        <div className="text-sm text-stone-600 mt-1">
          {interview.typ === 'Persönlich' ? 'Ort: ' : 'Link: '}
          {interview.ort_oder_link.startsWith('http') ? (
            <a
              href={interview.ort_oder_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {interview.ort_oder_link}
            </a>
          ) : (
            interview.ort_oder_link
          )}
        </div>
      )}
      {interview.meine_fragen && (
        <div className="mt-2">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            Vorbereitung
          </div>
          <p className="text-sm text-stone-700 whitespace-pre-wrap mt-0.5">
            {interview.meine_fragen}
          </p>
        </div>
      )}
      {interview.notizen_nachher && (
        <div className="mt-2">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            Notizen danach
          </div>
          <p className="text-sm text-stone-700 whitespace-pre-wrap italic mt-0.5">
            „{interview.notizen_nachher}"
          </p>
        </div>
      )}
    </li>
  );
}

type FormularProps = {
  modus: 'neu' | 'bearbeiten';
  initialwerte?: Interview;
  onAbbrechen: () => void;
  onSpeichern: (daten: Omit<Interview, 'id'>) => void;
};

function InterviewFormular({
  modus,
  initialwerte,
  onAbbrechen,
  onSpeichern,
}: FormularProps) {
  const [datum, setDatum] = useState(
    initialwerte ? isoToLocal(initialwerte.datum) : morgen10UhrLocal()
  );
  const [typ, setTyp] = useState<InterviewTyp>(initialwerte?.typ ?? 'Video');
  const [runde, setRunde] = useState<InterviewRunde>(
    initialwerte?.runde ?? '1. Runde'
  );
  const [teilnehmer, setTeilnehmer] = useState(initialwerte?.teilnehmer ?? '');
  const [ortOderLink, setOrtOderLink] = useState(
    initialwerte?.ort_oder_link ?? ''
  );
  const [meineFragen, setMeineFragen] = useState(
    initialwerte?.meine_fragen ?? ''
  );
  const [notizenNachher, setNotizenNachher] = useState(
    initialwerte?.notizen_nachher ?? ''
  );

  const ortLinkLabel =
    typ === 'Persönlich'
      ? 'Ort'
      : typ === 'Telefon'
        ? 'Telefonnummer (optional)'
        : 'Link (optional)';
  const ortLinkPlaceholder =
    typ === 'Persönlich'
      ? 'z. B. Königinstraße 28, München'
      : typ === 'Telefon'
        ? 'z. B. +49 89 1234567'
        : 'z. B. https://teams.microsoft.com/...';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSpeichern({
      datum: localToISO(datum),
      typ,
      runde,
      teilnehmer: teilnehmer.trim(),
      ort_oder_link: ortOderLink.trim(),
      meine_fragen: meineFragen.trim(),
      notizen_nachher: notizenNachher.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-stone-50 border border-stone-200 rounded-md p-4 mb-3 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-stone-600">Datum & Uhrzeit</span>
          <input
            type="datetime-local"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-stone-600">Typ</span>
            <select
              value={typ}
              onChange={(e) => setTyp(e.target.value as InterviewTyp)}
              className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              {ALLE_TYPEN.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-stone-600">Runde</span>
            <select
              value={runde}
              onChange={(e) => setRunde(e.target.value as InterviewRunde)}
              className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              {ALLE_RUNDEN.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-stone-600">
          Teilnehmer <span className="text-stone-400 font-normal">(optional)</span>
        </span>
        <input
          type="text"
          value={teilnehmer}
          onChange={(e) => setTeilnehmer(e.target.value)}
          placeholder="z. B. Frau Schmidt (HR), Herr Becker (Fachbereich)"
          className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-stone-600">{ortLinkLabel}</span>
        <input
          type="text"
          value={ortOderLink}
          onChange={(e) => setOrtOderLink(e.target.value)}
          placeholder={ortLinkPlaceholder}
          className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-stone-600">
          Vorbereitung / meine Fragen{' '}
          <span className="text-stone-400 font-normal">(optional)</span>
        </span>
        <textarea
          value={meineFragen}
          onChange={(e) => setMeineFragen(e.target.value)}
          rows={3}
          placeholder={'z. B. Wer ist mein Gegenüber? Was ist meine Antwort auf „Warum wir?"'}
          className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-y"
        />
      </label>

      {modus === 'bearbeiten' && (
        <label className="block">
          <span className="text-xs font-medium text-stone-600">
            Notizen nach dem Interview{' '}
            <span className="text-stone-400 font-normal">(optional)</span>
          </span>
          <textarea
            value={notizenNachher}
            onChange={(e) => setNotizenNachher(e.target.value)}
            rows={3}
            placeholder="Was wurde besprochen? Erste Eindrücke?"
            className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-y"
          />
        </label>
      )}

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
          className="rounded-md bg-mm-orange text-white px-3 py-1 text-sm font-medium hover:bg-mm-orange-hover"
        >
          {modus === 'neu' ? 'Anlegen' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}
