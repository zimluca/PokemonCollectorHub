import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Heart, Languages, Flame, Star, TrendingUp, Clock } from 'lucide-react';
import type { Product, Collection, ProductType } from '@shared/schema';

export default function Database() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', {
      search: searchTerm,
      collectionId: selectedCollection === 'all' ? undefined : selectedCollection,
      productTypeId: selectedType === 'all' ? undefined : selectedType,
      language: selectedLanguage === 'all' ? undefined : selectedLanguage,
    }],
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
  });

  const { data: productTypes = [] } = useQuery<ProductType[]>({
    queryKey: ['/api/product-types'],
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'rare':
        return 'bg-pokemon-red';
      case 'uncommon':
        return 'bg-pokemon-yellow text-gray-900';
      case 'common':
        return 'bg-gray-500';
      case 'ex':
      case 'vmax':
        return 'bg-pokemon-purple';
      default:
        return 'bg-pokemon-blue';
    }
  };

  const formatPrice = (prices: any) => {
    if (!prices) return 'N/A';
    const minPrice = Math.min(...Object.values(prices).filter(p => typeof p === 'number'));
    return `$${minPrice.toFixed(2)}`;
  };

  const getPriceProviders = (prices: any) => {
    if (!prices) return [];
    return Object.keys(prices).slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          {t('pokemonCardDatabase')}
        </h1>

        {/* Language Selection Banner */}
        <div className="bg-gradient-to-r from-pokemon-blue to-pokemon-purple text-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('chooseLanguage')}</h2>
              <p className="text-blue-100">{t('selectPreferredLanguage')}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setSelectedLanguage('en')}
                variant={selectedLanguage === 'en' ? 'secondary' : 'outline'}
                className={selectedLanguage === 'en' ? 'bg-white text-pokemon-blue' : 'border-white text-white hover:bg-white hover:text-pokemon-blue'}
              >
                <Languages className="h-4 w-4 mr-2" />
                English
              </Button>
              <Button
                onClick={() => setSelectedLanguage('it')}
                variant={selectedLanguage === 'it' ? 'secondary' : 'outline'}
                className={selectedLanguage === 'it' ? 'bg-white text-pokemon-blue' : 'border-white text-white hover:bg-white hover:text-pokemon-blue'}
              >
                <Languages className="h-4 w-4 mr-2" />
                Italiano
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t('allSets')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allSets')}</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id.toString()}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t('allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2">
            <Button className="pokemon-button">
              <Flame className="h-4 w-4 mr-2" />
              {t('popular')}
            </Button>
            <Button variant="outline" className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300">
              <Star className="h-4 w-4 mr-2" />
              {t('rareCards')}
            </Button>
            <Button variant="outline" className="hover:bg-green-50 hover:text-green-600 hover:border-green-300">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t('priceTrending')}
            </Button>
            <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300">
              <Clock className="h-4 w-4 mr-2" />
              {t('recentlyAdded')}
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="pokemon-card">
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300&h=400&fit=crop'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getRarityColor(product.rarity || 'common')} text-white font-semibold`}>
                      {product.rarity || 'Common'}
                    </Badge>
                    <div className="flex items-center">
                      <Languages className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-600 uppercase font-medium">
                        {product.language}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm mb-1 text-gray-900">{product.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    {product.cardNumber || 'Product'}
                  </p>

                  {/* Price Comparison */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">{t('minPrice')}:</div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-bold text-lg">
                        {formatPrice(product.prices)}
                      </span>
                      <div className="flex space-x-1">
                        {getPriceProviders(product.prices).map((provider) => (
                          <span
                            key={provider}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium"
                          >
                            {provider.substring(0, 3).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button className="flex-1 pokemon-button text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      {t('add')}
                    </Button>
                    <Button variant="outline" className="text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center mt-12 space-x-2">
          <Button variant="ghost" disabled>
            ←
          </Button>
          <Button className="bg-pokemon-blue text-white">1</Button>
          <Button variant="ghost">2</Button>
          <Button variant="ghost">3</Button>
          <span className="text-gray-400">...</span>
          <Button variant="ghost">25</Button>
          <Button variant="ghost">
            →
          </Button>
        </div>
      </div>
    </div>
  );
}
