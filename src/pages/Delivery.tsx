import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useSettings } from "@/hooks/useSettings";
import { Truck, CreditCard, Clock, MapPin, Phone, Mail, Loader2 } from "lucide-react";

const Delivery = () => {
  const { data: settings, isLoading } = useSettings();
  
  // Fallback contacts
  const phone = settings?.phone || '+7 (901) 678-20-80';
  const email = settings?.email || 'honnyloveskin@outlook.com';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-playfair text-4xl font-bold text-center mb-8">
          Доставка и оплата
        </h1>

        {/* Delivery Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="h-8 w-8 text-primary" />
            <h2 className="font-playfair text-2xl font-semibold">Доставка</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Курьерская доставка
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <span className="text-primary font-medium">По г. Кызыл — бесплатно!</span> (1-2 рабочих дня)</li>
                <li>• Доставка по России: 3-7 рабочих дней</li>
                <li>• Стоимость: 300₽ (фиксированная)</li>
                <li>• <span className="text-primary font-medium">Бесплатная доставка при заказе от 3000₽</span></li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Самовывоз
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <span className="text-primary font-medium">Бесплатно!</span></li>
                {settings?.address && (
                  <li className="flex items-start gap-1">
                    • Адрес: <span className="font-medium text-foreground">{settings.address}</span>
                  </li>
                )}
                <li>• Заберите заказ в удобное для вас время</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Payment Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="h-8 w-8 text-primary" />
            <h2 className="font-playfair text-2xl font-semibold">Оплата</h2>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Банковской картой</h3>
                <p className="text-muted-foreground text-sm">
                  Visa, MasterCard, Мир. Безопасная оплата через защищённое соединение.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">СБП (Система быстрых платежей)</h3>
                <p className="text-muted-foreground text-sm">
                  Мгновенная оплата через мобильное приложение вашего банка.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">При получении</h3>
                <p className="text-muted-foreground text-sm">
                  Наличными или картой курьеру при получении заказа.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-secondary/30 rounded-3xl p-8">
          <h2 className="font-playfair text-2xl font-semibold text-center mb-6">
            Остались вопросы?
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            <a 
              href={`tel:${phone.replace(/[\s()-]/g, '')}`} 
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-5 w-5" />
              {phone}
            </a>
            <a 
              href={`mailto:${email}`} 
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-5 w-5" />
              {email}
            </a>
            <a 
              href="https://t.me/elsmish" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Send className="h-5 w-5" />
              Telegram менеджер
            </a>
          </div>
          {settings?.address && (
            <p className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
              <MapPin className="h-5 w-5" />
              {settings.address}
            </p>
          )}
          <p className="text-center text-muted-foreground mt-4">
            Мы работаем ежедневно с 10:00 до 20:00
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Delivery;