import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/products';
import { Separator } from '@/components/ui/separator';
import { useAllBrands } from '@/hooks/useBrands';
import { Loader2 } from 'lucide-react';

interface FilterSidebarProps {
  selectedBrands: string[];
  selectedCategories: string[];
  priceRange: [number, number];
  onBrandChange: (brand: string) => void;
  onCategoryChange: (category: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onReset: () => void;
}

export const FilterSidebar = ({
  selectedBrands,
  selectedCategories,
  priceRange,
  onBrandChange,
  onCategoryChange,
  onPriceChange,
  onReset,
}: FilterSidebarProps) => {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const { data: brands = [], isLoading: brandsLoading } = useAllBrands();

  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
    onPriceChange([value[0], value[1]]);
  };

  return (
    <aside className="w-full lg:w-64 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-playfair font-semibold text-lg">Фильтры</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="font-roboto">
          Сбросить
        </Button>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h4 className="font-roboto font-medium mb-3">Категории</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => onCategoryChange(category.id)}
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="text-sm font-roboto cursor-pointer"
              >
                {category.icon} {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h4 className="font-roboto font-medium mb-3">Бренды</h4>
        {brandsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.name)}
                  onCheckedChange={() => onBrandChange(brand.name)}
                />
                <Label htmlFor={`brand-${brand.id}`} className="text-sm font-roboto cursor-pointer">
                  {brand.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="font-roboto font-medium mb-3">Цена</h4>
        <div className="space-y-4">
          <Slider
            min={0}
            max={10000}
            step={100}
            value={localPriceRange}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm font-roboto text-muted-foreground">
            <span>{localPriceRange[0]} ₽</span>
            <span>{localPriceRange[1]} ₽</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
