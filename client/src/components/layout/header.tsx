import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/ui/language-selector';
import { User, Menu, LogOut, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Placeholder for authentication logic (replace with actual implementation)
  useEffect(() => {
    // Check local storage or cookies for authentication token
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    // Redirect to login page or show login modal
    // After successful login, set isAuthenticated to true and store token
    localStorage.setItem('authToken', 'dummyToken'); // Example
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear authentication token and set isAuthenticated to false
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };


  const navItems = [
    { key: 'home', path: '/', label: t('home') },
    { key: 'news', path: '/news', label: t('news') },
    { key: 'database', path: '/database', label: t('database') },
    { key: 'collection', path: '/collection', label: t('collection') },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="pokemon-header sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-md">PokeHunter</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                className={`transition-colors font-medium ${
                  isActive(item.path)
                    ? 'text-yellow-200 drop-shadow-md'
                    : 'text-white hover:text-yellow-200 drop-shadow-sm'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Language Selector & User Menu */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                    <User className="h-4 w-4 mr-2" />
                    {t('user_menu')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    {t('settings')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm" onClick={handleLogin}>
                <User className="h-4 w-4 mr-2" />
                {t('login')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" className="md:hidden text-white hover:bg-white/20">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}