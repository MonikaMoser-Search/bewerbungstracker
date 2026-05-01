import type { Reminder, Status } from '../types';

export const coachingTipps: Record<Status, string | null> = {
  "Entwurf": null,
  "Beworben":
    'Glückwunsch! Speicher dir jetzt die Anzeige als PDF, falls sie offline geht. Eine Erinnerung zum Nachfassen wurde automatisch angelegt.',
  "Eingangsbestätigung":
    'Gutes Zeichen — dein Material ist angekommen. Recherchiere jetzt die Firma und Branche, falls ein Interview kommt.',
  "Interview geplant":
    'Checkliste: Wer ist mein Gegenüber (LinkedIn)? Habe ich 3 eigene Fragen vorbereitet? Was ist meine Antwort auf „Warum wir?"',
  "Interview erledigt":
    'Wie war\'s? Notiere kurz, solang\'s frisch ist. Wenn nach 5 Tagen Stille, ist eine höfliche Erinnerung okay.',
  "Angebot":
    'Bedenkzeit erbitten ist Standard, kein Schwächezeichen — 2–5 Werktage sind normal. Lies den Vertrag in Ruhe.',
  "Angenommen":
    'Herzlichen Glückwunsch! Vergiss nicht, bei laufenden Bewerbungen freundlich zurückzuziehen — Personalberater behalten dich in Erinnerung.',
  "Absage":
    'Kopf hoch! Frag höflich nach dem Grund — manchmal ist es nur das Timing. Willst du den Kontakt für später in dein Netzwerk aufnehmen?',
  "Zurückgezogen":
    'Eine bewusste Entscheidung — informiere kurz und höflich. So bleibst du in guter Erinnerung.',
};

export function autoErinnerungenFuerStatus(
  status: Status,
  firma: string,
  reminderDefaultTage: number
): Omit<Reminder, 'id'>[] {
  const jetzt = new Date();

  if (status === 'Beworben') {
    const tagX = new Date(jetzt);
    tagX.setDate(tagX.getDate() + reminderDefaultTage);
    return [
      {
        zeitpunkt: tagX.toISOString(),
        nachricht: `Nachfass-Mail an ${firma} erwägen`,
        erledigt: false,
        auto_erstellt: true,
      },
    ];
  }

  if (status === 'Interview erledigt') {
    const in5tagen = new Date(jetzt);
    in5tagen.setDate(in5tagen.getDate() + 5);
    return [
      {
        zeitpunkt: in5tagen.toISOString(),
        nachricht: `Bei keiner Antwort: höfliche Erinnerung an ${firma}`,
        erledigt: false,
        auto_erstellt: true,
      },
    ];
  }

  return [];
}
