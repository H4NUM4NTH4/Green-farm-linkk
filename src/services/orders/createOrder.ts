
import { supabase } from '@/integrations/supabase/client';
import { CreateOrderInput } from './types';

export const createOrder = async (order: CreateOrderInput): Promise<string | null> => {
  try {
    // First, insert the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: order.user_id,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        status: 'pending'
      })
      .select('id')
      .single();

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      return null;
    }

    const orderId = orderData.id;

    // Get all product information including farmer details
    const productDetails = [];
    for (const item of order.items) {
      const { data: product } = await supabase
        .from('products')
        .select('user_id')
        .eq('id', item.product_id)
        .single();
      
      if (product) {
        productDetails.push({
          product_id: item.product_id,
          farmer_id: product.user_id
        });
      }
    }

    // Then, insert order items
    const orderItems = order.items.map(item => {
      const productDetail = productDetails.find(p => p.product_id === item.product_id);
      return {
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        // Store the farmer_id to make it easier to query orders by farmer
        farmer_id: productDetail ? productDetail.farmer_id : null
      };
    });

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError);
      return null;
    }

    return orderId;
  } catch (error) {
    console.error('Error in createOrder:', error);
    return null;
  }
};
