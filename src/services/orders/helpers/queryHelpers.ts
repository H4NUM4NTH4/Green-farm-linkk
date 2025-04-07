
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus } from '@/types/product';
import { fetchProductById } from '../../productService';

export const checkFarmerIdColumn = async (): Promise<boolean> => {
  try {
    // Instead of using RPC which is causing type errors, 
    // directly check for the column using a simpler query
    const { data, error } = await supabase
      .from('order_items')
      .select('farmer_id')
      .limit(1);
    
    if (error) {
      // If the error message contains "column" and "does not exist", the column doesn't exist
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        return false;
      }
      console.error('Error checking column:', error);
      return false;
    }
    
    // If we got here, the column exists
    return true;
  } catch (error) {
    console.error('Error in checkFarmerIdColumn:', error);
    return false;
  }
};

export const getFarmerProductIds = async (farmerId: string): Promise<string[]> => {
  try {
    // Get all products owned by this farmer
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', farmerId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching farmer products:', error);
      return [];
    }
    
    return data.map(product => product.id);
  } catch (error) {
    console.error('Error in getFarmerProductIds:', error);
    return [];
  }
};

export const getOrderIdsForFarmerProducts = async (productIds: string[]): Promise<string[]> => {
  try {
    // Get order items containing these products
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id')
      .in('product_id', productIds)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
    
    // Extract and deduplicate order IDs
    return [...new Set(data.map(item => item.order_id))];
  } catch (error) {
    console.error('Error in getOrderIdsForFarmerProducts:', error);
    return [];
  }
};

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

    // Return a simple array of order IDs
    return data.map(item => item.order_id);
  } catch (error) {
    console.error('Error in getOrderIdsForFarmerDirect:', error);
    return [];
  }
};

// Fix the type instantiation error by explicitly defining the structure
export const mapRawOrderToTyped = (rawOrder: any, orderItems: OrderItem[] = []): Order => {
  // Create a simple order object without complex nesting
  const order: Order = {
    id: rawOrder.id,
    user_id: rawOrder.user_id,
    status: rawOrder.status as OrderStatus,
    total_amount: rawOrder.total_amount,
    shipping_address: rawOrder.shipping_address,
    payment_method: rawOrder.payment_method,
    created_at: rawOrder.created_at,
    updated_at: rawOrder.updated_at,
    items: orderItems,
    buyer: undefined
  };
  
  // Add buyer separately if it exists
  if (rawOrder.buyer) {
    order.buyer = {
      id: rawOrder.buyer.id || rawOrder.user_id,
      full_name: rawOrder.buyer.full_name || null,
      email: rawOrder.buyer.email || null
    };
  }
  
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
