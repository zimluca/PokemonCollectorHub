import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Header
      home: 'Home',
      news: 'News',
      database: 'Database',
      collection: 'My Collection',
      login: 'Login',
      
      // Hero
      heroTitle: 'The Ultimate Pokemon Card Collection Hub',
      heroSubtitle: 'Track your collection, discover new cards, and stay updated with the latest Pokemon TCG news and prices.',
      exploreDatabase: 'Explore Database',
      startCollection: 'Start Collection',
      
      // Stats
      pokemonCards: 'Pokemon Cards',
      setsExpansions: 'Sets & Expansions',
      activeCollectors: 'Active Collectors',
      supportedLanguages: 'Supported Languages',
      
      // News
      latestNews: 'Latest News & Content',
      viewAllNews: 'View All News',
      readMore: 'Read More',
      
      // Database
      pokemonCardDatabase: 'Pokemon Card Database',
      chooseLanguage: 'Choose Your Language',
      selectPreferredLanguage: 'Select your preferred language to view cards and content',
      searchPlaceholder: 'Search cards, sets, or products...',
      allSets: 'All Sets',
      allLanguages: 'All Languages',
      allTypes: 'All Types',
      singleCards: 'Single Cards',
      boosterPacks: 'Booster Packs',
      eliteTrainerBox: 'Elite Trainer Box',
      bundleSets: 'Bundle Sets',
      popular: 'Popular',
      rareCards: 'Rare Cards',
      priceTrending: 'Price Trending',
      recentlyAdded: 'Recently Added',
      minPrice: 'Min Price',
      add: 'Add',
      
      // Collection
      myCollection: 'My Collection',
      totalCards: 'Total Cards',
      collectionValue: 'Collection Value',
      completionRate: 'Completion Rate',
      bySet: 'By Set',
      byType: 'By Type',
      wishlist: 'Wishlist',
      analytics: 'Analytics',
      complete: 'Complete',
      owned: 'Owned',
      missing: 'Missing',
      value: 'Value',
      
      // Footer
      features: 'Features',
      cardDatabase: 'Card Database',
      collectionTracking: 'Collection Tracking',
      priceComparison: 'Price Comparison',
      newsUpdates: 'News & Updates',
      support: 'Support',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      apiDocumentation: 'API Documentation',
      community: 'Community',
      newsletter: 'Newsletter',
      newsletterText: 'Stay updated with the latest Pokemon TCG news and market trends.',
      yourEmail: 'Your email',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
    }
  },
  it: {
    translation: {
      // Header
      home: 'Home',
      news: 'Notizie',
      database: 'Database',
      collection: 'La Mia Collezione',
      login: 'Accedi',
      
      // Hero
      heroTitle: 'La Piattaforma Definitiva per Collezionisti Pokemon',
      heroSubtitle: 'Traccia la tua collezione, scopri nuove carte e rimani aggiornato con le ultime notizie e prezzi del TCG Pokemon.',
      exploreDatabase: 'Esplora Database',
      startCollection: 'Inizia Collezione',
      
      // Stats
      pokemonCards: 'Carte Pokemon',
      setsExpansions: 'Set ed Espansioni',
      activeCollectors: 'Collezionisti Attivi',
      supportedLanguages: 'Lingue Supportate',
      
      // News
      latestNews: 'Ultime Notizie e Contenuti',
      viewAllNews: 'Vedi Tutte le Notizie',
      readMore: 'Leggi di Più',
      
      // Database
      pokemonCardDatabase: 'Database Carte Pokemon',
      chooseLanguage: 'Scegli la Tua Lingua',
      selectPreferredLanguage: 'Seleziona la tua lingua preferita per visualizzare carte e contenuti',
      searchPlaceholder: 'Cerca carte, set o prodotti...',
      allSets: 'Tutti i Set',
      allLanguages: 'Tutte le Lingue',
      allTypes: 'Tutti i Tipi',
      singleCards: 'Carte Singole',
      boosterPacks: 'Buste',
      eliteTrainerBox: 'Elite Trainer Box',
      bundleSets: 'Set Bundle',
      popular: 'Popolari',
      rareCards: 'Carte Rare',
      priceTrending: 'Prezzi in Tendenza',
      recentlyAdded: 'Aggiunte di Recente',
      minPrice: 'Prezzo Min',
      add: 'Aggiungi',
      
      // Collection
      myCollection: 'La Mia Collezione',
      totalCards: 'Carte Totali',
      collectionValue: 'Valore Collezione',
      completionRate: 'Tasso di Completamento',
      bySet: 'Per Set',
      byType: 'Per Tipo',
      wishlist: 'Lista Desideri',
      analytics: 'Analisi',
      complete: 'Completo',
      owned: 'Possedute',
      missing: 'Mancanti',
      value: 'Valore',
      
      // Footer
      features: 'Funzionalità',
      cardDatabase: 'Database Carte',
      collectionTracking: 'Tracciamento Collezione',
      priceComparison: 'Confronto Prezzi',
      newsUpdates: 'Notizie e Aggiornamenti',
      support: 'Supporto',
      helpCenter: 'Centro Assistenza',
      contactUs: 'Contattaci',
      apiDocumentation: 'Documentazione API',
      community: 'Comunità',
      newsletter: 'Newsletter',
      newsletterText: 'Rimani aggiornato con le ultime notizie e tendenze del mercato Pokemon TCG.',
      yourEmail: 'La tua email',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Termini di Servizio',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
