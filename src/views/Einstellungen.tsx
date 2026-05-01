import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AppData, Einstellungen as EinstellungenTyp } from '../types';
import {
  alleDatenAlsJson,
  alleDatenImportieren,
  alleDatenZuruecksetzen,
  einstellungenAktualisieren,
  ladeAppData,
  speichereAppData,
} from '../data/storage';
import {
  entschluesseln,
  istVerschluesselteDatei,
  verschluesseln,
  type VerschluesselteDatei,
} from '../lib/crypto';
import {
  alleRemindersNeuPlanen,
  notificationPermissionAnfragen,
  notificationStatus,
  type NotificationStatus,
} from '../lib/notifications';
import { PasswortDialog } from '../components/PasswortDialog';
import {
  BackupImportDialog,
  diffBerechnen,
  type ImportDiff,
} from '../components/BackupImportDialog';

type Dialog =
  | { typ: 'keiner' }
  | { typ: 'passwort-erstellen'; arbeitend: boolean }
  | {
      typ: 'passwort-laden';
      verschluesselt: VerschluesselteDatei;
      arbeitend: boolean;
      fehler?: string;
    }
  | { typ: 'import-bestaetigen'; importDaten: AppData; diff: ImportDiff };

export function Einstellungen() {
  const [einstellungen, setEinstellungen] = useState<EinstellungenTyp | null>(null);
  const [meldung, setMeldung] = useState<{ typ: 'erfolg' | 'fehler'; text: string } | null>(null);
  const [dialog, setDialog] = useState<Dialog>({ typ: 'keiner' });
  const [notiStatus, setNotiStatus] = useState<NotificationStatus>('default');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const verschluesseltImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const daten = ladeAppData();
    setEinstellungen(daten.einstellungen);
    notificationStatus().then(setNotiStatus);
  }, []);

  useEffect(() => {
    if (meldung === null) return;
    const timer = setTimeout(() => setMeldung(null), 6000);
    return () => clearTimeout(timer);
  }, [meldung]);

  function handleCoachingUmschalten(neuerWert: boolean) {
    if (!einstellungen) return;
    const aktualisiert = { ...einstellungen, coaching_aktiv: neuerWert };
    setEinstellungen(aktualisiert);
    einstellungenAktualisieren({ coaching_aktiv: neuerWert });
  }

  function handleAutoReminderUmschalten(neuerWert: boolean) {
    if (!einstellungen) return;
    const aktualisiert = { ...einstellungen, auto_reminder_aktiv: neuerWert };
    setEinstellungen(aktualisiert);
    einstellungenAktualisieren({ auto_reminder_aktiv: neuerWert });
  }

  function handleReminderTageAendern(neuerWert: number) {
    if (!einstellungen) return;
    if (Number.isNaN(neuerWert) || neuerWert < 1 || neuerWert > 90) return;
    const aktualisiert = { ...einstellungen, reminder_default_tage: neuerWert };
    setEinstellungen(aktualisiert);
    einstellungenAktualisieren({ reminder_default_tage: neuerWert });
  }

  function handleExport() {
    const json = alleDatenAlsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const datum = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `bewerbungstracker-${datum}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    einstellungenAktualisieren({ letzter_export: new Date().toISOString() });
    setMeldung({ typ: 'erfolg', text: 'Daten wurden als JSON heruntergeladen.' });
  }

  function handleImportKlick() {
    fileInputRef.current?.click();
  }

  function handleImportDatei(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const bestaetigt = window.confirm(
      'Beim Importieren werden alle aktuellen Bewerbungen ersetzt.\n\nFortfahren?'
    );
    if (!bestaetigt) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        alleDatenImportieren(String(reader.result));
        setMeldung({ typ: 'erfolg', text: 'Daten erfolgreich importiert.' });
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        setMeldung({
          typ: 'fehler',
          text: `Import fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    };
    reader.readAsText(file);
  }

  async function handleNotificationsAktivieren() {
    const neuerStatus = await notificationPermissionAnfragen();
    setNotiStatus(neuerStatus);
    if (neuerStatus === 'granted') {
      const daten = ladeAppData();
      await alleRemindersNeuPlanen(daten.bewerbungen);
      setMeldung({
        typ: 'erfolg',
        text: 'Benachrichtigungen aktiviert. Deine offenen Erinnerungen sind eingeplant.',
      });
    } else if (neuerStatus === 'denied') {
      setMeldung({
        typ: 'fehler',
        text: 'Berechtigung verweigert. Du kannst sie in den Browser-Einstellungen erlauben.',
      });
    }
  }

  function handleZuruecksetzen() {
    const bestaetigt = window.confirm(
      'Alle Bewerbungen werden gelöscht und die Demo-Daten neu geladen.\n\nDieser Schritt kann nicht rückgängig gemacht werden. Fortfahren?'
    );
    if (!bestaetigt) return;
    alleDatenZuruecksetzen();
    window.location.reload();
  }

  function handleVerschluesseltesBackupErstellen() {
    setDialog({ typ: 'passwort-erstellen', arbeitend: false });
  }

  async function handlePasswortFuerErstellenBestaetigt(passwort: string) {
    setDialog({ typ: 'passwort-erstellen', arbeitend: true });
    try {
      const json = alleDatenAlsJson();
      const verschluesselt = await verschluesseln(json, passwort);
      const blob = new Blob([JSON.stringify(verschluesselt, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const datum = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `bewerbungstracker-verschluesselt-${datum}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      einstellungenAktualisieren({ letzter_export: new Date().toISOString() });
      setDialog({ typ: 'keiner' });
      setMeldung({
        typ: 'erfolg',
        text: 'Verschlüsseltes Backup wurde heruntergeladen. Lege es in deinen Cloud-Ordner.',
      });
    } catch (err) {
      setDialog({ typ: 'keiner' });
      setMeldung({
        typ: 'fehler',
        text: `Verschlüsselung fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  function handleVerschluesseltesBackupLaden() {
    verschluesseltImportRef.current?.click();
  }

  function handleVerschluesseltesBackupDatei(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!istVerschluesselteDatei(parsed)) {
          setMeldung({
            typ: 'fehler',
            text: 'Diese Datei ist kein verschlüsseltes Bewerbungstracker-Backup.',
          });
          return;
        }
        setDialog({
          typ: 'passwort-laden',
          verschluesselt: parsed,
          arbeitend: false,
        });
      } catch {
        setMeldung({
          typ: 'fehler',
          text: 'Datei konnte nicht gelesen werden — kein gültiges JSON.',
        });
      }
    };
    reader.readAsText(file);
  }

  async function handlePasswortFuerLadenBestaetigt(passwort: string) {
    if (dialog.typ !== 'passwort-laden') return;
    setDialog({ ...dialog, arbeitend: true, fehler: undefined });
    try {
      const klartext = await entschluesseln(dialog.verschluesselt, passwort);
      const importDaten = JSON.parse(klartext) as AppData;
      if (importDaten.schema_version !== 1) {
        setDialog({ ...dialog, arbeitend: false, fehler: `Unbekannte Schema-Version ${importDaten.schema_version}.` });
        return;
      }
      const aktuell = ladeAppData();
      const diff = diffBerechnen(aktuell.bewerbungen, importDaten.bewerbungen);
      setDialog({ typ: 'import-bestaetigen', importDaten, diff });
    } catch (err) {
      setDialog({
        ...dialog,
        arbeitend: false,
        fehler: err instanceof Error ? err.message : String(err),
      });
    }
  }

  function handleImportBestaetigt() {
    if (dialog.typ !== 'import-bestaetigen') return;
    speichereAppData(dialog.importDaten);
    setDialog({ typ: 'keiner' });
    setMeldung({ typ: 'erfolg', text: 'Backup erfolgreich importiert.' });
    setTimeout(() => window.location.reload(), 800);
  }

  if (!einstellungen) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <header className="mb-4">
        <Link
          to="/"
          className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          ← Zurück zur Liste
        </Link>
      </header>

      <h1 className="text-2xl font-semibold text-stone-900 mb-6">Einstellungen</h1>

      {meldung && (
        <div
          className={`rounded-md px-4 py-3 mb-4 text-sm ${
            meldung.typ === 'erfolg'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {meldung.text}
        </div>
      )}

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Coaching
        </h2>
        <label className="flex items-start gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={einstellungen.coaching_aktiv}
            onChange={(e) => handleCoachingUmschalten(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400"
          />
          <span>
            <span className="block text-sm font-medium text-stone-800">
              Coaching-Tipps anzeigen
            </span>
            <span className="block text-xs text-stone-500 mt-0.5">
              Bei Status-Änderungen erscheinen kurze Hinweise aus der Personalberater-Praxis.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={einstellungen.auto_reminder_aktiv}
            onChange={(e) => handleAutoReminderUmschalten(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400"
          />
          <span>
            <span className="block text-sm font-medium text-stone-800">
              Automatische Erinnerungen erstellen
            </span>
            <span className="block text-xs text-stone-500 mt-0.5">
              Bei „Beworben" wird ein Reminder zum Nachfassen erstellt, bei
              „Interview erledigt" eine Erinnerung für eine höfliche Nachfrage.
              Manuelle Erinnerungen kannst du jederzeit selbst hinzufügen.
            </span>
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-800">
            Standard-Erinnerung nach „Beworben"
          </span>
          <span className="block text-xs text-stone-500 mt-0.5 mb-2">
            Bei Wechsel auf den Status „Beworben" wird automatisch eine Erinnerung
            zum Nachfassen erstellt — mit so vielen Tagen Vorlauf.
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="90"
              value={einstellungen.reminder_default_tage}
              onChange={(e) => handleReminderTageAendern(Number(e.target.value))}
              className="w-20 rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <span className="text-sm text-stone-600">Tage</span>
          </div>
        </label>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Deine Daten
        </h2>
        <p className="text-sm text-stone-600 mb-4">
          Du kannst deine Bewerbungen jederzeit als Backup-Datei herunterladen
          oder eine zuvor exportierte Datei wieder einspielen.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          >
            Als JSON exportieren
          </button>
          <button
            type="button"
            onClick={handleImportKlick}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          >
            JSON importieren
          </button>
          <button
            type="button"
            onClick={handleZuruecksetzen}
            className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          >
            Auf Demo-Stand zurücksetzen
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportDatei}
          className="hidden"
        />
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Erinnerungen als Benachrichtigung
        </h2>
        {notiStatus === 'unavailable' ? (
          <p className="text-sm text-stone-600">
            Dein Browser oder Gerät unterstützt keine Push-Benachrichtigungen.
          </p>
        ) : notiStatus === 'granted' ? (
          <div className="text-sm">
            <span className="inline-flex items-center gap-2 text-emerald-700">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              Aktiv — deine Erinnerungen werden angezeigt
            </span>
            <p className="text-stone-500 text-xs mt-2">
              Hinweis: In der Web-Version werden Benachrichtigungen nur angezeigt,
              solange die App geöffnet ist. In der App-Version (iOS/Android)
              funktioniert es auch im Hintergrund.
            </p>
          </div>
        ) : notiStatus === 'denied' ? (
          <div className="text-sm">
            <span className="inline-flex items-center gap-2 text-red-700 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              Berechtigung verweigert
            </span>
            <p className="text-stone-600 text-xs">
              Aktiviere Benachrichtigungen für diese Seite in den
              Browser-Einstellungen, um deine Erinnerungen zu erhalten.
            </p>
          </div>
        ) : (
          <div className="text-sm">
            <p className="text-stone-600 mb-3">
              Damit du an Nachfass-Mails und Interview-Vorbereitungen rechtzeitig
              erinnert wirst.
            </p>
            <button
              type="button"
              onClick={handleNotificationsAktivieren}
              className="rounded-md bg-mm-orange text-white px-4 py-1.5 text-sm font-medium hover:bg-mm-orange-hover"
            >
              Benachrichtigungen aktivieren
            </button>
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Verschlüsseltes Backup
        </h2>
        <div className="rounded-md bg-stone-50 border border-stone-200 p-3 mb-4 text-sm text-stone-700 leading-relaxed">
          Deine Daten auf diesem Gerät sind so sicher wie dein Handy-Sperrcode.
          Deine Backups in der Cloud sind so sicher wie dein Master-Passwort.
        </div>
        <p className="text-sm text-stone-600 mb-4">
          Empfohlen für die Synchronisation zwischen Geräten oder Backups in
          deiner eigenen Cloud (iCloud Drive, Google Drive, Dropbox …). Die
          Datei ist mit AES-256 verschlüsselt — ohne Passwort wertlos.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleVerschluesseltesBackupErstellen}
            className="rounded-md bg-mm-orange text-white px-4 py-1.5 text-sm font-medium hover:bg-mm-orange-hover"
          >
            Verschlüsseltes Backup erstellen
          </button>
          <button
            type="button"
            onClick={handleVerschluesseltesBackupLaden}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          >
            Verschlüsseltes Backup laden
          </button>
        </div>
        <input
          ref={verschluesseltImportRef}
          type="file"
          accept="application/json,.json"
          onChange={handleVerschluesseltesBackupDatei}
          className="hidden"
        />
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Datenschutz
        </h2>
        <p className="text-sm text-stone-700 leading-relaxed">
          Diese App speichert deine Bewerbungsdaten ausschließlich lokal in
          deinem Browser. Es findet <strong>keine</strong> Übertragung an
          MM Executive Search oder Dritte statt.
        </p>
        <p className="text-sm text-stone-600 leading-relaxed mt-3">
          Der Coaching-Tipp-Text ist als Teil der App ausgeliefert und ändert
          sich nur mit App-Updates — auch hier verlassen keine Bewerbungsdaten
          dein Gerät.
        </p>
      </section>

      {dialog.typ === 'passwort-erstellen' && (
        <PasswortDialog
          modus="neu"
          titel="Verschlüsseltes Backup erstellen"
          beschreibung="Vergib ein Master-Passwort. Es wird zur Verschlüsselung der Backup-Datei genutzt und verlässt nie dieses Gerät — auch wir können es nicht wiederherstellen."
          arbeitend={dialog.arbeitend}
          onAbbrechen={() => setDialog({ typ: 'keiner' })}
          onBestaetigen={handlePasswortFuerErstellenBestaetigt}
        />
      )}

      {dialog.typ === 'passwort-laden' && (
        <PasswortDialog
          modus="eingabe"
          titel="Backup entschlüsseln"
          beschreibung="Gib das Master-Passwort ein, mit dem dieses Backup verschlüsselt wurde."
          arbeitend={dialog.arbeitend}
          fehler={dialog.fehler}
          onAbbrechen={() => setDialog({ typ: 'keiner' })}
          onBestaetigen={handlePasswortFuerLadenBestaetigt}
        />
      )}

      {dialog.typ === 'import-bestaetigen' && (
        <BackupImportDialog
          diff={dialog.diff}
          onAbbrechen={() => setDialog({ typ: 'keiner' })}
          onBestaetigen={handleImportBestaetigt}
        />
      )}
    </div>
  );
}
