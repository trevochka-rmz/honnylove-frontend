import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { russianCities } from '@/data/cities';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (address: { city: string; street: string; fullAddress: string }) => void;
  isLoading?: boolean;
  defaultCity?: string;
  defaultStreet?: string;
}

export const AddressDialog = ({
  open,
  onOpenChange,
  onSave,
  isLoading = false,
  defaultCity = '',
  defaultStreet = '',
}: AddressDialogProps) => {
  const [city, setCity] = useState(defaultCity);
  const [street, setStreet] = useState(defaultStreet);

  const handleSave = () => {
    if (!city || !street.trim()) return;
    const fullAddress = `${city}, ${street.trim()}`;
    onSave({ city, street: street.trim(), fullAddress });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-playfair">
            <MapPin className="h-5 w-5 text-primary" />
            Укажите адрес доставки
          </DialogTitle>
          <DialogDescription className="font-roboto">
            Добавьте ваш адрес для удобного оформления заказов
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="font-roboto">Город</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {russianCities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="street" className="font-roboto">Улица, дом, квартира</Label>
            <Input
              id="street"
              placeholder="ул. Примерная, д. 1, кв. 1"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="font-roboto"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Позже
          </Button>
          <Button onClick={handleSave} disabled={!city || !street.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
