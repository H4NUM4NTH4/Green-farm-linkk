
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus } from '@/types/product';
import { RawOrder } from './types';
import { fetchProductById } from '../productService';

/**
 * Fetches all orders that contain products uploaded by a specific farmer
 * @param farmerId The ID of the farmer
 */
export const getOrdersForFarmer = async (farmerId: string): Promise<Order[]> => {
  try {
    // First get all order items where the farmer is the current user
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('order_id, product_id, quantity, price')
      .eq('farmer_id', farmerId);

    if (itemsError) {
      console.error('Error fetching order items for farmer:', itemsError);
      return [];
    }

    if (!orderItems || orderItems.length === 0) {
      return [];
    }

    // Get unique order IDs
    const orderIds = [...new Set(orderItems.map(item => item.order_id))];

    // Now fetch the actual orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_id (
          id,
          full_name,
          email
        )
      `)
      .in('id', orderIds)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // Format and return the orders - use type assertion after validation
    return orders.map(order => {
      // Handle buyer data that might have an error
      const buyer = 'error' in order.buyer 
        ? undefined 
        : {
            id: order.buyer.id,
            full_name: order.buyer.full_name,
            email: order.buyer.email
          };

      // Parse shipping_address if it's a string
      let shippingAddress = order.shipping_address;
      if (typeof shippingAddress === 'string') {
        try {
          shippingAddress = JSON.parse(shippingAddress);
        } catch (e) {
          console.error('Error parsing shipping address:', e);
        }
      }

      return {
        id: order.id,
        user_id: order.user_id,
        status: order.status as OrderStatus,
        total_amount: order.total_amount,
        shipping_address: shippingAddress as any, // Cast to any to resolve type mismatch
        payment_method: order.payment_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
        buyer: buyer
      };
    });
  } catch (error) {
    console.error('Exception in getOrdersForFarmer:', error);
    return [];
  }
};

/**
 * Fetches detailed order information for a farmer
 */
export const getOrderDetailsForFarmer = async (orderId: string, farmerId: string): Promise<Order | null> => {
  try {
    // First check if the farmer has any items in this order
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .eq('farmer_id', farmerId);

    if (itemsError || !orderItems || orderItems.length === 0) {
      console.error('Error or no items found:', itemsError);
      return null;
    }

    // Get the order
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
      console.error('Error fetching order:', orderError);
      return null;
    }

    // Handle buyer data that might have an error
    const buyer = 'error' in order.buyer 
      ? undefined 
      : {
          id: order.buyer.id,
          full_name: order.buyer.full_name,
          email: order.buyer.email
        };

    // Parse shipping_address if it's a string
    let shippingAddress = order.shipping_address;
    if (typeof shippingAddress === 'string') {
      try {
        shippingAddress = JSON.parse(shippingAddress);
      } catch (e) {
        console.error('Error parsing shipping address:', e);
      }
    }

    // Process order items with product details
    const itemsWithProducts: OrderItem[] = await Promise.all(
      orderItems.map(async (item): Promise<OrderItem> => {
        let product = null;
        
        try {
          product = await fetchProductById(item.product_id);
        } catch (error) {
          console.error(`Error fetching product ${item.product_id}:`, error);
        }
        
        return {
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product: product || undefined
        };
      })
    );

    // Format and return the complete order
    return {
      id: order.id,
      user_id: order.user_id,
      status: order.status as OrderStatus,
      total_amount: order.total_amount,
      shipping_address: shippingAddress as any, // Cast to any to resolve type mismatch
      payment_method: order.payment_method,
      created_at: order.created_at,
      updated_at: order.updated_at,
      buyer: buyer,
      items: itemsWithProducts
    };
  } catch (error) {
    console.error('Exception in getOrderDetailsForFarmer:', error);
    return null;
  }
};
