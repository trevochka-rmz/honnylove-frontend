import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useSettings } from '@/hooks/useSettings';

const Returns = () => {
  const { data: settings } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-playfair font-bold mb-8 text-center">Возврат товара</h1>
          
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">↩️</span> Условия возврата
              </h2>
              <p className="text-muted-foreground mb-4">
                Мы заботимся о вашем комфорте и предлагаем гибкие условия возврата товаров.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Возврат возможен в течение <strong>14 дней</strong> с момента получения заказа</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Товар должен сохранить товарный вид, быть неиспользованным и иметь все оригинальные упаковки</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Для оформления возврата необходимо предоставить чек или подтверждение покупки</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📦</span> Как оформить возврат
              </h2>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <div>
                    <strong className="block mb-1">Свяжитесь с нами</strong>
                    <span className="text-muted-foreground">Напишите нам на почту или позвоните, указав номер заказа и причину возврата</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <div>
                    <strong className="block mb-1">Получите инструкции</strong>
                    <span className="text-muted-foreground">Мы пришлём вам подробные инструкции по отправке товара</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <div>
                    <strong className="block mb-1">Отправьте товар</strong>
                    <span className="text-muted-foreground">Упакуйте товар и отправьте его по указанному адресу</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <div>
                    <strong className="block mb-1">Получите возврат средств</strong>
                    <span className="text-muted-foreground">После проверки товара деньги будут возвращены в течение 5-10 рабочих дней</span>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span> Важно знать
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Косметические средства надлежащего качества возврату не подлежат согласно законодательству РФ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Возврат возможен для товаров ненадлежащего качества или при несоответствии заказу</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Домашняя одежда может быть возвращена, если не была в использовании</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/10 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold mb-3">Остались вопросы?</h3>
              <p className="text-muted-foreground mb-4">
                Наша служба поддержки готова помочь вам!
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
                <a href="https://t.me/elsmish" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  💬 Telegram менеджер
                </a>
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

export default Returns;
