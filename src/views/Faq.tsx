import { Link } from 'react-router-dom';

type Frage = {
  frage: string;
  antwort: React.ReactNode;
};

type FrageGruppe = {
  titel: string;
  fragen: Frage[];
};

const gruppen: FrageGruppe[] = [
  {
    titel: 'Datenschutz & Daten',
    fragen: [
      {
        frage: 'Wo werden meine Daten gespeichert?',
        antwort: (
          <>
            Ausschließlich im Speicher deines Browsers (genauer: localStorage).
            Das ist ein Bereich, den dein Browser dir zur Verfügung stellt — er
            liegt auf <strong>deinem Gerät</strong>. Niemand sonst hat Zugriff
            darauf. Keine Übertragung an Monika Moser Executive Search, keinen
            Cloud-Server, an niemanden.
          </>
        ),
      },
      {
        frage: 'Was passiert genau, wenn ich „Speichern" klicke?',
        antwort: (
          <>
            Deine Eingaben werden in den Browser-Speicher geschrieben. Punkt.
            Es geht <strong>kein einziges Byte ins Netz</strong>. Du kannst das
            überprüfen, indem du nach dem Speichern dein WLAN ausschaltest —
            die App funktioniert weiter, denn alle Daten sind lokal.
          </>
        ),
      },
      {
        frage: 'Sieht Monika Moser Executive Search meine Bewerbungen?',
        antwort: (
          <>
            Nein. Wir haben technisch keinen Weg dazu. Die App ist so gebaut,
            dass es <strong>gar keinen Server</strong> gibt, an den deine Daten
            gehen könnten. Das ist der Kern des Konzepts: ein Werkzeug für
            Bewerber, ohne Datensammlung.
          </>
        ),
      },
      {
        frage: 'Was passiert mit meinen Daten, wenn ich die App lösche?',
        antwort: (
          <>
            Sie sind weg. Da nur dein Browser sie hatte, verschwinden sie mit
            der App. Wenn du das nicht willst, erstelle vorher ein
            verschlüsseltes Backup (Einstellungen → Verschlüsseltes Backup
            erstellen).
          </>
        ),
      },
    ],
  },
  {
    titel: 'Erinnerungen & Benachrichtigungen',
    fragen: [
      {
        frage: 'Was passiert am Erinnerungstag?',
        antwort: (
          <>
            <p className="mb-2">
              Das hängt davon ab, wie du die App benutzt:
            </p>
            <p className="mb-2">
              <strong>Als App-Store-App (iOS/Android, geplant):</strong> System-Benachrichtigung
              zur exakten Zeit, auch wenn die App geschlossen ist — wie bei
              jeder anderen Notification.
            </p>
            <p className="mb-2">
              <strong>Aktuell als Web-App:</strong> Browser können
              Hintergrund-Benachrichtigungen ohne Push-Server nicht zuverlässig
              auslösen. Die App zeigt dir aber beim nächsten Öffnen{' '}
              <strong>alle fälligen Erinnerungen prominent oben in der Liste</strong>{' '}
              — du verpasst nichts.
            </p>
            <p>
              Tipp: Füge die App über deinen Browser zum Home-Bildschirm hinzu
              („Zum Home-Bildschirm hinzufügen" auf iOS, „App installieren" in
              Chrome/Edge). Dann hast du sie als Icon und öffnest sie
              wahrscheinlicher routinemäßig.
            </p>
          </>
        ),
      },
      {
        frage: 'Wieso gehen meine Erinnerungen nicht im Hintergrund?',
        antwort: (
          <>
            Echte Hintergrund-Push-Benachrichtigungen brauchen entweder einen
            Push-Server (den hätten wir bewusst nicht — sonst wären deine
            Daten nicht mehr nur bei dir) oder eine native App-Store-App. Die
            native App-Variante ist in Arbeit; sobald sie verfügbar ist,
            funktioniert es genauso wie bei jeder anderen Smartphone-App.
          </>
        ),
      },
    ],
  },
  {
    titel: 'Bedienung',
    fragen: [
      {
        frage: 'Welche Felder muss ich beim Anlegen wirklich ausfüllen?',
        antwort: (
          <>
            Nur <strong>Firma</strong> und <strong>Position</strong>. Diese
            beiden sind mit einem roten Stern markiert. Alles andere ist
            optional. Datum ist automatisch „heute", Status ist „Beworben" —
            kannst du jederzeit ändern.
            <br />
            <br />
            Tipp: Lege erstmal nur Firma + Position an. Den Rest pflegst du
            später nach, wenn du die Infos hast (z. B. Ansprechpartner nach dem
            ersten Kontakt).
          </>
        ),
      },
      {
        frage: 'Wie lösche ich die Beispiel-Bewerbungen?',
        antwort: (
          <>
            In der Liste siehst du neben den Beispielen (Mustermann GmbH,
            Beispiel AG, Muster Versicherung) eine kleine graue Pille mit
            „Beispiel ×". Ein Klick darauf entfernt die Demo-Bewerbung sofort.
            Die Beispiele sind nur dazu da, dir zu zeigen, wie eine gefüllte
            App aussieht.
          </>
        ),
      },
      {
        frage: 'Wie ändere ich den Status einer Bewerbung?',
        antwort: (
          <>
            Klick in der Detail-Ansicht auf den Status (z. B. „Beworben" oben
            rechts). Es öffnet sich eine Auswahl mit allen 9 Status-Stufen.
            Bei jedem Wechsel siehst du einen kurzen Coaching-Tipp aus der
            Personalberatungs-Praxis — wenn du das nicht möchtest, kannst du
            die Tipps in den Einstellungen ausschalten.
          </>
        ),
      },
    ],
  },
  {
    titel: 'Backup & mehrere Geräte',
    fragen: [
      {
        frage: 'Warum sollte ich überhaupt ein Backup erstellen?',
        antwort: (
          <>
            Da deine Daten nur in deinem Browser liegen, sind sie weg, wenn:
            der Browser-Speicher gelöscht wird, du das Gerät wechselst, oder
            das Gerät kaputtgeht. Ein Backup als Datei in deiner eigenen Cloud
            (iCloud Drive, Google Drive, Dropbox) ist deine Versicherung.
          </>
        ),
      },
      {
        frage: 'Was bedeutet „verschlüsseltes Backup" konkret?',
        antwort: (
          <>
            Du vergibst ein Master-Passwort. Damit verschlüsselt die App deine
            Bewerbungsdaten so stark (AES-256), dass die Backup-Datei für
            jeden, der dein Passwort nicht kennt, vollkommen wertlos ist —
            auch für uns, auch für deinen Cloud-Anbieter, auch für jemanden,
            der die Datei zufällig findet.
          </>
        ),
      },
      {
        frage: 'Was passiert, wenn ich mein Master-Passwort vergesse?',
        antwort: (
          <>
            Ehrliche Antwort: dann sind die Backups wertlos. Wir haben{' '}
            <strong>keine Möglichkeit</strong>, das Passwort wiederherzustellen
            — denn dann wäre die Verschlüsselung sinnlos. Das ist der Preis für
            echte Sicherheit.
            <br />
            <br />
            Tipp: Schreib das Master-Passwort einmal auf einen Zettel und leg
            ihn in deinen Geldbeutel oder in deinen Passwort-Manager. Sonst
            riskierst du beim nächsten Geräte-Wechsel deine Daten.
          </>
        ),
      },
      {
        frage: 'Kann ich die App auf mehreren Geräten gleichzeitig nutzen?',
        antwort: (
          <>
            Ja, aber aktuell nicht automatisch synchron:
            <br />
            <br />
            1. Auf Gerät 1 (z. B. PC) erstellst du regelmäßig ein
            verschlüsseltes Backup und legst die Datei in deine Cloud.
            <br />
            2. Auf Gerät 2 (z. B. Handy) lädst du die Datei runter und
            importierst sie über „Verschlüsseltes Backup laden".
            <br />
            <br />
            Das ist manuell, aber dafür komplett in deiner Kontrolle — kein
            externer Sync-Dienst sieht deine Daten. Eine Auto-Sync-Variante mit
            deinem Cloud-Konto ist für eine spätere Version geplant.
          </>
        ),
      },
    ],
  },
  {
    titel: 'Über die App',
    fragen: [
      {
        frage: 'Wer steht hinter der App?',
        antwort: (
          <>
            <a
              href="https://www.mmsearch.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mm-orange-dark hover:underline"
            >
              Monika Moser Executive Search
            </a>{' '}
            — eine Personalberaterin aus Leimen bei Heidelberg. Die App entstand
            aus der Beobachtung, dass viele Bewerber ihre Bewerbungen in Excel
            tracken und dabei wichtige Coaching-Insights verpassen. Wir wollten
            ein Werkzeug bauen, das wirklich auf Bewerber-Seite hilft — ohne
            Datensammlung. Volle Adresse + Kontakt unter „Impressum".
          </>
        ),
      },
      {
        frage: 'Ist die App kostenlos?',
        antwort: (
          <>
            Aktuell läuft die Test-Version kostenlos. In der finalen Version
            (geplant: App Store) wird es einen kostenfreien Bereich mit
            Begrenzung geben sowie Abo-Optionen (monatlich 2,99 €, jährlich
            19,90 €) und einen einmaligen Lifetime-Kauf für 34,90 €. Updates
            sind im Abo immer inklusive.
          </>
        ),
      },
      {
        frage: 'Kann ich Feedback geben?',
        antwort: (
          <>
            Sehr gerne. Schreib einfach an{' '}
            <a
              href="mailto:info@mmsearch.de"
              className="text-mm-orange-dark hover:underline"
            >
              info@mmsearch.de
            </a>
            . Vor allem Hinweise wie „das Feld habe ich nicht verstanden" oder
            „diesen Schritt würde ich anders machen" sind wertvoll.
          </>
        ),
      },
    ],
  },
];

export function Faq() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <header className="mb-4">
        <Link
          to="/"
          className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          ← Zurück zur App
        </Link>
      </header>

      <h1 className="text-2xl font-semibold text-stone-900 mb-2">
        Häufige Fragen
      </h1>
      <p className="text-sm text-stone-600 mb-6">
        Antworten auf das, was Tester am häufigsten fragen.
      </p>

      {gruppen.map((gruppe) => (
        <section
          key={gruppe.titel}
          className="bg-white rounded-lg border border-stone-200 p-5 mb-4"
        >
          <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-4">
            {gruppe.titel}
          </h2>
          <dl className="space-y-5">
            {gruppe.fragen.map((q) => (
              <div key={q.frage}>
                <dt className="text-sm font-medium text-stone-900 mb-1.5">
                  {q.frage}
                </dt>
                <dd className="text-sm text-stone-700 leading-relaxed">
                  {q.antwort}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <p className="text-sm text-stone-500 text-center mt-6">
        Frage fehlt? Schreib an{' '}
        <a
          href="mailto:info@mmsearch.de"
          className="text-mm-orange-dark hover:underline"
        >
          info@mmsearch.de
        </a>{' '}
        — wir ergänzen sie hier.
      </p>
    </div>
  );
}
