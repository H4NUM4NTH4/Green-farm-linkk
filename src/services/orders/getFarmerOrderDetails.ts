
import { supabase } from '@/integrations/supabase/client';
import { OrderWithItems, RawOrder } from './types';
import { getOrderIdsForFarmerDirect, mapRawOrderToTyped } from './helpers/queryHelpers';

/**
 * Get detailed information about a specific order for a farmer
 * Ensures the order belongs to the specified farmer
 */
export const getFarmerOrderDetails = async (
  orderId: string,
  farmerId: string
): Promise<OrderWithItems | null> => {
  try {
    console.log(`Getting details for order ${orderId} for farmer ${farmerId}`);
    
    // First verify this is an order that belongs to the farmer
    const orderIds = await getOrderIdsForFarmerDirect(farmerId);
    
    if (!orderIds.includes(orderId)) {
      console.log(`Order ${orderId} does not belong to farmer ${farmerId}`);
      return null;
    }
    
    console.log(`Order ${orderId} belongs to farmer ${farmerId}, fetching details`);
    
    // Fetch the order with basic information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        status,
        total_amount,
        shipping_address,
        payment_method,
        payment_id,
        created_at,
        updated_at
      `)
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('Error fetching order details:', orderError);
      return null;
    }
    
    // Fetch buyer information
    const { data: buyer, error: buyerError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', order.user_id)
      .single();
      
    if (buyerError) {
      console.error('Error fetching buyer details:', buyerError);
      // Continue anyway, as we can show the order without buyer details
    }
    
    // Fetch order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        quantity,
        price,
        product:product_id (
          id,
          name,
          description,
          price,
          quantity,
          category,
          quantity_unit,
          images:product_images (
            id,
            image_path,
            is_primary
          )
        )
      `)
      .eq('order_id', orderId)
      .eq('farmer_id', farmerId);
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return null;
    }
    
    console.log(`Found ${orderItems?.length || 0} items for order ${orderId}`);
    
    // Combine order with its items and buyer info
    const fullOrder = {
      ...order,
      order_items: orderItems || [],
      buyer: buyer || undefined
    };
    
    // Convert the raw database objects to our typed models
    try {
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
