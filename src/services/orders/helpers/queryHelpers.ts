
import { supabase } from '@/integrations/supabase/client';

/**
 * Get all order IDs for orders that contain items from a specific farmer
 * This function uses a direct query approach to avoid RLS recursion issues
 */
export const getOrderIdsForFarmerDirect = async (farmerId: string): Promise<string[]> => {
  try {
    console.log(`Getting order IDs for farmer: ${farmerId}`);
    
    // Use a simple direct query to just get order_ids where farmer_id matches
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching order IDs:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No orders found for farmer: ${farmerId}`);
      return [];
    }
    
    // Extract and deduplicate order IDs
    const orderIds = [...new Set(data.map(item => item.order_id))];
    console.log(`Found ${orderIds.length} order IDs for farmer ${farmerId}:`, orderIds);
    
    return orderIds;
  } catch (error) {
    console.error('Exception in getOrderIdsForFarmerDirect:', error);
    return [];
  }
};

/**
 * Map raw order data from the database to our typed OrderWithItems model
 */
export const mapRawOrderToTyped = (rawOrder: any) => {
  // Parse the order items to ensure they have the correct structure
  const items = rawOrder.order_items?.map((item: any) => ({
    id: item.id,
    order_id: item.order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    product: item.product || undefined
  })) || [];
  
  // Parse buyer data from the raw order
  const buyer = rawOrder.buyer ? {
    id: rawOrder.buyer.id,
    full_name: rawOrder.buyer.full_name,
    email: rawOrder.buyer.email
  } : undefined;
  
  // Ensure shipping_address is properly parsed
  let shippingAddress = rawOrder.shipping_address;
  if (typeof shippingAddress === 'string') {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (e) {
      console.error('Error parsing shipping address:', e);
    }
  }
  
  // Return the fully mapped order object
  return {
    id: rawOrder.id,
    user_id: rawOrder.user_id,
    status: rawOrder.status,
    total_amount: rawOrder.total_amount,
    shipping_address: shippingAddress,
    payment_method: rawOrder.payment_method,
    created_at: rawOrder.created_at,
    updated_at: rawOrder.updated_at,
    buyer: buyer,
    items: items
  };
};
