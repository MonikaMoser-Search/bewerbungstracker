import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Bewerbung } from '../types';
import {
  bewerbungAktualisieren,
  ladeAppData,
  type NeueBewerbungEingabe,
} from '../data/storage';
import { BewerbungsFormular } from './BewerbungsFormular';

export function BewerbungBearbeiten() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bewerbung, setBewerbung] = useState<Bewerbung | null | undefined>(undefined);

  useEffect(() => {
    const daten = ladeAppData();
    const gefunden = daten.bewerbungen.find((b) => b.id === id);
    setBewerbung(gefunden ?? null);
  }, [id]);

  if (bewerbung === undefined) return null;

  if (bewerbung === null) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 text-center">
        <p className="text-stone-700 mb-3">Bewerbung nicht gefunden.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Zurück zur Liste
        </Link>
      </div>
    );
  }

  const initialwerte: NeueBewerbungEingabe = {
    firma: bewerbung.firma,
    position: bewerbung.position,
    standort: bewerbung.standort,
    bewerbung_datum: bewerbung.bewerbung_datum,
    status: bewerbung.status,
    ansprechpartner: bewerbung.ansprechpartner,
    kontakt_info: bewerbung.kontakt_info,
    anzeigen_url: bewerbung.anzeigen_url,
    gehalt_vorstellung: bewerbung.gehalt_vorstellung,
    notizen: bewerbung.notizen,
  };

  function handleSpeichern(eingabe: NeueBewerbungEingabe) {
    if (!bewerbung) return;
    const statusGeaendert = eingabe.status !== bewerbung.status;
    const aktualisiert: Bewerbung = {
      ...bewerbung,
      ...eingabe,
      status_geaendert_am: statusGeaendert
        ? new Date().toISOString()
        : bewerbung.status_geaendert_am,
    };
    bewerbungAktualisieren(aktualisiert);
    navigate(`/bewerbung/${bewerbung.id}`);
  }

  return (
    <BewerbungsFormular
      modus="bearbeiten"
      initialwerte={initialwerte}
      abbrechenZiel={`/bewerbung/${bewerbung.id}`}
      onSpeichern={handleSpeichern}
    />
  );
}
