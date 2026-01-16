import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  className?: string;
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ImagePlaceholder = ({ 
  className, 
  message = "Изображение скоро появится",
  subMessage = "Мы работаем над этим ✨",
  size = 'md'
}: ImagePlaceholderProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-gradient-to-br from-secondary/50 to-rose-light/30 text-muted-foreground",
      className
    )}>
      <div className="p-3 rounded-full bg-secondary/50 mb-3">
        <ImageOff className={cn(sizeClasses[size], "text-primary/50")} />
      </div>
      <p className={cn("font-roboto font-medium text-center px-4", textSizes[size])}>
        {message}
      </p>
      <p className={cn("text-muted-foreground/70 text-center mt-1 px-4", size === 'lg' ? 'text-sm' : 'text-xs')}>
        {subMessage}
      </p>
    </div>
  );
};
