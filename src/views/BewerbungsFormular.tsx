import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Status } from '../types';
import { ALLE_STATUS } from '../types';
import type { NeueBewerbungEingabe } from '../data/storage';
import { parseJobTitel } from '../lib/jobTitelParser';

export type FormularModus = 'erstellen' | 'bearbeiten';

type Props = {
  modus: FormularModus;
  initialwerte: NeueBewerbungEingabe;
  abbrechenZiel: string;
  onSpeichern: (eingabe: NeueBewerbungEingabe) => void;
};

export function BewerbungsFormular({
  modus,
  initialwerte,
  abbrechenZiel,
  onSpeichern,
}: Props) {
  const [firma, setFirma] = useState(initialwerte.firma);
  const [position, setPosition] = useState(initialwerte.position);
  const [standort, setStandort] = useState(initialwerte.standort);
  const [bewerbungDatum, setBewerbungDatum] = useState(initialwerte.bewerbung_datum);
  const [status, setStatus] = useState<Status>(initialwerte.status);
  const [anzeigenUrl, setAnzeigenUrl] = useState(initialwerte.anzeigen_url);
  const [gehaltVorstellung, setGehaltVorstellung] = useState(
    initialwerte.gehalt_vorstellung === null
      ? ''
      : String(initialwerte.gehalt_vorstellung)
  );
  const [ansprechpartner, setAnsprechpartner] = useState(initialwerte.ansprechpartner);
  const [kontaktInfo, setKontaktInfo] = useState(initialwerte.kontakt_info);
  const [notizen, setNotizen] = useState(initialwerte.notizen);

  const [versucht, setVersucht] = useState(false);
  const [schnellText, setSchnellText] = useState('');
  const [erkannt, setErkannt] = useState<{ position?: string; firma?: string } | null>(null);

  function handleSchnellEingabe(text: string) {
    setSchnellText(text);
    if (!text.trim()) {
      setErkannt(null);
      return;
    }
    const result = parseJobTitel(text);
    if (result.position || result.firma) {
      if (result.position) setPosition(result.position);
      if (result.firma) setFirma(result.firma);
      setErkannt(result);
    } else {
      setErkannt(null);
    }
  }

  const firmaFehler = versucht && firma.trim() === '';
  const positionFehler = versucht && position.trim() === '';
  const formularGueltig = firma.trim() !== '' && position.trim() !== '';

  const titel = modus === 'erstellen' ? 'Neue Bewerbung' : 'Bewerbung bearbeiten';
  const speichernText =
    modus === 'erstellen' ? 'Bewerbung speichern' : 'Änderungen speichern';

  function handleSpeichern(event: FormEvent) {
    event.preventDefault();
    setVersucht(true);
    if (!formularGueltig) return;

    const eingabe: NeueBewerbungEingabe = {
      firma: firma.trim(),
      position: position.trim(),
      standort: standort.trim(),
      bewerbung_datum: bewerbungDatum,
      status,
      ansprechpartner: ansprechpartner.trim(),
      kontakt_info: kontaktInfo.trim(),
      anzeigen_url: anzeigenUrl.trim(),
      gehalt_vorstellung:
        gehaltVorstellung.trim() === '' ? null : Number(gehaltVorstellung),
      notizen: notizen.trim(),
    };

    onSpeichern(eingabe);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <header className="mb-4">
        <Link
          to={abbrechenZiel}
          className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          ← Abbrechen
        </Link>
      </header>

      <h1 className="text-2xl font-semibold text-stone-900 mb-2">{titel}</h1>
      {modus === 'erstellen' && (
        <p className="text-sm text-stone-600 mb-6">
          Pflicht sind nur <strong>Firma</strong> und{' '}
          <strong>Position</strong>. Alles andere kannst du jetzt eintragen oder
          später ergänzen.
        </p>
      )}
      {modus === 'bearbeiten' && <div className="mb-6" />}

      {modus === 'erstellen' && (
        <section className="bg-mm-cream-soft border border-mm-orange/30 rounded-lg p-4 mb-5">
          <label className="block">
            <span className="text-xs font-medium text-mm-orange-dark uppercase tracking-wide">
              Schnell-Erfassung — optional
            </span>
            <p className="text-xs text-stone-600 mt-1 mb-2 leading-relaxed">
              Kopiere die Stellen-Überschrift (z. B. von StepStone, Indeed,
              LinkedIn, Xing) hier rein — wir versuchen, Firma und Position
              automatisch zu erkennen. Du kannst sie unten korrigieren.
            </p>
            <textarea
              value={schnellText}
              onChange={(e) => handleSchnellEingabe(e.target.value)}
              placeholder="z. B. Senior Risk Manager (m/w/d) - Stadtsparkasse München - StepStone"
              rows={2}
              className="block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mm-orange/40 resize-y"
            />
          </label>
          {erkannt && (erkannt.position || erkannt.firma) && (
            <div className="text-xs text-stone-700 mt-2 leading-relaxed">
              ✓ Erkannt:{' '}
              {erkannt.position && (
                <strong className="text-mm-brown">{erkannt.position}</strong>
              )}
              {erkannt.position && erkannt.firma && <> bei </>}
              {erkannt.firma && (
                <strong className="text-mm-brown">{erkannt.firma}</strong>
              )}
              <span className="text-stone-500">
                {' '}— prüfe die Felder unten und korrigiere bei Bedarf.
              </span>
            </div>
          )}
        </section>
      )}

      <form onSubmit={handleSpeichern} className="space-y-5" noValidate>
        <section className="bg-white rounded-lg border border-stone-200 p-5 space-y-4">
          <FeldText
            label="Firma"
            wert={firma}
            setWert={setFirma}
            pflicht
            fehler={firmaFehler}
            placeholder="z. B. Stadtsparkasse München"
          />
          <FeldText
            label="Position"
            wert={position}
            setWert={setPosition}
            pflicht
            fehler={positionFehler}
            placeholder="z. B. Senior Risk Manager"
          />
          <FeldText
            label="Standort"
            wert={standort}
            setWert={setStandort}
            placeholder="z. B. München"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeldDatum
              label="Bewerbungsdatum"
              wert={bewerbungDatum}
              setWert={setBewerbungDatum}
              pflicht
            />
            <FeldStatus wert={status} setWert={setStatus} />
          </div>
        </section>

        <section className="bg-white rounded-lg border border-stone-200 p-5 space-y-4">
          <FeldText
            label="Link zur Anzeige"
            wert={anzeigenUrl}
            setWert={setAnzeigenUrl}
            placeholder="https://..."
            typ="url"
          />
          <FeldGehalt wert={gehaltVorstellung} setWert={setGehaltVorstellung} />
          <FeldText
            label="Ansprechpartner"
            wert={ansprechpartner}
            setWert={setAnsprechpartner}
            placeholder="z. B. Frau Dr. Schmidt"
          />
          <FeldText
            label="Kontakt"
            wert={kontaktInfo}
            setWert={setKontaktInfo}
            placeholder="E-Mail oder Telefon"
          />
        </section>

        <section className="bg-white rounded-lg border border-stone-200 p-5">
          <FeldNotizen wert={notizen} setWert={setNotizen} />
        </section>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Link
            to={abbrechenZiel}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900"
          >
            Abbrechen
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-mm-orange text-white px-5 py-2 text-sm font-medium hover:bg-mm-orange-hover transition-colors"
          >
            {speichernText}
          </button>
        </div>
      </form>
    </div>
  );
}

