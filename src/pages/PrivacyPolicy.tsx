import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useSettings } from '@/hooks/useSettings';

const PrivacyPolicy = () => {
  const { data: settings } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-8 text-center">
            Согласие на обработку персональных данных
          </h1>
          
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 prose prose-sm md:prose max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-6">
              В соответствии с требованиями Федерального закона от 27.07.2006 г. № 152-ФЗ 
              «О персональных данных» свободно, своей волей и в своем интересе я даю согласие 
              Индивидуальному предпринимателю Мандаржап Чодураа Чкалововна 
              (ОГРНИП: 326170000001062, ИНН: 170800629300) (далее – Оператор) на обработку 
              своих персональных данных на следующих условиях:
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Перечень персональных данных</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Настоящее согласие даётся на обработку следующих персональных данных:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
              <li>Фамилия, имя, отчество;</li>
              <li>Адрес электронной почты;</li>
              <li>Номер телефона;</li>
              <li>Адрес доставки;</li>
              <li>Иные данные, добровольно предоставленные субъектом персональных данных.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Цели обработки персональных данных</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Персональные данные обрабатываются в следующих целях:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
              <li>Оформление и обработка заказов;</li>
              <li>Доставка товаров;</li>
              <li>Информирование о статусе заказа;</li>
              <li>Ответы на обращения и вопросы;</li>
              <li>Рассылка информационных и рекламных материалов (при наличии согласия);</li>
              <li>Улучшение качества обслуживания.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Действия с персональными данными</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Настоящим я даю согласие на осуществление следующих действий с персональными данными: 
              сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение), 
              извлечение, использование, передача (распространение, предоставление, доступ), 
              обезличивание, блокирование, удаление, уничтожение.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Способы обработки персональных данных</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Обработка персональных данных осуществляется с использованием средств автоматизации 
              и/или без использования таких средств.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Срок действия согласия</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Настоящее согласие действует со дня его предоставления до момента отзыва. 
              Согласие может быть отозвано путём направления письменного заявления на адрес 
              электронной почты: {settings?.email || 'honnyloveskin@outlook.com'}.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Передача персональных данных третьим лицам</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Оператор вправе передавать персональные данные третьим лицам (службам доставки, 
              платёжным системам) исключительно для выполнения заказа субъекта персональных данных.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Защита персональных данных</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Оператор принимает необходимые правовые, организационные и технические меры для 
              защиты персональных данных от неправомерного или случайного доступа, уничтожения, 
              изменения, блокирования, копирования, предоставления, распространения, а также 
              от иных неправомерных действий.
            </p>

            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold mb-4">Контактная информация Оператора:</h3>
              <div className="text-muted-foreground space-y-2">
                <p>ИП Мандаржап Чодураа Чкалововна</p>
                <p>ОГРНИП: 326170000001062</p>
                <p>ИНН: 170800629300</p>
                {settings?.email && <p>Email: {settings.email}</p>}
                {settings?.phone && <p>Телефон: {settings.phone}</p>}
                {settings?.address && <p>Адрес: {settings.address}</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
