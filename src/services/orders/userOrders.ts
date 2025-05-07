import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, OrderItem } from '@/types/product';
import { fetchProductById } from '../productService';

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    console.log(`Fetching order details for order ID: ${orderId}`);
    
    // Fetch the order with basic information
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      console.error('Error fetching order:', orderError);
      return null;
    }

    // Fetch user/buyer information separately to avoid RLS recursion
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', orderData.user_id)
      .single();

    if (userError) {
      console.error('Error fetching user details:', userError);
      // Continue anyway as we can show the order without user details
    }

    // Fetch order items separately
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

    // Fetch product details for each order item with improved error handling
    const itemsWithProducts: OrderItem[] = [];
    
    for (const item of orderItems) {
      try {
        // Explicitly fetch each product individually to avoid relationship issues
        const product = await fetchProductById(item.product_id);
        
        if (product) {
          itemsWithProducts.push({
            ...item,
            product
          });
        } else {
          console.warn(`Product not found for ID: ${item.product_id}`);
          // Include the item with fallback product data
          itemsWithProducts.push({
            ...item,
            product: {
              id: item.product_id,
              name: 'Product Not Available',
              price: item.price,
              user_id: '',
              description: null,
              quantity: 0,
              quantity_unit: 'unit',
              location: '',
              category: '',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ai_recommended: false,
              images: []
            }
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
            user_id: '',
            description: null,
            quantity: 0,
            quantity_unit: 'unit',
            location: '',
            category: '',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ai_recommended: false,
            images: []
          }
        });
      }
    }

    // Create the complete order object with proper type casting
    const order: Order = {
      ...orderData,
      status: orderData.status as OrderStatus,
      shipping_address: orderData.shipping_address as Order['shipping_address'],
      items: itemsWithProducts,
      buyer: userData ? {
        id: userData.id,
        full_name: userData.full_name,
        // Remove email as it's not available in the profiles table
      } : {
        id: orderData.user_id,
        full_name: null,
      }
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
