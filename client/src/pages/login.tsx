import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore durante il login');
      }

      // Redirect to home page on successful login
      window.location.href = '/';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore durante il login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-pokemon-blue">
              Accedi a PokeHunter
            </CardTitle>
            <CardDescription className="text-gray-600">
              Inserisci le tue credenziali per accedere
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Inserisci il tuo username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-10 border-gray-200 focus:border-pokemon-blue focus:ring-pokemon-blue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Inserisci la tua password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 border-gray-200 focus:border-pokemon-blue focus:ring-pokemon-blue"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pokemon-blue to-pokemon-purple hover:from-pokemon-purple hover:to-pokemon-blue text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Non hai un account?{' '}
                <Link href="/register">
                  <span className="text-pokemon-blue hover:text-pokemon-purple font-semibold cursor-pointer">
                    Registrati qui
                  </span>
                </Link>
              </p>
              <Link href="/">
                <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                  Torna alla homepage
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}