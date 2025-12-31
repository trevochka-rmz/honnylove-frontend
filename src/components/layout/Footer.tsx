import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
import { useAllCategories } from '@/hooks/useCategories';

export const Footer = () => {
  const { data: categories = [] } = useAllCategories();
  
  // Get only level 1 categories (top level)
  const topLevelCategories = categories.slice(0, 6);

  return (
    <footer className="bg-muted border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-playfair font-bold text-xl mb-4 text-primary">HonnyLove</h3>
            <p className="text-sm text-muted-foreground font-roboto mb-4">
              Премиальная косметика для ухода за кожей и стильная домашняя одежда для вашего комфорта.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
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

          {/* Info */}
          <div>
            <h4 className="font-roboto font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-sm font-roboto">
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
              <li>
                <Link to="/contacts" className="text-muted-foreground hover:text-primary transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-roboto font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm font-roboto">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:+78001234567" className="hover:text-primary transition-colors">
                  8 (800) 123-45-67
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@honnylove.ru" className="hover:text-primary transition-colors">
                  info@honnylove.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground font-roboto">
            © 2024 HonnyLove. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};
