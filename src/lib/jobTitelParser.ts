/**
 * Versucht aus einer kopierten Stellen-Überschrift Firma + Position zu erkennen.
 * Funktioniert mit den häufigsten Mustern von StepStone, LinkedIn, Indeed, Xing, Kununu.
 *
 * Bei mehreren Zeilen (z. B. wenn der User aus Indeed kopiert und dabei viel
 * Beiwerk wie Sterne-Ratings und Adressen mit hereinrutscht) wird die
 * wahrscheinlichste Zeile per Score-Heuristik gewählt.
 */
export function parseJobTitel(input: string): {
  position?: string;
  firma?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) return {};

  const zeilen = trimmed
    .split('\n')
    .map((z) => z.trim())
    .filter((z) => z.length > 0);

  if (zeilen.length === 0) return {};

  // Score jede Zeile, wie wahrscheinlich sie ein Job-Titel ist
  const bewertet = zeilen.map((zeile) => ({
    zeile,
    score: bewerteZeile(zeile),
  }));
  bewertet.sort((a, b) => b.score - a.score);

  // Beste Zeile parsen
  return parseEinzelneZeile(bewertet[0].zeile);
}

function bewerteZeile(zeile: string): number {
  let score = 0;

  // Gender-Marker → starkes Indiz
  if (/\([mwfdgxn][\/\\\-,]\s*[mwfdgxn][\/\\\-,]?\s*[mwfdgxn]?\)/i.test(zeile))
    score += 5;
  if (/\(gn\)|\(all\s+genders?\)|\(divers?\)/i.test(zeile)) score += 5;

  // Typisches Trennzeichen → mittleres Indiz
  if (/\s+[-–—|]\s+/.test(zeile)) score += 3;
  if (/\s+bei\s+/i.test(zeile)) score += 3;
  if (/\s+@\s+/.test(zeile)) score += 2;

  // Bekannte Rollen-Keywords → schwaches Indiz
  if (
    /(Manager|Director|Specialist|Engineer|Developer|Berater|Consultant|Analyst|Designer|Architect|Lead|Head|Chief|Officer|Coordinator|Partner|Trainee|Praktikum|Praktikant|Werkstudent|Mitarbeiter|Sachbearbeiter|Assistent|Buyer|Einkäufer|Verkäufer|Vertriebs|Sales|Marketing|HR|Recruiter|Senior|Junior)/i.test(
      zeile
    )
  )
    score += 2;

  // Negativ-Indizien
  if (/^\d+[.,]?\d*$/.test(zeile)) score -= 10; // reine Zahl wie "2.4"
  if (/von\s+\d+\s+Sternen?/i.test(zeile)) score -= 10; // "X von Y Sternen"
  if (/^\d{5}\b/.test(zeile)) score -= 5; // PLZ am Anfang
  if (/(Straße|Str\.|Platz|Allee|Weg)\s+\d/i.test(zeile)) score -= 5; // Adresse
  if (/^(Speichern|Bewerben|Apply|Save|Teilen|Share|Folgen|Follow)$/i.test(zeile))
    score -= 8; // Button-Text
  if (zeile.length < 8) score -= 3;
  if (zeile.length > 120) score -= 2;

  return score;
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
      // Falls dasselbe Trennzeichen nochmal kommt (z. B. "Position | Firma | Ort"),
      // nur den ersten Teil als Firma verwenden
      const firma = restNachSep.split(sep)[0].trim();

      if (position && firma) {
        return { position, firma };
      }
    }
  }

  return { position: text };
}
