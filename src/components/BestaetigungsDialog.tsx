type Variante = 'destruktiv' | 'neutral';

type Props = {
  titel: string;
  beschreibung: React.ReactNode;
  bestaetigenText: string;
  abbrechenText?: string;
  variante?: Variante;
  onAbbrechen: () => void;
  onBestaetigen: () => void;
};

export function BestaetigungsDialog({
  titel,
  beschreibung,
  bestaetigenText,
  abbrechenText = 'Abbrechen',
  variante = 'destruktiv',
  onAbbrechen,
  onBestaetigen,
}: Props) {
  const buttonClass =
    variante === 'destruktiv'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-mm-orange text-white hover:bg-mm-orange-hover';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onAbbrechen}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-stone-900 mb-2">{titel}</h2>
        <div className="text-sm text-stone-700 mb-5 leading-relaxed">
          {beschreibung}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onAbbrechen}
            className="text-sm text-stone-600 hover:text-stone-900 px-3 py-1.5"
          >
            {abbrechenText}
          </button>
          <button
            type="button"
            onClick={onBestaetigen}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${buttonClass}`}
            autoFocus
          >
            {bestaetigenText}
          </button>
        </div>
      </div>
    </div>
  );
}
