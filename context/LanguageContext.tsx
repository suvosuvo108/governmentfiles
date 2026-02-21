import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define available languages
export type Language = 'en' | 'de' | 'fr' | 'it' | 'hi' | 'bn' | 'nl';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string; // Emoji flag
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }, // "Janmay" interpreted as German
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
];

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.back": "Back to Previous",
    "nav.garden": "Back to Garden",
    "footer.product": "Product",
    "footer.resources": "Resources",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "link.home": "Home",
    "link.features": "All Features",
    "link.pricing": "Pricing (Free)",
    "link.faq": "FAQ",
    "link.pdf_tools": "PDF Tools",
    "link.image_tools": "Image Tools",
    "link.suggest": "Suggest Feature",
    "link.about": "About us",
    "link.contact": "Contact us",
    "link.blog": "Blog",
    "link.press": "Press",
    "link.privacy": "Privacy policy",
    "link.terms": "Terms & conditions",
    "link.cookies": "Cookies",
    "link.security": "Security Info",
    "home.welcome": "Welcome To Our",
    "home.subtitle": "Simplify Your Documents with our All-in-One Solution",
    "home.features": "No Server Uploads • 100% Secure • Mobile Friendly",
    "tools.search": "Search for tools...",
    "tools.no_result": "No result found",
    "tools.clear": "Clear Search & Show All Tools",
    "tools.grid": "Grid",
    "tools.explore": "Explore Tools",
    "tools.soon": "Soon"
  },
  de: {
    "nav.back": "Zurück",
    "nav.garden": "Zum Garten",
    "footer.product": "Produkt",
    "footer.resources": "Ressourcen",
    "footer.company": "Firma",
    "footer.legal": "Rechtliches",
    "link.home": "Startseite",
    "link.features": "Alle Funktionen",
    "link.pricing": "Preise (Kostenlos)",
    "link.faq": "FAQ",
    "link.pdf_tools": "PDF Werkzeuge",
    "link.image_tools": "Bild Werkzeuge",
    "link.suggest": "Funktion vorschlagen",
    "link.about": "Über uns",
    "link.contact": "Kontakt",
    "link.blog": "Blog",
    "link.press": "Presse",
    "link.privacy": "Datenschutz",
    "link.terms": "AGB",
    "link.cookies": "Cookies",
    "link.security": "Sicherheit",
    "home.welcome": "Willkommen in unserem",
    "home.subtitle": "Vereinfachen Sie Ihre Dokumente mit unserer All-in-One-Lösung",
    "home.features": "Keine Server-Uploads • 100% Sicher • Mobilfreundlich",
    "tools.search": "Werkzeuge suchen...",
    "tools.no_result": "Kein Ergebnis gefunden",
    "tools.clear": "Suche löschen & Alle anzeigen",
    "tools.grid": "Raster",
    "tools.explore": "Werkzeuge erkunden",
    "tools.soon": "Bald"
  },
  fr: {
    "nav.back": "Retour",
    "nav.garden": "Retour au Jardin",
    "footer.product": "Produit",
    "footer.resources": "Ressources",
    "footer.company": "Entreprise",
    "footer.legal": "Légal",
    "link.home": "Accueil",
    "link.features": "Fonctionnalités",
    "link.pricing": "Tarifs (Gratuit)",
    "link.faq": "FAQ",
    "link.pdf_tools": "Outils PDF",
    "link.image_tools": "Outils Image",
    "link.suggest": "Suggérer",
    "link.about": "À propos",
    "link.contact": "Contact",
    "link.blog": "Blog",
    "link.press": "Presse",
    "link.privacy": "Confidentialité",
    "link.terms": "Conditions",
    "link.cookies": "Cookies",
    "link.security": "Sécurité",
    "home.welcome": "Bienvenue dans notre",
    "home.subtitle": "Simplifiez vos documents avec notre solution tout-en-un",
    "home.features": "Aucun upload serveur • 100% Sécurisé • Mobile Friendly",
    "tools.search": "Rechercher des outils...",
    "tools.no_result": "Aucun résultat trouvé",
    "tools.clear": "Effacer la recherche",
    "tools.grid": "Grille",
    "tools.explore": "Explorer les outils",
    "tools.soon": "Bientôt"
  },
  it: {
    "nav.back": "Indietro",
    "nav.garden": "Torna al Giardino",
    "footer.product": "Prodotto",
    "footer.resources": "Risorse",
    "footer.company": "Azienda",
    "footer.legal": "Legale",
    "link.home": "Home",
    "link.features": "Funzionalità",
    "link.pricing": "Prezzi (Gratis)",
    "link.faq": "FAQ",
    "link.pdf_tools": "Strumenti PDF",
    "link.image_tools": "Strumenti Immagine",
    "link.suggest": "Suggerisci",
    "link.about": "Chi siamo",
    "link.contact": "Contatti",
    "link.blog": "Blog",
    "link.press": "Stampa",
    "link.privacy": "Privacy",
    "link.terms": "Termini",
    "link.cookies": "Cookie",
    "link.security": "Sicurezza",
    "home.welcome": "Benvenuto nel nostro",
    "home.subtitle": "Semplifica i tuoi documenti con la nostra soluzione tutto in uno",
    "home.features": "Nessun caricamento su server • 100% Sicuro • Mobile Friendly",
    "tools.search": "Cerca strumenti...",
    "tools.no_result": "Nessun risultato trovato",
    "tools.clear": "Cancella ricerca",
    "tools.grid": "Griglia",
    "tools.explore": "Esplora strumenti",
    "tools.soon": "Presto"
  },
  nl: {
    "nav.back": "Terug",
    "nav.garden": "Terug naar Tuin",
    "footer.product": "Product",
    "footer.resources": "Bronnen",
    "footer.company": "Bedrijf",
    "footer.legal": "Juridisch",
    "link.home": "Home",
    "link.features": "Alle Functies",
    "link.pricing": "Prijzen (Gratis)",
    "link.faq": "FAQ",
    "link.pdf_tools": "PDF Tools",
    "link.image_tools": "Afbeelding Tools",
    "link.suggest": "Functie Voorstellen",
    "link.about": "Over ons",
    "link.contact": "Contact",
    "link.blog": "Blog",
    "link.press": "Pers",
    "link.privacy": "Privacybeleid",
    "link.terms": "Voorwaarden",
    "link.cookies": "Cookies",
    "link.security": "Beveiliging",
    "home.welcome": "Welkom in onze",
    "home.subtitle": "Vereenvoudig uw documenten met onze alles-in-één oplossing",
    "home.features": "Geen server uploads • 100% Veilig • Mobielvriendelijk",
    "tools.search": "Zoek tools...",
    "tools.no_result": "Geen resultaat gevonden",
    "tools.clear": "Zoekopdracht wissen",
    "tools.grid": "Raster",
    "tools.explore": "Tools Verkennen",
    "tools.soon": "Binnenkort"
  },
  hi: {
    "nav.back": "वापस जाएं",
    "nav.garden": "गार्डन पर वापस जाएं",
    "footer.product": "उत्पाद",
    "footer.resources": "संसाधन",
    "footer.company": "कंपनी",
    "footer.legal": "कानूनी",
    "link.home": "होम",
    "link.features": "सभी विशेषताएं",
    "link.pricing": "मूल्य निर्धारण (निःशुल्क)",
    "link.faq": "सामान्य प्रश्न",
    "link.pdf_tools": "PDF टूल्स",
    "link.image_tools": "इमेज टूल्स",
    "link.suggest": "सुझाव दें",
    "link.about": "हमारे बारे में",
    "link.contact": "संपर्क करें",
    "link.blog": "ब्लॉग",
    "link.press": "प्रेस",
    "link.privacy": "गोपनीयता नीति",
    "link.terms": "नियम और शर्तें",
    "link.cookies": "कुकीज़",
    "link.security": "सुरक्षा जानकारी",
    "home.welcome": "स्वागत है हमारे",
    "home.subtitle": "हमारे ऑल-इन-वन समाधान के साथ अपने दस्तावेज़ों को सरल बनाएं",
    "home.features": "कोई सर्वर अपलोड नहीं • 100% सुरक्षित • मोबाइल फ्रेंडली",
    "tools.search": "टूल्स खोजें...",
    "tools.no_result": "कोई परिणाम नहीं मिला",
    "tools.clear": "खोज साफ़ करें",
    "tools.grid": "ग्रिड",
    "tools.explore": "टूल्स देखें",
    "tools.soon": "जल्द आ रहा है"
  },
  bn: {
    "nav.back": "ফিরে যান",
    "nav.garden": "গার্ডেনে ফিরে যান",
    "footer.product": "পণ্য",
    "footer.resources": "রিসোর্স",
    "footer.company": "কোম্পানি",
    "footer.legal": "আইনি",
    "link.home": "হোম",
    "link.features": "সমস্ত ফিচার",
    "link.pricing": "মূল্য (ফ্রি)",
    "link.faq": "প্রশ্নাবলী",
    "link.pdf_tools": "PDF টুলস",
    "link.image_tools": "ইমেজ টুলস",
    "link.suggest": "পরামর্শ দিন",
    "link.about": "আমাদের সম্পর্কে",
    "link.contact": "যোগাযোগ",
    "link.blog": "ব্লগ",
    "link.press": "প্রেস",
    "link.privacy": "গোপনীয়তা নীতি",
    "link.terms": "শর্তাবলী",
    "link.cookies": "কুকিজ",
    "link.security": "নিরাপত্তা তথ্য",
    "home.welcome": "স্বাগতম আমাদের",
    "home.subtitle": "আমাদের অল-ইন-ওয়ান সমাধানের মাধ্যমে আপনার নথিগুলিকে সহজ করুন",
    "home.features": "কোন সার্ভার আপলোড নেই • ১০০% নিরাপদ • মোবাইল ফ্রেন্ডলি",
    "tools.search": "টুলস খুঁজুন...",
    "tools.no_result": "কোনো ফলাফল পাওয়া যায়নি",
    "tools.clear": "অনুসন্ধান মুছুন",
    "tools.grid": "গ্রিড",
    "tools.explore": "টুলস দেখুন",
    "tools.soon": "শীঘ্রই"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage
    const saved = localStorage.getItem('garden_lang');
    if (saved && Object.keys(translations).includes(saved)) {
      return saved as Language;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('garden_lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
