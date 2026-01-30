import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, AlertTriangle, KeyRound, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailVerificationBannerProps {
  email: string;
  onVerified: () => void;
}

export const EmailVerificationBanner = ({ email, onVerified }: EmailVerificationBannerProps) => {
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleRequestCode = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка при отправке кода");
        return;
      }

      toast.success("Код подтверждения отправлен на email");
      setShowCodeDialog(true);
    } catch (error) {
      toast.error("Ошибка соединения с сервером");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      toast.error("Введите код из письма");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Неверный код подтверждения");
        return;
      }

      toast.success("Email успешно подтверждён!");
      setShowCodeDialog(false);
      onVerified();
    } catch (error) {
      toast.error("Ошибка соединения с сервером");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Подтвердите email</p>
            <p className="text-sm text-muted-foreground">
              Для оформления заказов необходимо подтвердить вашу почту
            </p>
          </div>
        </div>
        <Button 
          onClick={handleRequestCode} 
          disabled={isSending}
          className="flex-shrink-0"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Подтвердить
            </>
          )}
        </Button>
      </div>

      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Подтверждение email</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-sm text-center">
                Код отправлен на <span className="font-medium">{email}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Код из письма</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Введите код"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowCodeDialog(false)}
              >
                Отмена
              </Button>
              <Button 
                className="flex-1"
                onClick={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  "Подтвердить"
                )}
              </Button>
            </div>

            <button
              type="button"
              onClick={handleRequestCode}
              disabled={isSending}
              className="w-full text-center text-sm text-primary hover:underline disabled:opacity-50"
            >
              Отправить код повторно
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
