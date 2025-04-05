
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
