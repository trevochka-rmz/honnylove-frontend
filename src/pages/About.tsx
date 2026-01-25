import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useSettings } from '@/hooks/useSettings';

const About = () => {
  const { data: settings } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-playfair font-bold mb-8 text-center">О нас</h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-playfair font-semibold mb-4">Добро пожаловать в HonnyLove!</h2>
              <p className="text-muted-foreground mb-4">
                {settings?.description || 'Премиальная косметика для ухода за кожей и стильная домашняя одежда для вашего комфорта.'}
              </p>
              <p className="text-muted-foreground mb-4">
                Мы — онлайн-магазин корейской косметики и уютной домашней одежды. Наша миссия — 
                сделать качественный уход за кожей доступным каждому, предлагая только проверенные 
                и сертифицированные продукты от лучших азиатских брендов.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">✨</span> Наши ценности
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Только оригинальная продукция</li>
                  <li>• Честные цены без накруток</li>
                  <li>• Быстрая и бережная доставка</li>
                  <li>• Индивидуальный подход к каждому клиенту</li>
                </ul>
              </div>
              
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🌸</span> Почему мы?
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Прямые поставки из Кореи и Японии</li>
                  <li>• Широкий ассортимент брендов</li>
                  <li>• Экспертные консультации</li>
                  <li>• Программа лояльности для постоянных клиентов</li>
                </ul>
              </div>
            </div>

            <div className="bg-primary/10 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold mb-3">Свяжитесь с нами</h3>
              <p className="text-muted-foreground mb-4">
                Мы всегда рады помочь вам с выбором и ответить на любые вопросы!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {settings?.phone && (
                  <a href={`tel:${settings.phone}`} className="text-primary hover:underline font-medium">
                    📞 {settings.phone}
                  </a>
                )}
                {settings?.email && (
                  <a href={`mailto:${settings.email}`} className="text-primary hover:underline font-medium">
                    ✉️ {settings.email}
                  </a>
                )}
              </div>
              {settings?.address && (
                <p className="text-muted-foreground mt-4">
                  📍 {settings.address}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
