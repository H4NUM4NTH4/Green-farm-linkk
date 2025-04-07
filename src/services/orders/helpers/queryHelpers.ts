
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus } from '@/types/product';
import { fetchProductById } from '../../productService';

export const checkFarmerIdColumn = async (): Promise<boolean> => {
  try {
    // Check if farmer_id column exists in order_items table
    // Use a more explicit type assertion to fix the RPC function call error
    const response = await supabase.rpc('check_column_exists', {
      table_name: 'order_items',
      column_name: 'farmer_id'
    });
    
    // Use optional chaining and nullish coalescing for safer access
    return !!response.data;
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

// Fix the type instantiation error by creating a fully explicit interface
export const mapRawOrderToTyped = (rawOrder: any, orderItems: OrderItem[] = []): Order => {
  // Create a new Order object with all properties explicitly defined to avoid deep type checking
  return {
    id: rawOrder.id,
    user_id: rawOrder.user_id,
    status: rawOrder.status as OrderStatus,
    total_amount: rawOrder.total_amount,
    shipping_address: rawOrder.shipping_address,
    payment_method: rawOrder.payment_method,
    created_at: rawOrder.created_at,
    updated_at: rawOrder.updated_at,
    items: orderItems,
    buyer: rawOrder.buyer ? {
      id: rawOrder.buyer.id || rawOrder.user_id,
      full_name: rawOrder.buyer.full_name || null,
      email: rawOrder.buyer.email || null
    } : undefined
  };
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
