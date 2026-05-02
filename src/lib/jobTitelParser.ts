/**
 * Versucht aus einer kopierten Stellen-Überschrift Firma + Position zu erkennen.
 * Funktioniert mit den häufigsten Mustern von StepStone, LinkedIn, Indeed, Xing, Kununu.
 *
 * Bei mehreren Zeilen (z. B. wenn der User aus Indeed/LinkedIn kopiert und dabei
 * viel Beiwerk wie Sterne-Ratings, Adressen, Logo-Alt-Texte und Buttons mit
 * hereinrutschen) wird die wahrscheinlichste Zeile per Score-Heuristik gewählt.
 */
export function parseJobTitel(input: string): {
  position?: string;
  firma?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) return {};

  const alleZeilen = trimmed
    .split('\n')
    .map((z) => z.trim())
    .filter((z) => z.length > 0);

  if (alleZeilen.length === 0) return {};

  // Clutter rauswerfen, bevor wir scoren
  const zeilen = alleZeilen.filter((z) => !isClutterLine(z));
  if (zeilen.length === 0) return {};

  // Score jede Zeile, nimm die beste
  const bewertet = zeilen.map((zeile, idx) => ({
    zeile,
    idx,
    score: bewerteZeile(zeile),
  }));
  bewertet.sort((a, b) => b.score - a.score);
  const beste = bewertet[0];

  const ergebnis = parseEinzelneZeile(beste.zeile);

  // Falls keine Firma aus der Zeile ableitbar war:
  // 1. Prüfe "Unternehmenslogo für X" Pattern in ALLEN Zeilen (auch
  //    geclutterte) — das ist auf LinkedIn der zuverlässigste Hinweis
  // 2. Sonst: schau nach Zeilen mit Firmen-Suffix in Nachbarschaft
  if (ergebnis.position && !ergebnis.firma) {
    const ausLogo = extractFirmaAusLogoZeile(alleZeilen);
    if (ausLogo) {
      ergebnis.firma = ausLogo;
    } else {
      const kandidaten = [
        zeilen[beste.idx + 1],
        zeilen[beste.idx - 1],
        ...zeilen.filter((_, i) => i !== beste.idx),
      ].filter((z): z is string => Boolean(z));

      for (const kand of kandidaten) {
        if (istWahrscheinlichFirma(kand)) {
          ergebnis.firma = bereinigeFirmaZeile(kand);
          break;
        }
      }
    }
  }

  return ergebnis;
}

function extractFirmaAusLogoZeile(zeilen: string[]): string | undefined {
  for (const z of zeilen) {
    let match = z.match(/^Unternehmenslogo\s+(?:für\s+|von\s+)?(.+)$/i);
    if (match) return match[1].trim();
    match = z.match(/^Company\s+logo\s+(?:of\s+|for\s+)?(.+)$/i);
    if (match) return match[1].trim();
    match = z.match(/^Logo\s+(?:für\s+|von\s+|of\s+)(.+)$/i);
    if (match) return match[1].trim();
  }
  return undefined;
}

function bereinigeFirmaZeile(zeile: string): string {
  let s = zeile.trim();
  // Führende/folgende Separatoren entfernen
  s = s.replace(/^[·•|\-–—,\s]+/, '').replace(/[·•|\-–—,\s]+$/, '');
  // Wenn weitere Trennzeichen drin sind, nur ersten Teil (Firma) nehmen,
  // der Rest ist meist Standort
  for (const sep of [' · ', ' • ', ' | ', ' – ', ' — ', ' - ', ', ']) {
    const idx = s.indexOf(sep);
    if (idx > 0) {
      s = s.slice(0, idx).trim();
      break;
    }
  }
  return s;
}

function isClutterLine(zeile: string): boolean {
  // LinkedIn-Logo-Alt-Text
  if (/^Unternehmenslogo\b/i.test(zeile)) return true;
  if (/^Company\s+logo\b/i.test(zeile)) return true;
  if (/^Logo\s+(von|of|für|for)\b/i.test(zeile)) return true;
  // Button-Texte
  if (
    /^(Speichern|Bewerben|Apply|Save|Teilen|Share|Folgen|Follow|Easy Apply|Sofort\s+bewerben|Jetzt\s+bewerben|Schnell\s+bewerben|Quick\s+Apply|Mehr\s+anzeigen|Show\s+more|job\s+post|Stellenanzeige)$/i.test(
      zeile
    )
  )
    return true;
  // Sterne-Bewertung
  if (/^\d+([.,]\d+)?$/.test(zeile)) return true;
  if (/^\d+([.,]\d+)?\s+von\s+\d+\s+Sternen?$/i.test(zeile)) return true;
  // Adresse mit Hausnummer + PLZ
  if (
    /\b(Straße|Strasse|Str\.|Platz|Allee|Weg|Ring|Damm|Ufer)\s+\d/i.test(zeile)
  )
    return true;
  if (/^\d{5}\s/.test(zeile)) return true;
  // "vor X Tagen", "X hours ago"
  if (/^vor\s+\d+\s+(Stunden?|Tagen?|Wochen?|Monaten?|Minuten?)/i.test(zeile))
    return true;
  if (/^\d+\s+(hour|day|week|month)s?\s+ago/i.test(zeile)) return true;
  return false;
}

