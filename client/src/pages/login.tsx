
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula l'autenticazione
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      username: formData.username || formData.email.split('@')[0],
      email: formData.email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
    }));
    setLocation('/collection');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pokemon-blue via-pokemon-purple to-pokemon-red flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-pokemon-yellow animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-pokemon-green animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white animate-pulse"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-pokemon-red to-pokemon-blue rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold pokemon-gradient bg-clip-text text-transparent">
            {isLogin ? t('login') : t('register')}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Accedi alla tua collezione Pokemon' : 'Crea il tuo account per iniziare'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Il tuo username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="La tua email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="La tua password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pokemon-red to-pokemon-blue hover:from-pokemon-red/90 hover:to-pokemon-blue/90 text-white font-semibold py-3"
            >
              {isLogin ? 'Accedi' : 'Registrati'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-pokemon-blue hover:text-pokemon-blue/80 font-semibold"
              >
                {isLogin ? 'Registrati' : 'Accedi'}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/">
              <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                Torna alla home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
