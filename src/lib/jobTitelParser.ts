/**
 * Versucht aus einer kopierten Stellen-Überschrift Firma + Position zu erkennen.
 * Funktioniert mit den häufigsten Mustern von StepStone, LinkedIn, Indeed, Xing, Kununu.
 */
export function parseJobTitel(input: string): {
  position?: string;
  firma?: string;
} {
  let text = input.trim();
  if (!text) return {};

  // Nur die erste Zeile nehmen (falls mehrere kopiert wurden)
  text = text.split('\n')[0].trim();

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

  // Geschlechts-Marker wie (m/w/d), (w/m/d), (gn), (all genders) entfernen
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

  // Kein Trennzeichen gefunden — nur als Position zurückgeben
  return { position: text };
}
