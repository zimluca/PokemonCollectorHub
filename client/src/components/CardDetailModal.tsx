import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, HeartOff, Euro, TrendingUp, BarChart, Eye, X } from "lucide-react";

interface CardDetailModalProps {
  cardId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PricingData {
  minPrice: number | null;
  avgPrice: number | null;
  trendPrice: number | null;
  currency: string;
  source: string;
  lastUpdated: string;
}

interface Product {
  id: number;
  name: string;
  nameIt?: string;
  nameFr?: string;
  nameDe?: string;
  nameEs?: string;
  namePt?: string;
  imageUrl?: string;
  imageUrlLarge?: string;
  cardNumber?: string;
  rarity?: string;
  language: string;
  setName?: string;
  artist?: string;
  hp?: string;
  types?: string[];
  prices?: PricingData;
  collectionId?: number;
}

interface UserCollectionItem {
  id: number;
  productId: number;
  quantity: number;
}

export function CardDetailModal({ cardId, isOpen, onClose }: CardDetailModalProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdatingCollection, setIsUpdatingCollection] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Fetch card details
  const { data: card, isLoading: isLoadingCard } = useQuery<Product>({
    queryKey: ['/api/products', cardId],
    enabled: !!cardId && isOpen,
  });

  // Fetch pricing data from CardMarket
  const { data: pricing, isLoading: isLoadingPricing } = useQuery<PricingData>({
    queryKey: ['/api/products', cardId, 'cardmarket-pricing'],
    enabled: !!cardId && isOpen,
  });

  // Fetch user collection status
  const { data: userCollections } = useQuery<UserCollectionItem[]>({
    queryKey: ['/api/user-collections'],
    enabled: isOpen,
  });

  const addToCollectionMutation = useMutation({
    mutationFn: (productId: number) => 
      apiRequest(`/api/user-collections`, 'POST', { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-collections'] });
      toast({
        title: "Successo",
        description: "Carta aggiunta alla collezione!",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta della carta alla collezione",
        variant: "destructive",
      });
    },
  });

  const removeFromCollectionMutation = useMutation({
    mutationFn: (collectionItemId: number) => 
      apiRequest(`/api/user-collections/${collectionItemId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-collections'] });
      toast({
        title: "Successo",
        description: "Carta rimossa dalla collezione!",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nella rimozione della carta dalla collezione",
        variant: "destructive",
      });
    },
  });

  if (!isOpen || !cardId) return null;

  const isInCollection = userCollections?.some(item => item.productId === cardId);
  const collectionItem = userCollections?.find(item => item.productId === cardId);

  const handleToggleCollection = async () => {
    if (isUpdatingCollection) return;
    
    setIsUpdatingCollection(true);
    try {
      if (isInCollection && collectionItem) {
        await removeFromCollectionMutation.mutateAsync(collectionItem.id);
      } else {
        await addToCollectionMutation.mutateAsync(cardId);
      }
    } finally {
      setIsUpdatingCollection(false);
    }
  };

  const getCardName = (card: Product) => {
    const currentLang = i18n.language;
    switch (currentLang) {
      case 'it': return card.nameIt || card.name;
      case 'fr': return card.nameFr || card.name;
      case 'de': return card.nameDe || card.name;
      case 'es': return card.nameEs || card.name;
      case 'pt': return card.namePt || card.name;
      default: return card.name;
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return `💶 ${price.toFixed(2)}`;
  };

  const getLanguages = (card: Product) => {
    const languages: string[] = [];
    if (card.name) languages.push("EN");
    if (card.nameIt) languages.push("IT");
    if (card.nameFr) languages.push("FR");
    if (card.nameDe) languages.push("DE");
    if (card.nameEs) languages.push("ES");
    if (card.namePt) languages.push("PT");
    return languages;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {card ? getCardName(card) : "Caricamento..."}
          </DialogTitle>
        </DialogHeader>

        {isLoadingCard ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Caricamento dettagli carta...</p>
            </div>
          </div>
        ) : card ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card Image */}
            <div className="space-y-4">
              <div 
                className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:shadow-lg transition-shadow relative group"
                onClick={() => setIsImageExpanded(true)}
              >
                {card.imageUrlLarge || card.imageUrl ? (
                  <>
                    <img
                      src={card.imageUrlLarge || card.imageUrl}
                      alt={getCardName(card)}
                      className="w-full h-full object-cover object-top transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Visualizza a schermo intero</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <p>Nessuna immagine disponibile</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Informazioni Base</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Espansione:</strong> {card.setName || "N/A"}</div>
                        <div><strong>Numero:</strong> {card.cardNumber || "N/A"}</div>
                        <div><strong>Rarità:</strong> {card.rarity || "N/A"}</div>
                        <div><strong>Artista:</strong> {card.artist || "N/A"}</div>
                        {card.hp && <div><strong>HP:</strong> {card.hp}</div>}
                      </div>
                    </div>

                    {/* Types */}
                    {card.types && Array.isArray(card.types) && card.types.length > 0 && (
                      <div>
                        <strong className="text-sm">Tipi:</strong>
                        <div className="flex gap-1 mt-1">
                          {card.types.map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Languages */}
                    <div>
                      <strong className="text-sm">Lingue disponibili:</strong>
                      <div className="flex gap-1 mt-1">
                        {getLanguages(card).map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Prezzi di Mercato
                  </h3>
                  
                  {isLoadingPricing ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : pricing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Prezzo Minimo</span>
                          </div>
                          <span className="font-bold text-green-600">
                            {formatPrice(pricing.minPrice)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <BarChart className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Prezzo Medio</span>
                          </div>
                          <span className="font-bold text-blue-600">
                            {formatPrice(pricing.avgPrice)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">Prezzo di Tendenza</span>
                          </div>
                          <span className="font-bold text-orange-600">
                            {formatPrice(pricing.trendPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>Fonte: {pricing.source === 'cardmarket' ? 'CardMarket' : pricing.source}</span>
                          {(pricing as any).language && (
                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                              {(pricing as any).language}
                            </span>
                          )}
                          {(pricing as any).condition && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {(pricing as any).condition}
                            </span>
                          )}
                        </div>
                        <p>Ultimo aggiornamento: {new Date(pricing.lastUpdated).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Prezzi non disponibili</p>
                  )}
                </CardContent>
              </Card>

              {/* Collection Status */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Collezione</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isInCollection ? "Carta presente nella tua collezione" : "Carta non presente nella collezione"}
                      </p>
                    </div>
                    <Button
                      onClick={handleToggleCollection}
                      disabled={isUpdatingCollection}
                      variant={isInCollection ? "destructive" : "default"}
                      className="flex items-center gap-2"
                    >
                      {isInCollection ? (
                        <>
                          <HeartOff className="w-4 h-4" />
                          Rimuovi
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4" />
                          Aggiungi
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <p>Carta non trovata</p>
          </div>
        )}
      </DialogContent>

      {/* Full Screen Image Modal */}
      {isImageExpanded && card && (card.imageUrlLarge || card.imageUrl) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={card.imageUrlLarge || card.imageUrl}
              alt={getCardName(card)}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setIsImageExpanded(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg inline-block">
                <p className="text-lg font-bold">{getCardName(card)}</p>
                <p className="text-sm opacity-80">{card.setName} • {card.cardNumber}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}