import { useMemo } from 'react';
import { StockVariant } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  variants: StockVariant[];
  selectedVariantId: number | null;
  onSelectVariant: (variant: StockVariant) => void;
  isClothing: boolean;
}

export const VariantSelector = ({ variants, selectedVariantId, onSelectVariant, isClothing }: VariantSelectorProps) => {
  if (!isClothing) {
    // Simple variant selector for cosmetics (volume, etc.)
    return (
      <div className="mb-6">
        <label className="text-sm font-medium font-roboto mb-3 block">
          {Object.keys(variants[0]?.options || {}).filter(k => k !== 'Код').join(' / ')}:
        </label>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isSelected = variant.id === selectedVariantId;
            const optionLabel = Object.entries(variant.options)
              .filter(([key]) => key !== 'Код')
              .map(([, val]) => val)
              .join(' / ');
            return (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant)}
                disabled={!variant.inStock}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-roboto transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/50',
                  !variant.inStock && 'opacity-40 line-through cursor-not-allowed'
                )}
              >
                {optionLabel}
                {!variant.inStock && <span className="ml-1 text-xs">(нет)</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Clothing: separate Color and Size selectors
  return <ClothingVariantSelector variants={variants} selectedVariantId={selectedVariantId} onSelectVariant={onSelectVariant} />;
};

interface ClothingVariantSelectorProps {
  variants: StockVariant[];
  selectedVariantId: number | null;
  onSelectVariant: (variant: StockVariant) => void;
}

const ClothingVariantSelector = ({ variants, selectedVariantId, onSelectVariant }: ClothingVariantSelectorProps) => {
  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  const selectedColor = selectedVariant?.options?.['Цвет'] || '';
  const selectedSize = selectedVariant?.options?.['Размер'] || '';

  // Extract unique colors with their hex codes
  const colors = useMemo(() => {
    const colorMap = new Map<string, string>();
    variants.forEach(v => {
      const color = v.options?.['Цвет'];
      const code = v.options?.['Код'];
      if (color && !colorMap.has(color)) {
        colorMap.set(color, code || '');
      }
    });
    return Array.from(colorMap.entries()).map(([name, code]) => ({ name, code }));
  }, [variants]);

  // Get sizes for selected color
  const sizesForColor = useMemo(() => {
    if (!selectedColor) return [];
    return variants
      .filter(v => v.options?.['Цвет'] === selectedColor)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [variants, selectedColor]);

  // Size order for proper sorting
  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  const sortedSizes = useMemo(() => {
    return [...sizesForColor].sort((a, b) => {
      const sizeA = a.options?.['Размер'] || '';
      const sizeB = b.options?.['Размер'] || '';
      const idxA = sizeOrder.indexOf(sizeA);
      const idxB = sizeOrder.indexOf(sizeB);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.sortOrder - b.sortOrder;
    });
  }, [sizesForColor]);

  // Check if any variant of a color is in stock
  const isColorAvailable = (colorName: string) => {
    return variants.some(v => v.options?.['Цвет'] === colorName && v.inStock);
  };

  const handleColorSelect = (colorName: string) => {
    // Find first available variant with this color and current size, or just first available
    const withSameSize = variants.find(v => v.options?.['Цвет'] === colorName && v.options?.['Размер'] === selectedSize && v.inStock);
    const firstAvailable = variants.find(v => v.options?.['Цвет'] === colorName && v.inStock);
    const firstAny = variants.find(v => v.options?.['Цвет'] === colorName);
    onSelectVariant(withSameSize || firstAvailable || firstAny!);
  };

  const handleSizeSelect = (variant: StockVariant) => {
    onSelectVariant(variant);
  };

  return (
    <div className="space-y-5 mb-6">
      {/* Color selector */}
      {colors.length > 0 && (
        <div>
          <label className="text-sm font-medium font-roboto mb-3 block">
            Цвет: <span className="text-muted-foreground font-normal">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map(({ name, code }) => {
              const isSelected = name === selectedColor;
              const available = isColorAvailable(name);
              return (
                <button
                  key={name}
                  onClick={() => handleColorSelect(name)}
                  className={cn(
                    'relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center',
                    isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50',
                    !available && 'opacity-40'
                  )}
                  title={name}
                >
                  <div
                    className="w-7 h-7 rounded-full"
                    style={{ backgroundColor: code || '#ccc' }}
                  />
                  {!available && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-[2px] bg-muted-foreground rotate-45 absolute" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sortedSizes.length > 0 && (
        <div>
          <label className="text-sm font-medium font-roboto mb-3 block">
            Размер: <span className="text-muted-foreground font-normal">{selectedSize}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {sortedSizes.map((variant) => {
              const size = variant.options?.['Размер'] || variant.name;
              const isSelected = variant.id === selectedVariantId;
              return (
                <button
                  key={variant.id}
                  onClick={() => handleSizeSelect(variant)}
                  disabled={!variant.inStock}
                  className={cn(
                    'min-w-[48px] px-3 py-2 rounded-lg border text-sm font-roboto transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/50',
                    !variant.inStock && 'opacity-40 line-through cursor-not-allowed'
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {selectedVariant && !selectedVariant.inStock && (
            <Badge variant="secondary" className="mt-2 text-xs">
              Нет в наличии для выбранного варианта
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
