import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Send } from 'lucide-react';
import { FaTwitter, FaFacebook, FaInstagram, FaDiscord } from 'react-icons/fa';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pokemon-blue to-pokemon-purple rounded-full flex items-center justify-center">
                <Zap className="text-white text-lg" />
              </div>
              <h3 className="text-2xl font-bold">PokeHunter</h3>
            </div>
            <p className="text-gray-400 mb-4">
              The ultimate platform for Pokemon card hunters worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-pokemon-blue">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-pokemon-blue">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-pokemon-blue">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-pokemon-blue">
                <FaDiscord />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('features')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  {t('cardDatabase')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t('collectionTracking')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t('priceComparison')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t('newsUpdates')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('support')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  {t('helpCenter')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t('contactUs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t('apiDocumentation')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t('community')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('newsletter')}</h4>
            <p className="text-gray-400 mb-4">{t('newsletterText')}</p>
            <div className="flex">
              <Input
                type="email"
                placeholder={t('yourEmail')}
                className="flex-1 bg-gray-800 text-white border-gray-700 rounded-r-none"
              />
              <Button className="bg-pokemon-blue hover:bg-blue-600 rounded-l-none">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; 2024 PokeHunter. All rights reserved. |{' '}
            <a href="#" className="hover:text-white">
              {t('privacyPolicy')}
            </a>{' '}
            |{' '}
            <a href="#" className="hover:text-white">
              {t('termsOfService')}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
