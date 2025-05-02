
import { supabase } from '@/integrations/supabase/client';
import { OrderWithItems, RawOrder } from './types';
import { getOrderIdsForFarmerDirect, mapRawOrderToTyped } from './helpers/queryHelpers';

/**
 * Get detailed information about a specific order for a farmer
 */
export const getFarmerOrderDetails = async (
  orderId: string,
  farmerId: string
): Promise<OrderWithItems | null> => {
  try {
    // First verify this is an order that belongs to the farmer
    const orderIds = await getOrderIdsForFarmerDirect(farmerId);
    
    if (!orderIds.includes(orderId)) {
      console.log(`Order ${orderId} does not belong to farmer ${farmerId}`);
      return null;
    }
    
    // Fetch the order with buyer information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('Error fetching order details:', orderError);
      return null;
    }
    
    // Fetch order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:product_id (
          *,
          images:product_images (*)
        )
      `)
      .eq('order_id', orderId);
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return null;
    }
    
    // Combine order with its items
    const fullOrder = {
      ...order,
      order_items: orderItems || []
    };
    
    // Parse the shipping address if it's a string
    if (typeof fullOrder.shipping_address === 'string') {
      try {
        fullOrder.shipping_address = JSON.parse(fullOrder.shipping_address);
      } catch (e) {
        console.error('Error parsing shipping address:', e);
      }
    }
    
    // Convert the raw database objects to our typed models
    try {
      // Use a two-step cast to avoid TypeScript error
      const rawOrder = fullOrder as unknown as RawOrder;
      return mapRawOrderToTyped(rawOrder);
    } catch (e) {
      console.error('Error mapping order to typed model:', e);
      return null;
    }
  } catch (error) {
    console.error('Exception in getFarmerOrderDetails:', error);
    return null;
  }
};

// Export the function with the name expected by farmerOrders.ts
export const getOrderDetailsForFarmer = getFarmerOrderDetails;
