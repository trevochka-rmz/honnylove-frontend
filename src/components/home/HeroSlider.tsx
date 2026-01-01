import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:3050';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  display_order: number;
  is_active: boolean;
  preheader: string;
}

// Fallback static slides
const fallbackSlides = [
  {
    id: 1,
    title: 'Новая коллекция косметики',
    preheader: 'Премиальный уход за кожей',
    subtitle: 'Откройте для себя инновационные формулы от ведущих брендов',
    button_text: 'Смотреть коллекцию',
    button_link: '/catalog',
    image_url: '',
    gradient: 'from-primary/20 to-pink-soft/40',
  },
  {
    id: 2,
    title: 'Уютные пижамы',
    preheader: 'Комфорт на каждую ночь',
    subtitle: 'Шёлк, хлопок, атлас — выбирайте идеальную пижаму',
    button_text: 'Выбрать пижаму',
    button_link: '/catalog?categoryId=42',
    image_url: '',
    gradient: 'from-secondary/20 to-green-soft/40',
  },
  {
    id: 3,
    title: 'Акции до -40%',
    preheader: 'Специальные предложения',
    subtitle: 'Скидки на избранные товары — не упустите шанс',
    button_text: 'К акциям',
    button_link: '/sales',
    image_url: '',
    gradient: 'from-primary/30 to-secondary/30',
  },
];

const gradients = [
  'from-primary/20 to-pink-soft/40',
  'from-secondary/20 to-green-soft/40',
  'from-primary/30 to-secondary/30',
  'from-accent/30 to-primary/20',
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/banners`);
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const slides = banners && banners.length > 0 ? banners : fallbackSlides;

  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleImageError = (slideId: number) => {
    setImageErrors((prev) => ({ ...prev, [slideId]: true }));
  };

  if (isLoading) {
    return (
      <div className="w-full h-[500px] md:h-[600px] rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-xl">
      {slides.map((slide, index) => {
        const hasImage = slide.image_url && !imageErrors[slide.id];
        const gradient = gradients[index % gradients.length];

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Background */}
            <div className="absolute inset-0">
              {hasImage ? (
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(slide.id)}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
              )}
              {/* Overlay for text readability */}
              {hasImage && (
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />
              )}
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 pl-16 md:pl-20">
                <div className="max-w-2xl ml-8 md:ml-12">
                  <p className="text-sm font-roboto text-primary mb-2">{slide.preheader}</p>
                  <h2 className="text-4xl md:text-6xl font-playfair font-bold mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-lg font-roboto text-foreground/80 mb-8">
                    {slide.subtitle}
                  </p>
                  <Button size="lg" asChild className="font-roboto">
                    <Link to={slide.button_link}>{slide.button_text}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
