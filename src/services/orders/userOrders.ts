import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, OrderItem } from '@/types/product';
import { fetchProductById } from '../productService';

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    // Fetch the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_id (id, full_name, email)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      console.error('Error fetching order:', orderError);
      return null;
    }

    // Handle buyer information - ensure it matches the expected type
    const buyerInfo = orderData.buyer && 
      typeof orderData.buyer === 'object' && 
      orderData.buyer !== null 
        ? {
            id: (orderData.buyer as any)?.id || orderData.user_id,
            full_name: (orderData.buyer as any)?.full_name || null,
            email: (orderData.buyer as any)?.email || null
          }
        : {
            id: orderData.user_id,
            full_name: null,
            email: null
          };

    // Fetch order items
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      return null;
    }

    // Fetch product details for each order item
    const itemsWithProducts: OrderItem[] = [];
    for (const item of orderItems || []) {
      try {
        const product = await fetchProductById(item.product_id);
        if (product) {
          itemsWithProducts.push({
            ...item,
            product
          });
        } else {
          itemsWithProducts.push(item as OrderItem);
        }
      } catch (e) {
        // If we can't fetch a product, still keep the item
        itemsWithProducts.push(item as OrderItem);
      }
    }

    // Create the complete order object with proper type casting
    const order: Order = {
      ...orderData,
      status: orderData.status as OrderStatus,
      shipping_address: orderData.shipping_address as Order['shipping_address'],
      items: itemsWithProducts,
      buyer: buyerInfo
    };

    return order;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
};

export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }

    // Cast the data to match the Order type
    const orders: Order[] = data.map(order => ({
      ...order,
      status: order.status as OrderStatus,
      shipping_address: order.shipping_address as Order['shipping_address']
    }));

    return orders;
  } catch (error) {
    console.error('Error in getOrdersForUser:', error);
    return [];
  }
};
