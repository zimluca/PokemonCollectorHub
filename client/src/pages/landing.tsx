import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Landing() {
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-3 py-1">
            🎮 Pokemon Card Collection Hub
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PokeHunter
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('landing.subtitle', 'Organizza, traccia e scopri le tue carte Pokemon preferite con la piattaforma più completa per collezionisti')}
          </p>
          <Button size="lg" onClick={handleLogin} className="px-8 py-3 text-lg">
            {t('landing.getStarted', 'Inizia ora')}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗂️</span>
              </div>
              <CardTitle>{t('features.organize.title', 'Organizza la Collezione')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.organize.description', 'Tieni traccia di tutte le tue carte Pokemon con un sistema intuitivo e completo')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <CardTitle>{t('features.discover.title', 'Scopri Nuove Carte')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.discover.description', 'Esplora il database completo delle carte Pokemon TCG con ricerca avanzata')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📰</span>
              </div>
              <CardTitle>{t('features.news.title', 'Ultime Notizie')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.news.description', 'Rimani aggiornato con le ultime novità dal mondo Pokemon TCG')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">
            {t('landing.cta.title', 'Pronto a iniziare la tua avventura?')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            {t('landing.cta.description', 'Unisciti a migliaia di collezionisti che usano PokeHunter per gestire le loro collezioni Pokemon')}
          </p>
          <Button size="lg" onClick={handleLogin} className="px-8 py-3">
            {t('landing.cta.button', 'Accedi con Replit')}
          </Button>
        </div>
      </div>
    </div>
  );
}