export interface Product {
    id: string;
    name: string;
    brand: string;
    category: 'face' | 'body' | 'makeup' | 'pajamas' | 'accessories';
    subcategory: string;
    price: number;
    discountPrice?: number;
    image: string;
    images: string[];
    description: string;
    ingredients?: string;
    usage?: string;
    rating: number;
    reviewCount: number;
    variants?: { name: string; value: string }[];
    inStock: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
}

// Статичные категории (как было)
export const categories = [
    { id: 'face', name: 'Уход за лицом', icon: '✨' },
    { id: 'body', name: 'Уход за телом', icon: '💆' },
    { id: 'makeup', name: 'Декоративная косметика', icon: '💄' },
    { id: 'pajamas', name: 'Пижамы и халаты', icon: '🌙' },
    { id: 'accessories', name: 'Аксессуары', icon: '🎀' },
];

export const getBrandsFromProducts = (products: Product[]): string[] => {
    return Array.from(new Set(products.map((p) => p.brand))).sort();
};

export const products: Product[] = []; // Массив с данными

export const brands: string[] = [];
