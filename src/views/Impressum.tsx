import { Link } from 'react-router-dom';

export function Impressum() {
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

      <h1 className="text-2xl font-semibold text-stone-900 mb-6">Impressum</h1>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Angaben gemäß § 5 TMG
        </h2>
        <address className="not-italic text-sm text-stone-800 leading-relaxed">
          Monika Moser
          <br />
          Karl-Theodor-Straße 28
          <br />
          69181 Leimen
          <br />
          Deutschland
        </address>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Kontakt
        </h2>
        <dl className="text-sm text-stone-800 space-y-1.5">
          <div className="flex gap-3">
            <dt className="text-stone-500 w-24 flex-shrink-0">Telefon:</dt>
            <dd>
              <a href="tel:+4962249877090" className="text-mm-orange-dark hover:underline">
                +49 6224 9877090
              </a>
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-stone-500 w-24 flex-shrink-0">E-Mail:</dt>
            <dd>
              <a
                href="mailto:info@mmsearch.de"
                className="text-mm-orange-dark hover:underline"
              >
                info@mmsearch.de
              </a>
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-stone-500 w-24 flex-shrink-0">Web:</dt>
            <dd>
              <a
                href="https://www.mmsearch.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mm-orange-dark hover:underline"
              >
                www.mmsearch.de
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Umsatzsteuer-ID
        </h2>
        <p className="text-sm text-stone-800">
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
          <br />
          <span className="font-mono">DE275608530</span>
        </p>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Verantwortlich für den Inhalt
        </h2>
        <p className="text-sm text-stone-800">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: Monika Moser
          (Adresse wie oben).
        </p>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          EU-Streitschlichtung
        </h2>
        <p className="text-sm text-stone-700 leading-relaxed">
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{' '}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mm-orange-dark hover:underline"
          >
            ec.europa.eu/consumers/odr/
          </a>
          .
        </p>
        <p className="text-sm text-stone-700 leading-relaxed mt-2">
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
          vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section className="bg-white rounded-lg border border-stone-200 p-5">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Haftung für Inhalte
        </h2>
        <p className="text-sm text-stone-700 leading-relaxed">
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
          auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
          §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
          Tätigkeit hinweisen.
        </p>
        <p className="text-sm text-stone-700 leading-relaxed mt-2">
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
          Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
          Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
          Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
          von entsprechenden Rechtsverletzungen werden wir diese Inhalte
          umgehend entfernen.
        </p>
      </section>
    </div>
  );
}
