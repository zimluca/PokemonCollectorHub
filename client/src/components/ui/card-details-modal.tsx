import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Heart, Plus, TrendingUp, DollarSign, Clock, Star } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { Separator } from './separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CardDetailsModalProps {
  cardId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface PriceData {
  lowPrice?: number;
  avgPrice?: number;
  highPrice?: number;
  trendPrice?: number;
  marketPrice?: number;
  source: string;
  updatedAt: string;
  currency: string;
}

interface CardDetails {
  id: number;
  tcgId?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  cardNumber?: string;
  rarity?: string;
  hp?: string;
  types?: string[];
  artist?: string;
  setName?: string;
  collectionId: number;
  productTypeId: number;
  language: string;
  prices?: PriceData;
  translations?: {
    en?: { name: string; imageUrl?: string; description?: string };
    fr?: { name: string; imageUrl?: string; description?: string };
    de?: { name: string; imageUrl?: string; description?: string };
    es?: { name: string; imageUrl?: string; description?: string };
    pt?: { name: string; imageUrl?: string; description?: string };
    it?: { name: string; imageUrl?: string; description?: string };
  };
}

export function CardDetailsModal({ cardId, isOpen, onClose }: CardDetailsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInCollection, setIsInCollection] = useState(false);

  // Fetch card details
  const { data: card, isLoading } = useQuery<CardDetails>({
    queryKey: ['/api/products', cardId],
    enabled: isOpen && !!cardId,
  });

  // Fetch pricing data
  const { data: pricing, isLoading: pricingLoading } = useQuery<PriceData>({
    queryKey: ['/api/products', cardId, 'pricing'],
    enabled: isOpen && !!cardId,
  });

  // Add to collection mutation
  const addToCollectionMutation = useMutation({
    mutationFn: () => apiRequest(`/api/user-collections`, {
      method: 'POST',
      body: {
        productId: cardId,
        quantity: 1,
      },
    }),
    onSuccess: () => {
      setIsInCollection(true);
      toast({
        title: "Carta aggiunta!",
        description: "La carta è stata aggiunta alla tua collezione.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-collections'] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiungere la carta alla collezione.",
        variant: "destructive",
      });
    },
  });

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

  const formatPrice = (price: number | undefined, currency = 'EUR') => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Dettagli Carta</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-pokemon-blue border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Caricamento dettagli carta...</p>
          </div>
        ) : card ? (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card Image */}
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={card.imageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&h=560&fit=crop'}
                    alt={card.name}
                    className="w-full max-w-sm mx-auto rounded-xl shadow-lg object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={`${getRarityColor(card.rarity || 'common')} text-white font-semibold`}>
                      {card.rarity || 'Common'}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => addToCollectionMutation.mutate()}
                    disabled={addToCollectionMutation.isPending || isInCollection}
                    className="pokemon-button flex-1 max-w-48"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isInCollection ? 'Nella Collezione' : 'Aggiungi alla Collezione'}
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{card.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>{card.setName}</span>
                    {card.cardNumber && (
                      <>
                        <span>•</span>
                        <span>#{card.cardNumber}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="uppercase font-medium">{card.language}</span>
                  </div>
                  
                  {/* Pokemon Stats */}
                  {card.hp && (
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        HP {card.hp}
                      </div>
                      {card.types && card.types.length > 0 && (
                        <div className="flex gap-2">
                          {card.types.map((type, index) => (
                            <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                              {type}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {card.artist && (
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Artista:</span> {card.artist}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Pricing Information */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Informazioni Prezzo
                  </h3>
                  
                  {pricingLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : pricing ? (
                    <div className="grid grid-cols-2 gap-4">
                      {pricing.lowPrice && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-600">Prezzo Minimo</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatPrice(pricing.lowPrice, pricing.currency)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {pricing.avgPrice && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-600">Prezzo Medio</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatPrice(pricing.avgPrice, pricing.currency)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {pricing.trendPrice && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-600 flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Prezzo Tendenza
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {formatPrice(pricing.trendPrice, pricing.currency)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {pricing.marketPrice && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-600">Prezzo Mercato</div>
                            <div className="text-2xl font-bold text-orange-600">
                              {formatPrice(pricing.marketPrice, pricing.currency)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nessun dato di prezzo disponibile</p>
                      <p className="text-sm">I prezzi verranno aggiornati automaticamente</p>
                    </div>
                  )}

                  {pricing?.updatedAt && (
                    <div className="mt-4 text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Ultimo aggiornamento: {formatDate(pricing.updatedAt)} • Fonte: {pricing.source}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Available Languages */}
                {card.translations && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Lingue Disponibili</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(card.translations).map(([lang, translation]) => (
                        translation?.name && (
                          <div key={lang} className="border rounded-lg p-3 text-center hover:bg-gray-50 transition-colors">
                            <div className="font-medium text-sm">
                              {lang === 'en' ? '🇬🇧 English' : 
                               lang === 'fr' ? '🇫🇷 Français' :
                               lang === 'de' ? '🇩🇪 Deutsch' :
                               lang === 'es' ? '🇪🇸 Español' :
                               lang === 'pt' ? '🇵🇹 Português' :
                               lang === 'it' ? '🇮🇹 Italiano' : lang.toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{translation.name}</div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Carta non trovata
          </div>
        )}
      </div>
    </div>
  );
}