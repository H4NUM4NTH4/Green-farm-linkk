import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus } from '@/types/product';
import { fetchProductById } from '../../productService';

export const getOrderIdsForFarmer = async (farmerId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders for farmer:', error);
      return [];
    }

    // Extract and deduplicate order IDs
    return [...new Set(data.map(item => item.order_id))];
  } catch (error) {
    console.error('Error in getOrderIdsForFarmer:', error);
    return [];
  }
};

export const getOrderIdsForFarmerDirect = async (farmerId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders for farmer:', error);
      return [];
    }

    // Return a simple array of order IDs to avoid deep type instantiation
    return data.map(item => item.order_id);
  } catch (error) {
    console.error('Error in getOrderIdsForFarmerDirect:', error);
    return [];
  }
};

// Convert raw database order to typed Order object
export const mapRawOrderToTyped = (rawOrder: any, orderItems: any[] = []): Order => {
  // Use type assertion to avoid deep type checking
  const order = {
    ...rawOrder,
    status: rawOrder.status as OrderStatus,
    shipping_address: rawOrder.shipping_address,
    items: orderItems as OrderItem[]
  } as Order;
  
  return order;
};

export const hydrateOrderItems = async (orderItems: any[]): Promise<OrderItem[]> => {
  const hydratedItems: OrderItem[] = [];
  
  for (const item of orderItems) {
    try {
      const product = await fetchProductById(item.product_id);
      if (product) {
        hydratedItems.push({
          ...item,
          product
        });
      } else {
        hydratedItems.push(item as OrderItem);
      }
    } catch (error) {
      console.error(`Error hydrating order item ${item.id}:`, error);
      hydratedItems.push(item as OrderItem);
    }
  }
  
  return hydratedItems;
};
