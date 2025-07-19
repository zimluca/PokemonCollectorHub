
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CardFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export function CardForm({ onSubmit, initialData, onCancel }: CardFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    set: initialData?.set || '',
    number: initialData?.number || '',
    rarity: initialData?.rarity || '',
    condition: initialData?.condition || 'Near Mint',
    quantity: initialData?.quantity || 1,
    value: initialData?.value || 0,
    image: initialData?.image || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: Number(formData.quantity),
      value: Number(formData.value)
    });
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome carta</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="es. Charizard ex"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="set">Set</Label>
          <Select value={formData.set} onValueChange={(value) => handleInputChange('set', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paldea Evolved">Paldea Evolved</SelectItem>
              <SelectItem value="Scarlet & Violet">Scarlet & Violet</SelectItem>
              <SelectItem value="Lost Origin">Lost Origin</SelectItem>
              <SelectItem value="Silver Tempest">Silver Tempest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">Numero carta</Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => handleInputChange('number', e.target.value)}
            placeholder="es. 054/193"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rarity">Rarità</Label>
          <Select value={formData.rarity} onValueChange={(value) => handleInputChange('rarity', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona rarità" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Common">Common</SelectItem>
              <SelectItem value="Uncommon">Uncommon</SelectItem>
              <SelectItem value="Rare">Rare</SelectItem>
              <SelectItem value="Double Rare">Double Rare</SelectItem>
              <SelectItem value="Ultra Rare">Ultra Rare</SelectItem>
              <SelectItem value="Special Illustration Rare">Special Illustration Rare</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="condition">Condizioni</Label>
          <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mint">Mint</SelectItem>
              <SelectItem value="Near Mint">Near Mint</SelectItem>
              <SelectItem value="Lightly Played">Lightly Played</SelectItem>
              <SelectItem value="Moderately Played">Moderately Played</SelectItem>
              <SelectItem value="Heavily Played">Heavily Played</SelectItem>
              <SelectItem value="Damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantità</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valore ($)</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            min="0"
            value={formData.value}
            onChange={(e) => handleInputChange('value', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">URL Immagine</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => handleInputChange('image', e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? 'Aggiorna' : 'Aggiungi'} carta
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
        )}
      </div>
    </form>
  );
}
