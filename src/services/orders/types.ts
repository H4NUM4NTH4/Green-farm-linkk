
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
export { OrderStatus };

// Define RawOrder type for database responses
export interface RawOrder {
  id: string;
  user_id: string;
  status: OrderStatus;
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
  created_at: string;
  updated_at: string;
  order_items?: any[];
  buyer?: {
    id: string;
    full_name: string | null;
    email?: string;
  };
}

// Define OrderWithItems for fully populated order data
export interface OrderWithItems extends Order {
  items: OrderItem[];
}
