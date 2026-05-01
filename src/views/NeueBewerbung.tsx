import { useNavigate } from 'react-router-dom';
import { bewerbungErstellen, type NeueBewerbungEingabe } from '../data/storage';
import { BewerbungsFormular } from './BewerbungsFormular';

function heuteAlsISO(): string {
  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = String(heute.getMonth() + 1).padStart(2, '0');
  const tag = String(heute.getDate()).padStart(2, '0');
  return `${jahr}-${monat}-${tag}`;
}

const leereBewerbung: NeueBewerbungEingabe = {
  firma: '',
  position: '',
  standort: '',
  bewerbung_datum: heuteAlsISO(),
  status: 'Beworben',
  ansprechpartner: '',
  kontakt_info: '',
  anzeigen_url: '',
  gehalt_vorstellung: null,
  notizen: '',
};

export function NeueBewerbung() {
  const navigate = useNavigate();

  function handleSpeichern(eingabe: NeueBewerbungEingabe) {
    const neue = bewerbungErstellen(eingabe);
    navigate(`/bewerbung/${neue.id}`);
  }

  return (
    <BewerbungsFormular
      modus="erstellen"
      initialwerte={leereBewerbung}
      abbrechenZiel="/"
      onSpeichern={handleSpeichern}
    />
  );
}
