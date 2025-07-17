import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Collection() {
  const { t } = useTranslation();

  const collectionData = [
    {
      name: 'Paldea Evolved',
      completion: 89,
      total: 207,
      owned: 184,
      missing: 23,
      value: 456,
      color: 'bg-pokemon-green',
    },
    {
      name: 'Scarlet & Violet',
      completion: 67,
      total: 198,
      owned: 133,
      missing: 65,
      value: 342,
      color: 'bg-pokemon-yellow',
    },
    {
      name: 'Lost Origin',
      completion: 45,
      total: 196,
      owned: 88,
      missing: 108,
      value: 298,
      color: 'bg-pokemon-red',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          {t('myCollection')}
        </h1>

        {/* Collection Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-pokemon-blue mb-2">1,247</div>
              <div className="text-gray-600">{t('totalCards')}</div>
              <div className="text-sm text-gray-500 mt-1">Across 12 Sets</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-pokemon-green mb-2">$2,450</div>
              <div className="text-gray-600">{t('collectionValue')}</div>
              <div className="text-sm text-gray-500 mt-1">+12% this month</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-pokemon-purple mb-2">89%</div>
              <div className="text-gray-600">{t('completionRate')}</div>
              <div className="text-sm text-gray-500 mt-1">Paldea Evolved Set</div>
            </CardContent>
          </Card>
        </div>

        {/* Collection Tabs */}
        <Card>
          <Tabs defaultValue="by-set" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="by-set">{t('bySet')}</TabsTrigger>
                <TabsTrigger value="by-type">{t('byType')}</TabsTrigger>
                <TabsTrigger value="wishlist">{t('wishlist')}</TabsTrigger>
                <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="by-set" className="p-6">
              <div className="space-y-6">
                {collectionData.map((collection) => (
                  <div key={collection.name} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{collection.name}</h3>
                      <span className="text-pokemon-green font-semibold">
                        {collection.completion}% {t('complete')}
                      </span>
                    </div>
                    <Progress value={collection.completion} className="mb-4" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Total Cards</div>
                        <div className="font-semibold">{collection.total}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">{t('owned')}</div>
                        <div className="font-semibold">{collection.owned}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">{t('missing')}</div>
                        <div className="font-semibold">{collection.missing}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">{t('value')}</div>
                        <div className="font-semibold">${collection.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="by-type" className="p-6">
              <div className="text-center text-gray-500 py-12">
                Collection by type view coming soon...
              </div>
            </TabsContent>

            <TabsContent value="wishlist" className="p-6">
              <div className="text-center text-gray-500 py-12">
                Wishlist feature coming soon...
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="text-center text-gray-500 py-12">
                Analytics dashboard coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
