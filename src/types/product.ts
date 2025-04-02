
import { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];

export type ProductWithImages = Product & {
  images: ProductImage[];
  primary_image?: string;
  seller?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    verified: boolean;
  };
};

export type ProductFilter = {
  search?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'rating';
  verifiedOnly?: boolean;
  aiRecommended?: boolean;
};

export const productCategories = [
  'Grains',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Meat',
  'Specialty'
];
