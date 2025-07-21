import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Heart, Languages, Flame, Star, TrendingUp, Clock, Eye, DollarSign } from 'lucide-react';
import { CardDetailModal } from '@/components/CardDetailModal';
import { queryClient } from '@/lib/queryClient';
import type { Product, Collection, ProductType } from '@shared/schema';

// Helper functions
const formatCardName = (card: any): string => {
  return card.name || 'Unnamed Card';
};

const formatPrice = (price: number | undefined, currency = 'EUR') => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'common': return 'bg-gray-500';
    case 'uncommon': return 'bg-green-500';
    case 'rare': return 'bg-blue-500';
    case 'rare holo': return 'bg-purple-500';
    case 'ultra rare': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

export default function Database() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);
  const [step, setStep] = useState<'expansion' | 'type' | 'products'>('expansion');
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardDetails = (cardId: number) => {
    setSelectedCardId(cardId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCardId(null);
  };

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
      language: selectedLanguage === 'all' ? 'en' : selectedLanguage,
      includePricing: 'true',
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
                <p>Carte Pokemon: <span className="font-medium text-blue-600 text-lg">{(syncStatus as any)?.pokemonCards || 0}</span></p>
                <p>Collezioni disponibili: <span className="font-medium">{collections.length}</span></p>
                {(syncStatus as any)?.lastUpdate && (
                  <p className="text-xs">Ultimo aggiornamento: <span className="font-medium">{new Date((syncStatus as any).lastUpdate).toLocaleDateString('it-IT')}</span></p>
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
            
            {/* Group collections by year */}
            {Object.entries(
              collections.reduce((acc, collection) => {
                const year = collection.releaseDate ? new Date(collection.releaseDate).getFullYear() : 'Unknown';
                if (!acc[year]) acc[year] = [];
                acc[year].push(collection);
                return acc;
              }, {} as Record<string | number, Collection[]>)
            )
            .sort(([yearA], [yearB]) => (yearB === 'Unknown' ? -1 : yearA === 'Unknown' ? 1 : Number(yearB) - Number(yearA)))
            .map(([year, yearCollections]) => (
              <div key={year} className="mb-12">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  {year === 'Unknown' ? 'Anno Sconosciuto' : year}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yearCollections.map((collection) => (
                <Card 
                  key={collection.id} 
                  className="pokemon-card cursor-pointer overflow-hidden"
                  onClick={() => handleExpansionSelect(collection.id.toString())}
                >
                  <div className="relative">
                    {collection.imageUrl ? (
                      <img 
                        src={collection.imageUrl} 
                        alt={collection.name}
                        className="w-full h-32 object-contain bg-gradient-to-r from-pokemon-blue to-pokemon-purple p-4"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-32 bg-gradient-to-r from-pokemon-blue to-pokemon-purple flex items-center justify-center ${collection.imageUrl ? 'hidden' : ''}`}>
                      <Star className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {i18n.language === 'it' ? collection.nameIt : collection.name}
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      {collection.releaseDate ? new Date(collection.releaseDate).getFullYear() : 'Anno sconosciuto'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {i18n.language === 'it' ? collection.descriptionIt : collection.description}
                    </p>
                  </CardContent>
                </Card>
                  ))}
                </div>
              </div>
            ))}
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
              {selectedCollectionData?.imageUrl && (
                <div className="mb-4">
                  <img 
                    src={selectedCollectionData.imageUrl} 
                    alt={selectedCollectionData.name}
                    className="h-16 mx-auto object-contain"
                  />
                </div>
              )}
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
              <div className="flex flex-col space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('chooseLanguage')}</h3>
                  <p className="text-blue-100">{t('selectPreferredLanguage')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => setSelectedLanguage('en')}
                    size="sm"
                    className={`${selectedLanguage === 'en' ? 'bg-white text-pokemon-blue' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    🇬🇧 English
                  </Button>
                  <Button
                    onClick={() => setSelectedLanguage('it')}
                    size="sm"
                    className={`${selectedLanguage === 'it' ? 'bg-white text-pokemon-blue' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    🇮🇹 Italiano
                  </Button>
                  <Button
                    onClick={() => setSelectedLanguage('fr')}
                    size="sm"
                    className={`${selectedLanguage === 'fr' ? 'bg-white text-pokemon-blue' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    🇫🇷 Français
                  </Button>
                  <Button
                    onClick={() => setSelectedLanguage('de')}
                    size="sm"
                    className={`${selectedLanguage === 'de' ? 'bg-white text-pokemon-blue' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    🇩🇪 Deutsch
                  </Button>
                  <Button
                    onClick={() => setSelectedLanguage('es')}
                    size="sm"
                    className={`${selectedLanguage === 'es' ? 'bg-white text-pokemon-blue' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    🇪🇸 Español
                  </Button>
                  <Button
                    onClick={() => setSelectedLanguage('pt')}
                    size="sm"
                    className={`${selectedLanguage === 'pt' ? 'bg-white text-pokemon-blue' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    🇵🇹 Português
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
                      className="w-full h-48 object-cover object-top rounded-t-lg"
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
                      <h3 className="font-bold text-sm mb-1 text-gray-900">
                        {formatCardName(product)}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        {product.cardNumber || 'Product'}
                      </p>

                      {/* Price Display */}
                      <div className="mb-3">
                        {(product as any).minPrice ? (
                          <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                            <span className="text-green-600 font-bold text-sm">
                              {(product as any).minPrice}
                            </span>
                          </div>
                        ) : (product.prices as any)?.minPrice || (product.prices as any)?.avgPrice ? (
                          <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                            <span className="text-green-600 font-bold text-sm">
                              💶 {((product.prices as any).minPrice || (product.prices as any).avgPrice).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                            <span className="text-gray-500 text-sm">
                              💶 N/A
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 pokemon-button text-xs"
                          onClick={() => handleCardDetails(product.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Dettagli
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
        
        {/* Card Details Modal */}
        <CardDetailModal
          cardId={selectedCardId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  );
}
