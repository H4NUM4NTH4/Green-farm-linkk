
import { supabase } from '@/integrations/supabase/client';
import { CreateOrderInput } from './types';
import { toast } from '@/components/ui/use-toast';

export const createOrder = async (order: CreateOrderInput): Promise<string | null> => {
  try {
    console.log('Creating order with data:', order);
    
    // First, insert the order using a simplified structure
    // to avoid potential RLS policy recursion
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

    if (orderError) {
      console.error('Error creating order:', orderError);
      toast({
        title: "Error placing order",
        description: orderError.message || "There was a problem creating your order",
        variant: "destructive",
      });
      return null;
    }

    if (!orderData) {
      console.error('No order data returned');
      toast({
        title: "Error placing order",
        description: "No order data was returned",
        variant: "destructive",
      });
      return null;
    }

    const orderId = orderData.id;

    // Process each item separately to avoid complex queries that might trigger RLS recursion
    const orderItems = [];
    
    // Get all product information including farmer details
    for (const item of order.items) {
      try {
        // Get product details in a separate query
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('user_id')
          .eq('id', item.product_id)
          .single();
        
        if (productError) {
          console.error('Error fetching product details:', productError);
          continue;
        }
        
        // Add the item to our order items array
        orderItems.push({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          // Store the farmer_id to make it easier to query orders by farmer
          farmer_id: product ? product.user_id : null
        });
      } catch (error) {
        console.error(`Error processing item ${item.product_id}:`, error);
      }
    }

    // Insert all order items in a single batch
    if (orderItems.length > 0) {
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) {
        console.error('Error creating order items:', orderItemsError);
        toast({
          title: "Error with order items",
          description: orderItemsError.message || "There was a problem adding items to your order",
          variant: "destructive",
        });
        return null;
      }
    }

    console.log('Order created successfully with ID:', orderId);
    return orderId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in createOrder:', error);
    toast({
      title: "Error placing order",
      description: errorMessage,
      variant: "destructive",
    });
    return null;
  }
};
