
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
      return [];
    }

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
      return [];
    }

    // Map raw orders to typed orders
    return orders.map((order) => {
      // Handle shipping_address parsing if needed
      try {
        // Use a two-step cast to avoid TypeScript error
        const rawOrder = order as unknown as RawOrder;
        return mapRawOrderToTyped(rawOrder);
      } catch (e) {
        console.error('Error mapping order:', e);
        // Return a default order with minimal information if parsing fails
        return {
          id: order.id,
          user_id: order.user_id,
          userId: order.user_id, // Include both for compatibility
          status: order.status as OrderStatus,
          total_amount: order.total_amount,
          totalAmount: order.total_amount, // Include both for compatibility
          shipping_address: typeof order.shipping_address === 'string'
            ? JSON.parse(order.shipping_address)
            : order.shipping_address,
          shippingAddress: typeof order.shipping_address === 'string'
            ? JSON.parse(order.shipping_address)
            : order.shipping_address, // Include both for compatibility
          payment_method: order.payment_method,
          paymentMethod: order.payment_method, // Include both for compatibility
          created_at: order.created_at,
          createdAt: order.created_at, // Include both for compatibility
          updated_at: order.updated_at,
          updatedAt: order.updated_at, // Include both for compatibility
          items: []
        } as OrderWithItems;
      }
    });
  } catch (error) {
    console.error('Exception in getFarmerOrders:', error);
    return [];
  }
};

// Export the function with the name expected by farmerOrders.ts
export const getOrdersForFarmer = getFarmerOrders;
