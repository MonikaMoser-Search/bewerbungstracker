import type { Bewerbung } from '../types';

export type ImportDiff = {
  neu: number;
  ueberschreiben: number;
  verloren: number;
  gesamtImport: number;
};

export function diffBerechnen(
  lokal: Bewerbung[],
  importiert: Bewerbung[]
): ImportDiff {
  const lokalIds = new Set(lokal.map((b) => b.id));
  const importIds = new Set(importiert.map((b) => b.id));
  return {
    neu: importiert.filter((b) => !lokalIds.has(b.id)).length,
    ueberschreiben: importiert.filter((b) => lokalIds.has(b.id)).length,
    verloren: lokal.filter((b) => !importIds.has(b.id)).length,
    gesamtImport: importiert.length,
  };
}

type Props = {
  diff: ImportDiff;
  onAbbrechen: () => void;
  onBestaetigen: () => void;
};

export function BackupImportDialog({ diff, onAbbrechen, onBestaetigen }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onAbbrechen}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-stone-900 mb-2">
          Import bestätigen
        </h2>
        <p className="text-sm text-stone-600 mb-4 leading-relaxed">
          Die Backup-Datei enthält {diff.gesamtImport}{' '}
          {diff.gesamtImport === 1 ? 'Bewerbung' : 'Bewerbungen'}. Hier ist, was
          mit deinen aktuellen Daten passiert:
        </p>

        <ul className="space-y-2 mb-4 text-sm">
          {diff.neu > 0 && (
            <li className="flex items-start gap-3">
              <span className="text-emerald-600 font-medium tabular-nums w-6">
                +{diff.neu}
              </span>
              <span className="text-stone-700">
                neue {diff.neu === 1 ? 'Bewerbung wird' : 'Bewerbungen werden'}{' '}
                hinzugefügt
              </span>
            </li>
          )}
          {diff.ueberschreiben > 0 && (
            <li className="flex items-start gap-3">
              <span className="text-stone-600 font-medium tabular-nums w-6">
                ~{diff.ueberschreiben}
              </span>
              <span className="text-stone-700">
                bestehende{' '}
                {diff.ueberschreiben === 1
                  ? 'Bewerbung wird'
                  : 'Bewerbungen werden'}{' '}
                überschrieben (mit der Version aus dem Backup)
              </span>
            </li>
          )}
          {diff.verloren > 0 && (
            <li className="flex items-start gap-3 bg-mm-cream border border-mm-orange/30 rounded-md p-2 -mx-2">
              <span className="text-mm-orange-dark font-medium tabular-nums w-6">
                −{diff.verloren}
              </span>
              <span className="text-mm-brown">
                deiner aktuellen{' '}
                {diff.verloren === 1
                  ? 'Bewerbungen ist nicht im Backup und geht verloren'
                  : 'Bewerbungen sind nicht im Backup und gehen verloren'}
              </span>
            </li>
          )}
          {diff.neu === 0 && diff.ueberschreiben === 0 && diff.verloren === 0 && (
            <li className="text-stone-500">
              Keine Änderungen — die Backup-Datei ist identisch mit deinen aktuellen Daten.
            </li>
          )}
        </ul>

        {diff.verloren > 0 && (
          <p className="text-xs text-mm-brown mb-4">
            Tipp: Erstelle vor dem Import erst ein Backup deiner aktuellen Daten,
            falls du sie behalten möchtest.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onAbbrechen}
            className="text-sm text-stone-600 hover:text-stone-900 px-3 py-1.5"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onBestaetigen}
            className="rounded-md bg-mm-orange text-white px-4 py-1.5 text-sm font-medium hover:bg-mm-orange-hover"
          >
            Importieren
          </button>
        </div>
      </div>
    </div>
  );
}
