import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Globe, Zap, Database, Languages } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MultilingualStats {
  totalCards: number;
  cardsWithFrench: number;
  cardsWithGerman: number;
  cardsWithSpanish: number;
  cardsWithPortuguese: number;
  cardsWithDutch: number;
}

interface MultilingualCardData {
  cardId: number;
  names: Record<string, string | null>;
  images: Record<string, string | null>;
  descriptions: Record<string, string | null>;
}

const LANGUAGE_INFO = {
  en: { name: "English", flag: "🇬🇧" },
  it: { name: "Italiano", flag: "🇮🇹" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  es: { name: "Español", flag: "🇪🇸" },
  pt: { name: "Português", flag: "🇵🇹" },
  nl: { name: "Nederlands", flag: "🇳🇱" }
};

export default function MultilingualTest() {
  const [cardId, setCardId] = useState<string>("1");
  const [enhanceLimit, setEnhanceLimit] = useState<string>("10");
  const queryClient = useQueryClient();

  // Query for multilingual statistics
  const { data: stats, isLoading: statsLoading } = useQuery<MultilingualStats>({
    queryKey: ['/api/multilingual/stats'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Query for specific card multilingual data
  const { data: cardData, isLoading: cardLoading, error: cardError } = useQuery<MultilingualCardData>({
    queryKey: ['/api/cards', cardId, 'multilingual'],
    enabled: !!cardId && cardId !== "",
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: () => apiRequest('/api/multilingual/test', 'GET'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/multilingual/stats'] });
    }
  });

  // Enhance cards mutation
  const enhanceCardsMutation = useMutation({
    mutationFn: (limit: number) => apiRequest('/api/multilingual/enhance', 'POST', { limit }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/multilingual/stats'] });
    }
  });

  const getProgressPercentage = (count: number, total: number) => 
    total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Globe className="h-8 w-8 text-blue-600" />
          Sistema Multilingua Pokémon
        </h1>
        <p className="text-muted-foreground">
          Gestione e test del supporto multilingua per le carte Pokémon
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="test">Test API</TabsTrigger>
          <TabsTrigger value="enhance">Miglioramento</TabsTrigger>
          <TabsTrigger value="card">Visualizza Carta</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Statistiche Database Multilingua
              </CardTitle>
              <CardDescription>
                Stato attuale del supporto multilingua nel database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8">Caricamento statistiche...</div>
              ) : stats ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalCards}</div>
                    <div className="text-sm text-muted-foreground">Carte Totali</div>
                  </div>
                  
                  {Object.entries({
                    cardsWithFrench: 'fr',
                    cardsWithGerman: 'de', 
                    cardsWithSpanish: 'es',
                    cardsWithPortuguese: 'pt',
                    cardsWithDutch: 'nl'
                  }).map(([key, langCode]) => {
                    const count = stats[key as keyof MultilingualStats] as number;
                    const percentage = getProgressPercentage(count, stats.totalCards);
                    const langInfo = LANGUAGE_INFO[langCode as keyof typeof LANGUAGE_INFO];
                    
                    return (
                      <div key={key} className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {count} ({percentage}%)
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {langInfo.flag} {langInfo.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Impossibile caricare le statistiche del database
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Test Connessione TCGdx API
              </CardTitle>
              <CardDescription>
                Testa la connessione all'API multilingua TCGdx
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => testConnectionMutation.mutate()}
                disabled={testConnectionMutation.isPending}
                className="w-full"
              >
                {testConnectionMutation.isPending ? "Testing..." : "Testa Connessione API"}
              </Button>

              {testConnectionMutation.data && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✓ Test completato con successo! L'API TCGdx è funzionante.
                  </AlertDescription>
                </Alert>
              )}

              {testConnectionMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✗ Test fallito: {(testConnectionMutation.error as Error).message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Miglioramento Multilingua
              </CardTitle>
              <CardDescription>
                Aggiungi traduzioni alle carte esistenti nel database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="limit">Numero massimo di carte da migliorare:</Label>
                <Input
                  id="limit"
                  type="number"
                  value={enhanceLimit}
                  onChange={(e) => setEnhanceLimit(e.target.value)}
                  className="w-24"
                  min="1"
                  max="500"
                />
              </div>

              <Button 
                onClick={() => enhanceCardsMutation.mutate(parseInt(enhanceLimit))}
                disabled={enhanceCardsMutation.isPending}
                className="w-full"
              >
                {enhanceCardsMutation.isPending ? 
                  `Migliorando ${enhanceLimit} carte...` : 
                  `Migliora ${enhanceLimit} Carte`
                }
              </Button>

              {enhanceCardsMutation.data && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✓ Miglioramento completato! Le carte sono state aggiornate con dati multilingua.
                  </AlertDescription>
                </Alert>
              )}

              {enhanceCardsMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✗ Miglioramento fallito: {(enhanceCardsMutation.error as Error).message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="card" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualizza Carta Multilingua</CardTitle>
              <CardDescription>
                Visualizza una carta specifica in tutte le lingue disponibili
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="cardId">ID Carta:</Label>
                <Input
                  id="cardId"
                  type="number"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-32"
                  placeholder="1"
                  min="1"
                />
              </div>

              {cardLoading && (
                <div className="text-center py-8">Caricamento carta...</div>
              )}

              {cardError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Errore nel caricamento della carta: {(cardError as Error).message}
                  </AlertDescription>
                </Alert>
              )}

              {cardData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Carta ID: {cardData.cardId}</h3>
                  
                  <div className="grid gap-4">
                    {Object.entries(LANGUAGE_INFO).map(([langCode, langInfo]) => {
                      const name = cardData.names[langCode];
                      const image = cardData.images[langCode];
                      
                      return (
                        <Card key={langCode} className={name ? "border-green-200" : "border-gray-200"}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span>{langInfo.flag} {langInfo.name}</span>
                              {name ? (
                                <Badge variant="secondary">Disponibile</Badge>
                              ) : (
                                <Badge variant="outline">Non Disponibile</Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          {name && (
                            <CardContent>
                              <div className="flex items-center space-x-4">
                                {image && (
                                  <img 
                                    src={image} 
                                    alt={name} 
                                    className="w-16 h-22 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{name}</div>
                                  {cardData.descriptions[langCode] && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {cardData.descriptions[langCode]}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}