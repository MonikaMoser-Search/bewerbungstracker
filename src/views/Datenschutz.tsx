import { Link } from 'react-router-dom';

export function Datenschutz() {
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
        Datenschutzerklärung
      </h1>
      <p className="text-sm text-stone-600 mb-6">
        Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
      </p>

      <section className="bg-mm-cream-soft rounded-lg border border-mm-orange/30 p-5 mb-4">
        <h2 className="text-xs font-medium text-mm-orange-dark uppercase tracking-wide mb-3">
          Auf einen Blick
        </h2>
        <ul className="text-sm text-stone-800 leading-relaxed space-y-1.5">
          <li>
            • Diese App speichert deine Bewerbungsdaten <strong>ausschließlich
            lokal in deinem Browser</strong>.
          </li>
          <li>
            • Es findet keine Übertragung an Monika Moser Executive Search oder
            Dritte statt.
          </li>
          <li>
            • Wir verwenden <strong>keine Cookies</strong>, kein Tracking, keine
            Analyse-Tools.
          </li>
          <li>
            • Backups verlassen dein Gerät nur, wenn du sie aktiv exportierst.
            Verschlüsselte Backups sind durch dein Master-Passwort geschützt.
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          1. Verantwortlicher
        </h2>
        <p className="text-sm text-stone-800 leading-relaxed">
          Verantwortlich für die Datenverarbeitung im Sinne der
          Datenschutz-Grundverordnung (DSGVO) ist:
        </p>
        <address className="not-italic text-sm text-stone-800 leading-relaxed mt-2">
          Monika Moser
          <br />
          Karl-Theodor-Straße 28
          <br />
          69181 Leimen
          <br />
          E-Mail:{' '}
          <a
            href="mailto:info@mmsearch.de"
            className="text-mm-orange-dark hover:underline"
          >
            info@mmsearch.de
          </a>
          <br />
          Telefon: +49 6224 9877090
        </address>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          2. Bewerbungsdaten in der App
        </h2>
        <p className="text-sm text-stone-800 leading-relaxed">
          Alle Daten, die du in der App eingibst (Firmen, Positionen, Notizen,
          Erinnerungen, Interview-Details, Gehaltsvorstellungen, Kontaktinfos),
          werden ausschließlich im Speicher deines Browsers (localStorage)
          gespeichert. Diese Daten verlassen dein Gerät nicht, weder zu uns
          noch zu Dritten.
        </p>
        <p className="text-sm text-stone-800 leading-relaxed mt-2">
          Eine Übertragung erfolgt nur dann, wenn du selbst aktiv ein Backup
          exportierst und es z. B. in deinen eigenen Cloud-Speicher legst. In
          diesem Fall ist allein der jeweilige Cloud-Anbieter (z. B. iCloud,
          Google Drive, Dropbox) Empfänger — wir bleiben unbeteiligt.
        </p>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          3. Hosting der App
        </h2>
        <p className="text-sm text-stone-800 leading-relaxed">
          Die App wird auf einem Webspace eines externen Hosters bereitgestellt.
          Beim Aufruf der Seite werden technisch zwingend folgende Daten an
          dessen Server übertragen und in Server-Logs gespeichert:
        </p>
        <ul className="text-sm text-stone-700 leading-relaxed mt-2 ml-4 space-y-1">
          <li>• IP-Adresse</li>
          <li>• Datum und Uhrzeit des Aufrufs</li>
          <li>• Browser-Typ und -Version</li>
          <li>• Betriebssystem</li>
          <li>• Referer-URL (vorherige Seite)</li>
        </ul>
        <p className="text-sm text-stone-800 leading-relaxed mt-3">
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
          Interesse an stabilem und sicherem Betrieb der Webanwendung). Die
          Daten werden nicht mit deinen Bewerbungsdaten zusammengeführt.
        </p>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          4. Cookies, Tracking, Analyse
        </h2>
        <p className="text-sm text-stone-800 leading-relaxed">
          Wir setzen <strong>keine Cookies</strong>, weder eigene noch von
          Drittanbietern. Wir nutzen <strong>keine Analyse-Tools</strong>{' '}
          (kein Google Analytics, kein Matomo, keine Heatmaps). Wir setzen
          <strong> keine Tracking-Pixel</strong>.
        </p>
        <p className="text-sm text-stone-800 leading-relaxed mt-2">
          Die App speichert technische Daten ausschließlich im Browser-eigenen
          localStorage und im Service-Worker-Cache (für Offline-Funktion). Beides
          verlässt dein Gerät nicht.
        </p>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          5. Push-Benachrichtigungen
        </h2>
        <p className="text-sm text-stone-800 leading-relaxed">
          Wenn du die Funktion „Erinnerungen als Benachrichtigung" aktivierst,
          fragt dein Browser oder Betriebssystem nach deiner Zustimmung. Die
          geplanten Benachrichtigungen werden ausschließlich auf deinem Gerät
          erzeugt. Es findet keine Kommunikation mit unseren oder fremden
          Servern statt.
        </p>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          6. Externe Links
        </h2>
        <p className="text-sm text-stone-800 leading-relaxed">
          Die App enthält Links zu externen Webseiten Dritter (z. B. zur
          Webseite von Monika Moser Executive Search). Auf den Inhalt dieser
          Webseiten haben wir keinen Einfluss. Beim Klick auf einen externen
          Link gelten die Datenschutzbestimmungen des jeweiligen Anbieters.
        </p>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          7. Deine Rechte
        </h2>
        <p className="text-sm text-stone-800 leading-relaxed mb-2">
          Du hast jederzeit folgende Rechte gegenüber dem Verantwortlichen:
        </p>
        <ul className="text-sm text-stone-700 leading-relaxed ml-4 space-y-1">
          <li>• Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>• Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>• Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>• Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>• Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>• Recht auf Widerspruch (Art. 21 DSGVO)</li>
        </ul>
        <p className="text-sm text-stone-800 leading-relaxed mt-3">
          Da wir selbst keine personenbezogenen Daten von dir speichern, können
          die meisten dieser Rechte nicht praktisch ausgeübt werden — es ist
          schlicht nichts vorhanden, was wir auskunfts- oder löschpflichtig
          machen könnten. Für die Server-Logs des Hosters wende dich an den
          Verantwortlichen oben.
        </p>
        <p className="text-sm text-stone-800 leading-relaxed mt-2">
          Deine eigenen Bewerbungsdaten kannst du jederzeit selbst löschen, indem
          du in den Einstellungen auf „Auf Demo-Stand zurücksetzen" klickst oder
          den Browser-Speicher leerst.
        </p>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          8. Beschwerderecht
        </h2>
        <p className="text-sm text-stone-800 leading-relaxed">
          Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu
          beschweren. Zuständig ist:
        </p>
        <address className="not-italic text-sm text-stone-700 leading-relaxed mt-2">
          Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit
          Baden-Württemberg
          <br />
          Postfach 10 29 32, 70025 Stuttgart
          <br />
          E-Mail:{' '}
          <a
            href="mailto:poststelle@lfdi.bwl.de"
            className="text-mm-orange-dark hover:underline"
          >
            poststelle@lfdi.bwl.de
          </a>
          <br />
          Web:{' '}
          <a
            href="https://www.baden-wuerttemberg.datenschutz.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mm-orange-dark hover:underline"
          >
            www.baden-wuerttemberg.datenschutz.de
          </a>
        </address>
      </section>
    </div>
  );
}
