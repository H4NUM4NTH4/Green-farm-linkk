
// Define product status type
export type ProductStatus = 'active' | 'sold' | 'suspended';

// Base Product type
export type Product = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  quantity_unit: string;
  location: string;
  category: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  ai_recommended: boolean | null;
};

// Product Image type
export type ProductImage = {
  id: string;
  product_id: string;
  image_path: string;
  is_primary: boolean | null;
  created_at: string;
  url?: string; // Add the optional url property
};

// Extended Product type with images and seller info
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
  limit?: number;
};

export const productCategories = [
  'Grains',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Meat',
  'Specialty'
];

// Cart item type
export type CartItem = {
  product: ProductWithImages;
  quantity: number;
};

// Shopping cart state
export type ShoppingCart = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};
