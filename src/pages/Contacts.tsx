import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useSettings } from '@/hooks/useSettings';
import { Phone, Mail, MessageCircle, Clock, MapPin } from 'lucide-react';

const Contacts = () => {
  const { data: settings } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-playfair font-bold mb-8 text-center">Контакты</h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Contact Info */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Свяжитесь с нами</h2>
              
              <div className="space-y-6">
                {settings?.phone && (
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Телефон</h3>
                      <a href={`tel:${settings.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {settings?.email && (
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <a href={`mailto:${settings.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Время работы</h3>
                    <p className="text-muted-foreground">
                      Пн-Пт: 10:00 - 20:00<br />
                      Сб-Вс: 11:00 - 18:00
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Адрес</h3>
                    <p className="text-muted-foreground">
                      Россия, г. Москва<br />
                      (Интернет-магазин)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Мы в соцсетях</h2>
              
              <div className="space-y-4">
                {settings?.social_links?.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                  >
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{social.name}</h3>
                      <span className="text-sm text-muted-foreground">{social.url}</span>
                    </div>
                  </a>
                ))}
                
                {(!settings?.social_links || settings.social_links.length === 0) && (
                  <>
                    <a
                      href="https://instagram.com/honnylove.ru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                    >
                      <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-3 rounded-full">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Instagram</h3>
                        <span className="text-sm text-muted-foreground">@honnylove.ru</span>
                      </div>
                    </a>
                    <a
                      href="https://t.me/honnylove"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                    >
                      <div className="bg-blue-500 p-3 rounded-full">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Telegram</h3>
                        <span className="text-sm text-muted-foreground">@honnylove</span>
                      </div>
                    </a>
                  </>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-muted-foreground text-sm">
                  Подписывайтесь на нас в социальных сетях, чтобы быть в курсе новинок, акций и полезных советов по уходу за кожей!
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="bg-primary/10 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold mb-3">Часто задаваемые вопросы</h3>
            <p className="text-muted-foreground mb-4">
              Возможно, ответ на ваш вопрос уже есть на страницах:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/delivery" className="text-primary hover:underline font-medium">
                Доставка и оплата →
              </a>
              <a href="/returns" className="text-primary hover:underline font-medium">
                Возврат товара →
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contacts;
