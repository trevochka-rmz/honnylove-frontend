import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useBrandsBrief } from '@/hooks/useBrandsBrief';
import { ApiCategory } from '@/services/api';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';

interface FilterSidebarProps {
  selectedBrandIds: number[];
  selectedCategoryId: number | null;
  priceRange: [number, number];
  onlyOnSale: boolean;
  onBrandChange: (brandId: number) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onPriceChange: (range: [number, number]) => void;
  onSaleChange: (onSale: boolean) => void;
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
  onlyOnSale,
  onBrandChange,
  onCategoryChange,
  onPriceChange,
  onSaleChange,
  onReset,
  categories,
}: FilterSidebarProps) => {
  const [minPrice, setMinPrice] = useState(priceRange[0].toString());
  const [maxPrice, setMaxPrice] = useState(priceRange[1].toString());
  const { data: brands = [], isLoading: brandsLoading } = useBrandsBrief();

  // Sync local state with props
  useEffect(() => {
    setMinPrice(priceRange[0].toString());
    setMaxPrice(priceRange[1].toString());
  }, [priceRange]);

  const handleMinPriceBlur = () => {
    const min = parseInt(minPrice) || 0;
    const max = parseInt(maxPrice) || 10000;
    onPriceChange([Math.min(min, max), Math.max(min, max)]);
  };

  const handleMaxPriceBlur = () => {
    const min = parseInt(minPrice) || 0;
    const max = parseInt(maxPrice) || 10000;
    onPriceChange([Math.min(min, max), Math.max(min, max)]);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const min = parseInt(minPrice) || 0;
      const max = parseInt(maxPrice) || 10000;
      onPriceChange([Math.min(min, max), Math.max(min, max)]);
    }
  };

  return (
    <aside className="w-full lg:w-64 space-y-4">
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
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="От"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handleMinPriceBlur}
              onKeyDown={handlePriceKeyDown}
              className="text-sm"
            />
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handleMaxPriceBlur}
              onKeyDown={handlePriceKeyDown}
              className="text-sm"
            />
          </div>
          <span className="text-muted-foreground text-sm">₽</span>
        </div>
      </div>

      <Separator />

      {/* Sale Filter */}
      <div className="flex items-center justify-between">
        <Label htmlFor="sale-toggle" className="font-roboto font-medium cursor-pointer">
          Только со скидкой
        </Label>
        <Switch
          id="sale-toggle"
          checked={onlyOnSale}
          onCheckedChange={onSaleChange}
        />
      </div>

      <Separator />

      {/* Reset Button */}
      <Button variant="outline" size="sm" onClick={onReset} className="w-full font-roboto">
        Сбросить фильтры
      </Button>
    </aside>
  );
};
