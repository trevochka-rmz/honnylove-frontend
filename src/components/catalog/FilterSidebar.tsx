import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBrandsBrief } from '@/hooks/useBrandsBrief';
import { ApiCategory } from '@/services/api';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FilterSidebarProps {
  selectedBrandIds: number[];
  selectedCategoryId: number | null;
  priceRange: [number, number];
  onBrandChange: (brandId: number) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onPriceChange: (range: [number, number]) => void;
  onReset: () => void;
  categories: ApiCategory[];
}

// Recursive category tree component
const CategoryTree = ({ 
  categories, 
  selectedCategoryId, 
  onSelect, 
  level = 0 
}: { 
  categories: ApiCategory[]; 
  selectedCategoryId: number | null;
  onSelect: (id: number | null) => void;
  level?: number;
}) => {
  const [openCategories, setOpenCategories] = useState<number[]>([]);

  const toggleCategory = (id: number) => {
    setOpenCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className={level > 0 ? 'ml-4 mt-1' : ''}>
      {categories.map((category) => {
        const hasChildren = category.children && category.children.length > 0;
        const isOpen = openCategories.includes(category.id);
        const isSelected = selectedCategoryId === category.id;

        return (
          <div key={category.id} className="py-1">
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-0.5 hover:bg-secondary rounded"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}
              {!hasChildren && <span className="w-4" />}
              <button
                onClick={() => onSelect(category.id)}
                className={`text-sm text-left hover:text-primary transition-colors ${
                  isSelected ? 'text-primary font-medium' : ''
                }`}
              >
                {category.name}
              </button>
            </div>
            {hasChildren && isOpen && (
              <CategoryTree 
                categories={category.children!} 
                selectedCategoryId={selectedCategoryId}
                onSelect={onSelect}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const FilterSidebar = ({
  selectedBrandIds,
  selectedCategoryId,
  priceRange,
  onBrandChange,
  onCategoryChange,
  onPriceChange,
  onReset,
  categories,
}: FilterSidebarProps) => {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const { data: brands = [], isLoading: brandsLoading } = useBrandsBrief();

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
        <div className="max-h-72 overflow-y-auto">
          <button
            onClick={() => onCategoryChange(null)}
            className={`text-sm mb-2 hover:text-primary transition-colors ${
              selectedCategoryId === null ? 'text-primary font-medium' : ''
            }`}
          >
            Все категории
          </button>
          <CategoryTree 
            categories={categories} 
            selectedCategoryId={selectedCategoryId}
            onSelect={onCategoryChange}
          />
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
                  checked={selectedBrandIds.includes(brand.id)}
                  onCheckedChange={() => onBrandChange(brand.id)}
                />
                <Label htmlFor={`brand-${brand.id}`} className="text-sm font-roboto cursor-pointer flex items-center gap-2">
                  {brand.logo && (
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="w-5 h-5 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
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
