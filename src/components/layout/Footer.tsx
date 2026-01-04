import { Link } from 'react-router-dom';
import { Phone, Mail, Send } from 'lucide-react';
import { useAllCategories } from '@/hooks/useCategories';
import { useSettings } from '@/hooks/useSettings';

// Instagram icon component
const InstagramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Telegram icon component
const TelegramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export const Footer = () => {
  const { data: categories = [] } = useAllCategories();
  const { data: settings } = useSettings();
  
  // Get only level 1 categories (top level)
  const topLevelCategories = categories.slice(0, 6);

  // Get social icon by name/url
  const getSocialIcon = (social: { name: string; url: string }) => {
    const name = social.name.toLowerCase();
    const url = social.url.toLowerCase();
    
    if (name.includes('instagram') || url.includes('instagram')) {
      return <InstagramIcon />;
    }
    if (name.includes('telegram') || url.includes('t.me') || url.includes('telegram')) {
      return <TelegramIcon />;
    }
    return <Send className="h-5 w-5" />;
  };

  return (
    <footer className="bg-muted border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-playfair font-bold text-xl mb-4 text-primary">HonnyLove</h3>
            <p className="text-sm text-muted-foreground font-roboto mb-4">
              {settings?.description || 'Премиальная косметика для ухода за кожей и стильная домашняя одежда для вашего комфорта.'}
            </p>
            <div className="flex gap-3">
              {settings?.social_links?.map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  title={social.name}
                >
                  {getSocialIcon(social)}
                </a>
              ))}
              {(!settings?.social_links || settings.social_links.length === 0) && (
                <>
                  <a href="https://instagram.com/honnylove.ru" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <InstagramIcon />
                  </a>
                  <a href="https://t.me/honnylove" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <TelegramIcon />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Categories from API */}
          <div>
            <h4 className="font-roboto font-semibold mb-4">Категории</h4>
            <ul className="space-y-2 text-sm font-roboto">
              {topLevelCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`/catalog?categoryId=${category.id}`} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info - from API or fallback */}
          <div>
            <h4 className="font-roboto font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-sm font-roboto">
              {settings?.footer_links?.map((link, index) => (
                <li key={index}>
                  <Link to={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
              {(!settings?.footer_links || settings.footer_links.length === 0) && (
                <>
                  <li>
                    <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                      О нас
                    </Link>
                  </li>
                  <li>
                    <Link to="/delivery" className="text-muted-foreground hover:text-primary transition-colors">
                      Доставка и оплата
                    </Link>
                  </li>
                  <li>
                    <Link to="/returns" className="text-muted-foreground hover:text-primary transition-colors">
                      Возврат товара
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/contacts" className="text-muted-foreground hover:text-primary transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts - from API */}
          <div>
            <h4 className="font-roboto font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm font-roboto">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href={`tel:${settings?.phone || '+78001234567'}`} className="hover:text-primary transition-colors">
                  {settings?.phone || '8 (800) 123-45-67'}
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${settings?.email || 'info@honnylove.ru'}`} className="hover:text-primary transition-colors">
                  {settings?.email || 'info@honnylove.ru'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground font-roboto">
            © {new Date().getFullYear()} HonnyLove. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};
