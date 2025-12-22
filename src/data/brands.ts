export interface Brand {
    id: string;
    name: string;
    logo: string;
    description: string;
    fullDescription: string;
    country: string;
    founded: string;
    philosophy: string;
    highlights: string[];
    productsCount: number;
}

export const brands: string[] = [];

export const getBrandById = (
    brands: Brand[],
    id: string
): Brand | undefined => {
    return brands.find((brand) => brand.id === id);
};
