
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
      let typedOrder;
      try {
        typedOrder = mapRawOrderToTyped(order as RawOrder);
        return typedOrder;
      } catch (e) {
        console.error('Error mapping order:', e);
        // Return a default order with minimal information if parsing fails
        return {
          id: order.id,
          userId: order.user_id,
          status: order.status as OrderStatus,
          totalAmount: order.total_amount,
          shippingAddress: typeof order.shipping_address === 'string'
            ? JSON.parse(order.shipping_address)
            : order.shipping_address,
          paymentMethod: order.payment_method,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
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
