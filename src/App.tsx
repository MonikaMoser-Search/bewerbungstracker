import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BewerbungsListe } from './views/BewerbungsListe';
import { BewerbungsDetail } from './views/BewerbungsDetail';
import { NeueBewerbung } from './views/NeueBewerbung';
import { BewerbungBearbeiten } from './views/BewerbungBearbeiten';
import { Einstellungen } from './views/Einstellungen';
import { Impressum } from './views/Impressum';
import { Datenschutz } from './views/Datenschutz';
import { Faq } from './views/Faq';
import { ladeAppData } from './data/storage';
import { alleRemindersNeuPlanen } from './lib/notifications';

export default function App() {
  useEffect(() => {
    const daten = ladeAppData();
    alleRemindersNeuPlanen(daten.bewerbungen);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BewerbungsListe />} />
        <Route path="/neu" element={<NeueBewerbung />} />
        <Route path="/bewerbung/:id" element={<BewerbungsDetail />} />
        <Route path="/bewerbung/:id/bearbeiten" element={<BewerbungBearbeiten />} />
        <Route path="/einstellungen" element={<Einstellungen />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
    </BrowserRouter>
  );
}
