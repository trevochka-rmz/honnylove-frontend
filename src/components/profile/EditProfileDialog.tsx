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
import { Loader2, User } from 'lucide-react';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => void;
  isLoading?: boolean;
  defaultFirstName?: string;
  defaultLastName?: string;
  defaultPhone?: string;
}

export const EditProfileDialog = ({
  open,
  onOpenChange,
  onSave,
  isLoading = false,
  defaultFirstName = '',
  defaultLastName = '',
  defaultPhone = '',
}: EditProfileDialogProps) => {
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [phone, setPhone] = useState(defaultPhone);

  const handleSave = () => {
    onSave({
      first_name: firstName.trim() || undefined,
      last_name: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-playfair">
            <User className="h-5 w-5 text-primary" />
            Редактировать профиль
          </DialogTitle>
          <DialogDescription className="font-roboto">
            Обновите ваши личные данные
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-roboto">Имя</Label>
            <Input
              id="firstName"
              placeholder="Ваше имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="font-roboto"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="font-roboto">Фамилия</Label>
            <Input
              id="lastName"
              placeholder="Ваша фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="font-roboto"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-roboto">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="font-roboto"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
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
