import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'Новая коллекция косметики',
    subtitle: 'Премиальный уход за кожей',
    description: 'Откройте для себя инновационные формулы от ведущих брендов',
    cta: 'Смотреть коллекцию',
    link: '/catalog?category=face',
    gradient: 'from-primary/20 to-pink-soft/40',
  },
  {
    id: 2,
    title: 'Уютные пижамы',
    subtitle: 'Комфорт каждую ночь',
    description: 'Шёлк, хлопок, атлас — выбирайте идеальную пижаму',
    cta: 'Выбрать пижаму',
    link: '/catalog?category=pajamas',
    gradient: 'from-secondary/20 to-green-soft/40',
  },
  {
    id: 3,
    title: 'Акции до -40%',
    subtitle: 'Специальные предложения',
    description: 'Скидки на избранные товары — не упустите шанс',
    cta: 'К акциям',
    link: '/sales',
    gradient: 'from-primary/30 to-secondary/30',
  },
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-xl">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`h-full bg-gradient-to-br ${slide.gradient} flex items-center`}>
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                <p className="text-sm font-roboto text-primary mb-2">{slide.subtitle}</p>
                <h2 className="text-4xl md:text-6xl font-playfair font-bold mb-4">
                  {slide.title}
                </h2>
                <p className="text-lg font-roboto text-foreground/80 mb-8">
                  {slide.description}
                </p>
                <Button size="lg" asChild className="font-roboto">
                  <Link to={slide.link}>{slide.cta}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-primary w-8' : 'bg-foreground/30'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
