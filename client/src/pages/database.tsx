import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Heart, Languages, Flame, Star, TrendingUp, Clock } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import type { Product, Collection, ProductType } from '@shared/schema';

export default function Database() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);
  const [step, setStep] = useState<'expansion' | 'type' | 'products'>('expansion');

  // Auto-sync check on component mount
  useEffect(() => {
    const checkAndAutoSync = async () => {
      try {
        await fetch('/api/sync/auto');
        // Refresh the data quietly
        queryClient.invalidateQueries();
      } catch (error) {
        console.error('Auto-sync check failed:', error);
      }
    };

    checkAndAutoSync();
  }, []);



  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', {
      search: searchTerm,
      collectionId: selectedCollection || undefined,
      productTypeId: selectedType || undefined,
      language: selectedLanguage === 'all' ? undefined : selectedLanguage,
    }],
    enabled: step === 'products' && !!selectedCollection && !!selectedType,
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
  });

  const { data: productTypes = [] } = useQuery<ProductType[]>({
    queryKey: ['/api/product-types'],
  });

  // Get sync status
  const { data: syncStatus } = useQuery({
    queryKey: ['/api/sync/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
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

  const handleExpansionSelect = (collectionId: string) => {
    setSelectedCollection(collectionId);
    setStep('type');
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setStep('products');
  };

  const handleBack = () => {
    if (step === 'products') {
      setStep('type');
      setSelectedType('');
    } else if (step === 'type') {
      setStep('expansion');
      setSelectedCollection('');
    }
  };

  const selectedCollectionData = collections.find(c => c.id.toString() === selectedCollection);
  const selectedTypeData = productTypes.find(t => t.id.toString() === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold pokemon-gradient bg-clip-text text-transparent mb-6">
            {t('pokemonCardDatabase')}
          </h1>
          
          {/* Database Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Database delle Carte Pokemon</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Carte Pokemon: <span className="font-medium text-blue-600 text-lg">{syncStatus?.pokemonCards || 0}</span></p>
                <p>Collezioni disponibili: <span className="font-medium">{collections.length}</span></p>
                {syncStatus?.lastUpdate && (
                  <p className="text-xs">Ultimo aggiornamento: <span className="font-medium">{new Date(syncStatus.lastUpdate).toLocaleDateString('it-IT')}</span></p>
                )}
              </div>
              <div className="mt-3 text-xs text-gray-500 italic">
                Le carte vengono sincronizzate automaticamente dall'API Pokemon TCG
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Expansion Selection */}
        {step === 'expansion' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('chooseExpansion')}</h2>
              <p className="text-gray-600 text-lg">{t('selectExpansionDescription')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card 
                  key={collection.id} 
                  className="pokemon-card cursor-pointer"
                  onClick={() => handleExpansionSelect(collection.id.toString())}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pokemon-blue to-pokemon-purple rounded-full flex items-center justify-center">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {i18n.language === 'it' ? collection.nameIt : collection.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {i18n.language === 'it' ? collection.descriptionIt : collection.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Product Type Selection */}
        {step === 'type' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Button 
                onClick={handleBack}
                variant="outline" 
                className="mb-4"
              >
                ← {t('back')}
              </Button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {i18n.language === 'it' ? selectedCollectionData?.nameIt : selectedCollectionData?.name}
              </h2>
              <p className="text-gray-600 text-lg">{t('chooseProductType')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Single Cards */}
              <Card 
                className="pokemon-card cursor-pointer"
                onClick={() => handleTypeSelect('1')} // ID 1 is "Carte Singole"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pokemon-red to-pokemon-yellow rounded-full flex items-center justify-center">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('singleCards')}</h3>
                  <p className="text-gray-600">{t('singleCardsDescription')}</p>
                </CardContent>
              </Card>

              {/* Products */}
              <Card 
                className="pokemon-card cursor-pointer"
                onClick={() => handleTypeSelect('2')} // ID 2 is "Busta Espansione"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pokemon-green to-pokemon-blue rounded-full flex items-center justify-center">
                    <Plus className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('products')}</h3>
                  <p className="text-gray-600">{t('productsDescription')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Products Display */}
        {step === 'products' && (
          <div>
            <div className="text-center mb-8">
              <Button 
                onClick={handleBack}
                variant="outline" 
                className="mb-4"
              >
                ← {t('back')}
              </Button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {i18n.language === 'it' ? selectedCollectionData?.nameIt : selectedCollectionData?.name} - {i18n.language === 'it' ? selectedTypeData?.nameIt : selectedTypeData?.name}
              </h2>
            </div>

            {/* Language Selection */}
            <div className="bg-gradient-to-r from-pokemon-blue to-pokemon-purple text-white rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('chooseLanguage')}</h3>
                  <p className="text-blue-100">{t('selectPreferredLanguage')}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setSelectedLanguage('en')}
                    className={`${selectedLanguage === 'en' ? 'bg-white text-pokemon-blue' : 'bg-white/20 text-white'}`}
                  >
                    English
                  </Button>
                  <Button
                    onClick={() => setSelectedLanguage('it')}
                    className={`${selectedLanguage === 'it' ? 'bg-white text-pokemon-blue' : 'bg-white/20 text-white'}`}
                  >
                    Italiano
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('searchCards')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Products Grid */}
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
          </div>
        )}
      </div>
    </div>
  );
}
