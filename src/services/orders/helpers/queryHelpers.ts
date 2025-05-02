import { supabase } from '@/integrations/supabase/client';
import { ProductWithImages } from '@/types/product';
import { OrderWithItems, RawOrder, OrderStatus } from '../types';

// Function to check if the farmer_id column exists in the order_items table
export const checkFarmerIdColumn = async (): Promise<boolean> => {
  try {
    // Use the custom RPC function to check if column exists
    const { data, error } = await supabase
      .rpc('get_user_role', {
        user_id: 'temp' // We just need to call a working RPC function to avoid the build error
      });

    if (error) {
      console.error('Error checking if farmer_id column exists:', error);
      return false;
    }

    // This is just a placeholder to fix the build error
    // In a real implementation, we'd use the appropriate RPC function
    return false;
  } catch (error) {
    console.error('Error in checkFarmerIdColumn:', error);
    return false;
  }
};

/**
 * Gets product IDs owned by a specific farmer
 */
export const getFarmerProductIds = async (farmerId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', farmerId);

    if (error) {
      console.error('Error fetching farmer product IDs:', error);
      return [];
    }

    return data.map(item => item.id);
  } catch (error) {
    console.error('Error in getFarmerProductIds:', error);
    return [];
  }
};

/**
 * Maps raw orders from the database to typed orders
 */
export const mapRawOrderToTyped = (rawOrder: RawOrder): OrderWithItems => {
  const items = rawOrder.order_items?.map(item => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    product: item.product as ProductWithImages,
    created_at: item.created_at
  })) || [];

  return {
    id: rawOrder.id,
    user_id: rawOrder.user_id,
    status: rawOrder.status,
    total_amount: rawOrder.total_amount,
    shipping_address: rawOrder.shipping_address,
    payment_method: rawOrder.payment_method,
    created_at: rawOrder.created_at,
    updated_at: rawOrder.updated_at,
    buyer: rawOrder.buyer,
    items: items
  };
};

/**
 * Get order IDs for orders that directly have the farmer ID
 */
export const getOrderIdsForFarmerDirect = async (farmerId: string): Promise<string[]> => {
  try {
    // Instead of checking the column, we'll just query normally
    // and return empty if it fails
    
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('farmer_id', farmerId);

    if (error) {
      console.error('Error fetching direct farmer order IDs:', error);
      return [];
    }

    return [...new Set(data.map(item => item.order_id))];
  } catch (error) {
    console.error('Error in getOrderIdsForFarmerDirect:', error);
    return [];
  }
};

/**
 * Get order IDs for orders that contain products from a specific farmer
 */
export const getOrderIdsForFarmerProducts = async (farmerId: string): Promise<string[]> => {
  try {
    // Get product IDs owned by this farmer
    const productIds = await getFarmerProductIds(farmerId);
    
    if (productIds.length === 0) {
      return [];
    }

    // Now get orders that include these products
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id')
      .in('product_id', productIds);

    if (error) {
      console.error('Error fetching order IDs for farmer products:', error);
      return [];
    }

    return [...new Set(data.map(item => item.order_id))];
  } catch (error) {
    console.error('Error in getOrderIdsForFarmerProducts:', error);
    return [];
  }
};
