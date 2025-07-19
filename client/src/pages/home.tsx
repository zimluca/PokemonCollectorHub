import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Heart, User, Calendar, TrendingUp, Clock, Star } from 'lucide-react';
import type { Article } from '@shared/schema';

export default function Home() {
  const { t } = useTranslation();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  const featuredArticles = articles.filter(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pokemon-blue via-pokemon-purple to-pokemon-blue text-white py-20 overflow-hidden">
        {/* Pokemon-themed background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-pokemon-yellow animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-pokemon-red animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-pokemon-green animate-pulse"></div>
          <div className="absolute bottom-10 right-1/3 w-28 h-28 rounded-full bg-pokemon-orange animate-bounce"></div>
          <div className="absolute top-1/3 left-1/2 w-16 h-16 rounded-full bg-white animate-pulse"></div>
          
          {/* Pokeball-like shapes */}
          <div className="absolute top-16 right-1/4 w-12 h-12 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-32 left-20 w-8 h-8 border-2 border-pokemon-yellow rounded-full"></div>
          <div className="absolute top-1/2 right-16 w-10 h-10 border-3 border-pokemon-red rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-6xl font-bold mb-6 drop-shadow-lg relative">
            {t('heroTitle')}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-pokemon-yellow rounded-full animate-ping opacity-75"></div>
            <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-pokemon-red rounded-full animate-pulse"></div>
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100 leading-relaxed">{t('heroSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/database">
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Search className="h-5 w-5 mr-2" />
                {t('exploreDatabase')}
              </Button>
            </Link>
            <Link href="/collection">
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('startCollection')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center pokemon-stats-card">
              <div className="text-4xl font-bold text-pokemon-blue mb-2">15,000+</div>
              <div className="text-gray-600 font-medium">{t('pokemonCards')}</div>
            </div>
            <div className="text-center pokemon-stats-card">
              <div className="text-4xl font-bold text-pokemon-red mb-2">150+</div>
              <div className="text-gray-600 font-medium">{t('setsExpansions')}</div>
            </div>
            <div className="text-center pokemon-stats-card">
              <div className="text-4xl font-bold text-pokemon-green mb-2">25,000+</div>
              <div className="text-gray-600 font-medium">{t('activeCollectors')}</div>
            </div>
            <div className="text-center pokemon-stats-card">
              <div className="text-4xl font-bold text-pokemon-purple mb-2">5</div>
              <div className="text-gray-600 font-medium">{t('supportedLanguages')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold pokemon-gradient bg-clip-text text-transparent">{t('latestNews')}</h2>
            <Link href="/news">
              <Button variant="ghost" className="text-pokemon-blue hover:text-blue-600">
                {t('viewAllNews')}
                <TrendingUp className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Featured Article */}
              {featuredArticles.length > 0 && (
                <Card className="lg:col-span-2 pokemon-card">
                  <img
                    src={featuredArticles[0].imageUrl || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=400&fit=crop'}
                    alt={featuredArticles[0].title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Badge className="bg-pokemon-red text-white">Featured</Badge>
                      <div className="flex items-center ml-4 text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(featuredArticles[0].publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      {featuredArticles[0].title}
                    </h3>
                    <p className="text-gray-600 mb-4">{featuredArticles[0].excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-pokemon-blue rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="ml-2 text-gray-700 font-medium">
                          {featuredArticles[0].author}
                        </span>
                      </div>
                      <Button variant="ghost" className="text-pokemon-blue hover:text-blue-600">
                        {t('readMore')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Regular Articles */}
              <div className="space-y-6">
                {regularArticles.slice(0, 2).map((article) => (
                  <Card key={article.id} className="pokemon-card">
                    <img
                      src={article.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop'}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Badge className="bg-pokemon-yellow text-gray-900">
                          {article.category}
                        </Badge>
                        <div className="flex items-center ml-2 text-gray-500 text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{article.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{article.excerpt}</p>
                      <Button variant="ghost" className="text-pokemon-blue hover:text-blue-600 text-sm p-0">
                        {t('readMore')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
