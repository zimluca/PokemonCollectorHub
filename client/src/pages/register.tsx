import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore durante la registrazione');
      }

      // Redirect to home page on successful registration
      window.location.href = '/';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore durante la registrazione');
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
              Registrati a PokeHunter
            </CardTitle>
            <CardDescription className="text-gray-600">
              Crea il tuo account per iniziare la collezione
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">
                    Nome
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Nome"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="border-gray-200 focus:border-pokemon-blue focus:ring-pokemon-blue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">
                    Cognome
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Cognome"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="border-gray-200 focus:border-pokemon-blue focus:ring-pokemon-blue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Username *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Scegli un username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-10 border-gray-200 focus:border-pokemon-blue focus:ring-pokemon-blue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Inserisci la tua email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 border-gray-200 focus:border-pokemon-blue focus:ring-pokemon-blue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Scegli una password (min 6 caratteri)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
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
                    Registrazione in corso...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrati
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Hai già un account?{' '}
                <Link href="/login">
                  <span className="text-pokemon-blue hover:text-pokemon-purple font-semibold cursor-pointer">
                    Accedi qui
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