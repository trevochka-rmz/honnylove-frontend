import { useState, useMemo } from 'react';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { russianCities } from '@/data/cities';
import { MapPin, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch) return russianCities;
    const search = citySearch.toLowerCase();
    return russianCities.filter(c => c.toLowerCase().includes(search));
  }, [citySearch]);

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
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={cityOpen}
                  className="w-full justify-between font-normal"
                >
                  {city || "Выберите город..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Поиск города..." 
                    value={citySearch}
                    onValueChange={setCitySearch}
                  />
                  <CommandList>
                    <CommandEmpty>Город не найден</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-auto">
                      {filteredCities.map((c) => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={(currentValue) => {
                            setCity(currentValue);
                            setCityOpen(false);
                            setCitySearch('');
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              city === c ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
