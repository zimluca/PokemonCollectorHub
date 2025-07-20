import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface Language {
  code: string;
  name: string;
  flag: string;
  available?: boolean;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', available: true },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', available: true },
  { code: 'fr', name: 'Français', flag: '🇫🇷', available: true },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', available: true },
  { code: 'es', name: 'Español', flag: '🇪🇸', available: true },
  { code: 'pt', name: 'Português', flag: '🇵🇹', available: true },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', available: false },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  showStats?: boolean;
  stats?: Record<string, number>;
}

export function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange, 
  showStats = false,
  stats 
}: LanguageSelectorProps) {
  const currentLanguage = LANGUAGES.find(lang => lang.code === selectedLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
          <span className="sm:hidden">
            {currentLanguage?.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className="flex items-center justify-between"
            disabled={!language.available}
          >
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
              {selectedLanguage === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {!language.available && (
                <Badge variant="secondary" className="text-xs">
                  Presto
                </Badge>
              )}
              {showStats && stats && language.available && (
                <Badge variant="outline" className="text-xs">
                  {stats[language.code] || 0}
                </Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LANGUAGES };