function bewerteZeile(zeile: string): number {
  let score = 0;

  // Gender-Marker → SEHR starkes Indiz, das soll fast immer dominieren
  if (/\([mwfdgxn][\/\\\-,]\s*[mwfdgxn][\/\\\-,]?\s*[mwfdgxn]?\)/i.test(zeile))
    score += 15;
  if (/\(gn\)|\(all\s+genders?\)|\(divers?\)/i.test(zeile)) score += 15;

  // Typisches Trennzeichen → mittleres Indiz
  if (/\s+[-–—|]\s+/.test(zeile)) score += 3;
  if (/\s+bei\s+/i.test(zeile)) score += 3;
  if (/\s+@\s+/.test(zeile)) score += 2;

  // Bekannte Rollen-Keywords → schwaches Indiz
  if (
    /\b(Manager|Director|Specialist|Engineer|Developer|Berater(in)?|Consultant|Analyst|Designer|Architect|Lead|Officer|Coordinator|Partner|Trainee|Praktikum|Praktikant|Werkstudent|Mitarbeiter|Sachbearbeiter|Assistent(in)?|Buyer|Einkäufer|Verkäufer|Vertriebs|Sales|Marketing|Recruiter|Aussendienst|Außendienst|Pflegekraft|Arzt|Ärztin|Apotheker|Lehrer)\b/i.test(
      zeile
    )
  )
    score += 2;
  if (/\b(Senior|Junior|Head|Chief|Lead)\s/i.test(zeile)) score += 1;

  // Negativ-Indizien
  if (zeile.length < 8) score -= 3;
  if (zeile.length > 120) score -= 2;

  return score;
}

function istWahrscheinlichFirma(zeile: string): boolean {
  if (zeile.length < 3 || zeile.length > 80) return false;
  if (isClutterLine(zeile)) return false;
  if (/\([mwfdgxn][\/\\\-,]/i.test(zeile)) return false;
  if (/\(gn\)|\(all\s+genders?\)|\(divers?\)/i.test(zeile)) return false;
  if (/\d{5}/.test(zeile)) return false;
  // Ortsnamen-Patterns ausschließen
  if (/\b(am|an\s+der|im)\s+(Rhein|Main|Donau|Elbe|Oder|Inn|Neckar|Mosel|Lech|See|Meer)\b/i.test(zeile))
    return false;
  // Wir sind konservativ: nur akzeptieren wenn klare Firmen-Endung dabei ist
  return /\b(GmbH|AG|KG|OHG|UG|SE|GbR|Ltd|Inc|LLC|Corp|Corporation|Group|Gruppe|Holding|Consulting|Solutions|Services|Bank|Versicherung|Stiftung|e\.V\.|eG)\b/i.test(
    zeile
  );
}

function parseEinzelneZeile(eingabe: string): {
  position?: string;
  firma?: string;
} {
  let text = eingabe.trim();
  if (!text) return {};

  // Plattform-Suffixe entfernen
  text = text.replace(
    /\s*[-–—·|]\s*(StepStone|Indeed|LinkedIn|Xing|Kununu|Monster|Glassdoor|Stellenanzeigen?\.de|Karriere\.de|Jobboerse|Jobbörse|Jobs\.de).*$/i,
    ''
  );

  // Zeit-Marker wie "· vor 2 Tagen" entfernen
  text = text.replace(
    /\s*[·•|]\s*(vor\s+\d+|\d+\s+(Std|Stunden|Tage[n]?|Tag|Wochen?|Monate[n]?|Minute[n]?))[a-zäöü\s.]*$/i,
    ''
  );

  // Geschlechts-Marker entfernen
  text = text.replace(
    /\s*\([mwfdgxn][\/\\\-,]\s*[mwfdgxn][\/\\\-,]?\s*[mwfdgxn]?\)\s*/gi,
    ' '
  );
  text = text.replace(/\s*\(gn\)\s*/gi, ' ');
  text = text.replace(/\s*\(all\s+genders?\)\s*/gi, ' ');
  text = text.replace(/\s*\(divers?\)\s*/gi, ' ');

  // "Standort X" / "Location X" am Ende entfernen (Google Jobs Pattern)
  text = text.replace(/\s+Standort\s+[A-ZÄÖÜ][\wäöüß\-\s]+$/i, '');
  text = text.replace(/\s+Location:?\s+[A-Z][\w\-\s]+$/i, '');
  // Vollzeit/Teilzeit-Marker am Ende
  text = text.replace(/\s*[-–|·]\s*(Vollzeit|Teilzeit|Festanstellung|Vertrag|Praktikum|Working Student)\s*$/i, '');

  // Mehrfach-Spaces zusammenfassen
  text = text.replace(/\s+/g, ' ').trim();

  // Trennzeichen in Prioritäts-Reihenfolge probieren
  const separators = [
    ' bei ',
    ' at ',
    ' @ ',
    ' – ',
    ' — ',
    ' - ',
    ' | ',
    ' · ',
  ];

  for (const sep of separators) {
    const idx = text.indexOf(sep);
    if (idx > 0) {
      const position = text.slice(0, idx).trim();
      const restNachSep = text.slice(idx + sep.length).trim();
      const firma = restNachSep.split(sep)[0].trim();

      if (position && firma) {
        return { position, firma };
      }
    }
  }

  return { position: text };
}