type FeldTextProps = {
  label: string;
  wert: string;
  setWert: (v: string) => void;
  pflicht?: boolean;
  fehler?: boolean;
  placeholder?: string;
  typ?: string;
};

function FeldText({
  label,
  wert,
  setWert,
  pflicht,
  fehler,
  placeholder,
  typ = 'text',
}: FeldTextProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">
        {label}
        {pflicht && <span className="text-red-600 ml-0.5">*</span>}
      </span>
      <input
        type={typ}
        value={wert}
        onChange={(e) => setWert(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 ${
          fehler ? 'border-red-400 focus:ring-red-400' : 'border-stone-300'
        }`}
      />
      {fehler && (
        <span className="text-xs text-red-600 mt-1 block">
          Dieses Feld ist Pflicht.
        </span>
      )}
    </label>
  );
}

function FeldDatum({
  label,
  wert,
  setWert,
  pflicht,
}: {
  label: string;
  wert: string;
  setWert: (v: string) => void;
  pflicht?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">
        {label}
        {pflicht && <span className="text-red-600 ml-0.5">*</span>}
      </span>
      <input
        type="date"
        value={wert}
        onChange={(e) => setWert(e.target.value)}
        className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
      />
    </label>
  );
}

function FeldStatus({
  wert,
  setWert,
}: {
  wert: Status;
  setWert: (v: Status) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">Status</span>
      <select
        value={wert}
        onChange={(e) => setWert(e.target.value as Status)}
        className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
      >
        {ALLE_STATUS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}

function FeldGehalt({
  wert,
  setWert,
}: {
  wert: string;
  setWert: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">
        Gehaltsvorstellung{' '}
        <span className="text-stone-400 font-normal">(optional)</span>
      </span>
      <div className="relative mt-1">
        <input
          type="number"
          inputMode="numeric"
          min="0"
          step="1000"
          value={wert}
          onChange={(e) => setWert(e.target.value)}
          placeholder="z. B. 85000"
          className="block w-full rounded-md border border-stone-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
          €
        </span>
      </div>
    </label>
  );
}

function FeldNotizen({
  wert,
  setWert,
}: {
  wert: string;
  setWert: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">
        Notizen <span className="text-stone-400 font-normal">(optional)</span>
      </span>
      <textarea
        value={wert}
        onChange={(e) => setWert(e.target.value)}
        rows={4}
        placeholder="z. B. Über LinkedIn entdeckt, Team scheint klein und sehr fachlich…"
        className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-y"
      />
    </label>
  );
}
