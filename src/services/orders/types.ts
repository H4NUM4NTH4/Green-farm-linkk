
import { Order, OrderItem, OrderStatus, ProductWithImages } from '@/types/product';

export type CreateOrderInput = {
  user_id: string;
  total_amount: number;
  shipping_address: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  payment_method: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
};

// Common type for basic order item data
export interface OrderItemBasic {
  order_id: string;
}

// Export the OrderStatus type for reuse
export type { OrderStatus, OrderItem };

// Define BuyerData type to represent possible shapes
export type BuyerData = {
  id: string;
  full_name: string | null;
  email?: string;
};

// Define BuyerError type
export type BuyerError = {
  error: boolean;
};

// Define RawOrder type for database responses
export interface RawOrder {
  id: string;
  user_id: string;
  status: string; // Changed from OrderStatus to string since it comes from DB as string
  total_amount: number;
  shipping_address: any; // Using any to accommodate JSON type from database
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items?: any[];
  buyer?: BuyerData | BuyerError;
}

// Define OrderWithItems which extends Order from product.ts
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Define the expected RPC function types to help TypeScript understand our custom functions
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: 'get_current_user_id' | 'get_user_role' | 'create_order' | 'add_order_item',
      params?: object,
      options?: object
    ): { data: T; error: Error | null };
  }
}
