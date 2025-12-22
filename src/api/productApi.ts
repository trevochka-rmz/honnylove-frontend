import axios from 'axios';
import { Product } from '../data/products'; // Импорт интерфейса
import { Brand } from '../data/brands'; // Импорт интерфейса

const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:3050/api/products';

export const getProducts = async (
    filters: Record<string, any> = {}
): Promise<Product[]> => {
    try {
        const response = await axios.get(API_URL, { params: filters });
        // Парсим price и rating в number (из string в БД)
        return response.data.map((p: Product) => ({
            ...p,
            price: parseFloat(p.price as unknown as string), // Каст, т.к. в выводе string
            rating: parseFloat(p.rating as unknown as string),
            discountPrice: p.discountPrice
                ? parseFloat(p.discountPrice as unknown as string)
                : undefined,
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const getProductById = async (id: string): Promise<Product> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        const p = response.data;
        return {
            ...p,
            price: parseFloat(p.price as unknown as string),
            rating: parseFloat(p.rating as unknown as string),
            discountPrice: p.discountPrice
                ? parseFloat(p.discountPrice as unknown as string)
                : undefined,
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const response = await axios.get(`${API_URL}/search`, {
            params: { q: query },
        });
        return response.data.map((p: Product) => ({
            ...p,
            price: parseFloat(p.price as unknown as string),
            rating: parseFloat(p.rating as unknown as string),
            discountPrice: p.discountPrice
                ? parseFloat(p.discountPrice as unknown as string)
                : undefined,
        }));
    } catch (error) {
        console.error('Error searching products:', error);
        throw error;
    }
};

export const getBrands = async (): Promise<Brand[]> => {
    // Brand из src/data/brands.ts
    try {
        const response = await axios.get(
            `${API_URL.replace('products', 'brands')}`
        ); // /api/brands
        return response.data;
    } catch (error) {
        console.error('Error fetching brands:', error);
        throw error;
    }
};
