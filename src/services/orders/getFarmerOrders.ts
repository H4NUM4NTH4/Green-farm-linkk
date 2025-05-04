
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

    // Get all order IDs that contain products from this farmer
    const orderIds = await getOrderIdsForFarmerDirect(farmerId);
    
    if (orderIds.length === 0) {
      console.log(`No order IDs found for farmer: ${farmerId}`);
      return [];
    }

    console.log(`Found ${orderIds.length} order IDs for farmer ${farmerId}:`, orderIds);

    // Use the orderIds to fetch order details
    let query = supabase
      .from('orders')
      .select(`
        *,
        buyer:user_id (
          id,
          full_name,
          email
        )
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

    // For each order, fetch the order items that belong to this farmer
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      try {
        // Fetch order items for this order that belong to this farmer
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            product:product_id (
              *,
              images:product_images (*)
            )
          `)
          .eq('order_id', order.id)
          .eq('farmer_id', farmerId);
        
        if (itemsError) {
          console.error(`Error fetching items for order ${order.id}:`, itemsError);
          return null;
        }
        
        // Add items to order
        const orderWithItems = {
          ...order,
          order_items: items || []
        };
        
        // Parse shipping address if needed
        if (typeof orderWithItems.shipping_address === 'string') {
          try {
            orderWithItems.shipping_address = JSON.parse(orderWithItems.shipping_address);
          } catch (e) {
            console.error('Error parsing shipping address:', e);
          }
        }
        
        // Map to typed order
        try {
          const rawOrder = orderWithItems as unknown as RawOrder;
          return mapRawOrderToTyped(rawOrder);
        } catch (e) {
          console.error('Error mapping order to typed model:', e);
          return null;
        }
      } catch (e) {
        console.error(`Error processing order ${order.id}:`, e);
        return null;
      }
    }));
    
    // Filter out any null values from failed processing
    return ordersWithItems.filter(Boolean) as OrderWithItems[];
  } catch (error) {
    console.error('Exception in getFarmerOrders:', error);
    return [];
  }
};

// Export the function with the name expected by farmerOrders.ts
export const getOrdersForFarmer = getFarmerOrders;
