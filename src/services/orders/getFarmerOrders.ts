
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/product';
import { OrderWithItems, RawOrder } from './types';
import { getOrderIdsForFarmerDirect, mapRawOrderToTyped } from './helpers/queryHelpers';

export type OrderListFilters = {
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
};

/**
 * Retrieves all orders containing products from a specific farmer
 * This implementation avoids the RLS recursion issue by using a simplified approach
 */
export const getFarmerOrders = async (
  farmerId: string,
  filters: OrderListFilters = {}
): Promise<OrderWithItems[]> => {
  try {
    console.log(`Getting orders for farmer: ${farmerId} with filters:`, filters);
    
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = filters;

    // Step 1: Get all order IDs that contain products from this farmer
    const orderIds = await getOrderIdsForFarmerDirect(farmerId);
    
    if (orderIds.length === 0) {
      console.log(`No order IDs found for farmer: ${farmerId}`);
      return [];
    }

    console.log(`Found ${orderIds.length} order IDs for farmer ${farmerId}`);

    // Step 2: Fetch basic order details using the order IDs
    let query = supabase
      .from('orders')
      .select(`
        id,
        user_id,
        status,
        total_amount,
        shipping_address,
        payment_method,
        created_at,
        updated_at
      `)
      .in('id', orderIds);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply date range filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    // Apply pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);
    
    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    // Execute the query
    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching farmer orders:', error);
      return [];
    }

    if (!orders || orders.length === 0) {
      console.log(`No orders found for farmer: ${farmerId}`);
      return [];
    }

    console.log(`Found ${orders.length} orders for farmer ${farmerId}`);

    // Step 3: For each order, fetch buyer information and order items
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      try {
        // Fetch buyer information for this order
        const { data: buyerData, error: buyerError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', order.user_id)
          .single();
          
        if (buyerError) {
          console.error(`Error fetching buyer for order ${order.id}:`, buyerError);
        }
        
        // Fetch order items for this order that belong to this farmer
        const { data: items, error: itemsError } = await supabase
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
              images:product_images (
                id,
                image_path,
                is_primary
              )
            )
          `)
          .eq('order_id', order.id)
          .eq('farmer_id', farmerId);
        
        if (itemsError) {
          console.error(`Error fetching items for order ${order.id}:`, itemsError);
          return null;
        }
        
        // Construct the full order object
        const rawOrder: RawOrder = {
          ...order,
          order_items: items || [],
          buyer: buyerData || undefined
        };
        
        // Map to our typed model
        return mapRawOrderToTyped(rawOrder);
      } catch (e) {
        console.error(`Error processing order ${order.id}:`, e);
        return null;
      }
    }));
    
    // Filter out any null values and return the results
    return ordersWithDetails.filter(Boolean) as OrderWithItems[];
  } catch (error) {
    console.error('Exception in getFarmerOrders:', error);
    return [];
  }
};

// Export the function with the name expected by the components
export const getOrdersForFarmer = getFarmerOrders;
