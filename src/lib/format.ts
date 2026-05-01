import type { Status } from '../types';

export const statusFarbe: Record<Status, string> = {
  "Entwurf": "bg-stone-200 text-stone-700",
  "Beworben": "bg-blue-100 text-blue-800",
  "Eingangsbestätigung": "bg-cyan-100 text-cyan-800",
  "Interview geplant": "bg-indigo-100 text-indigo-800",
  "Interview erledigt": "bg-violet-100 text-violet-800",
  "Angebot": "bg-amber-100 text-amber-800",
  "Angenommen": "bg-emerald-100 text-emerald-800",
  "Absage": "bg-red-100 text-red-700",
  "Zurückgezogen": "bg-stone-100 text-stone-600",
};

export function formatiereDatum(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatiereDatumZeit(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatiereGehalt(betrag: number | null): string {
  if (betrag === null) return '—';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(betrag);
}
