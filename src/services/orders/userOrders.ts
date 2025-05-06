import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, OrderItem } from '@/types/product';
import { fetchProductById } from '../productService';

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    console.log(`Fetching order details for order ID: ${orderId}`);
    
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
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      return null;
    }

    const orderItems = orderItemsData || [];
    console.log(`Found ${orderItems.length} order items for order ${orderId}`);

    // Fetch product details for each order item separately
    const itemsWithProducts: OrderItem[] = [];
    
    for (const item of orderItems) {
      try {
        console.log(`Fetching product details for product ID: ${item.product_id}`);
        const product = await fetchProductById(item.product_id);
        
        if (product) {
          itemsWithProducts.push({
            ...item,
            product
          });
        } else {
          console.warn(`Product not found for ID: ${item.product_id}`);
          // Still include the item even if product details couldn't be fetched
          itemsWithProducts.push({
            ...item,
            product: {
              id: item.product_id,
              name: 'Product Not Available',
              price: item.price,
              images: []
            } as any
          });
        }
      } catch (e) {
        console.error(`Error fetching product ${item.product_id}:`, e);
        // If we can't fetch a product, still keep the item with basic info
        itemsWithProducts.push({
          ...item,
          product: {
            id: item.product_id,
            name: 'Error Loading Product',
            price: item.price,
            images: []
          } as any
        });
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

    console.log(`Successfully processed order ${orderId} with ${itemsWithProducts.length} items`);
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
