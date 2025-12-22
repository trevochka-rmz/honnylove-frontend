import axios from 'axios';
import { Brand } from '@/data/brands'; // Интерфейс

const API_URL =
    import.meta.env.VITE_API_URL?.replace('products', 'brands') ||
    'http://localhost:3050/api/brands';

export const getBrands = async (): Promise<Brand[]> => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching brands:', error);
        throw error;
    }
};

export const getBrandById = async (id: string): Promise<Brand> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching brand:', error);
        throw error;
    }
};
