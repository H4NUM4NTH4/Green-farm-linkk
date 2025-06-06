import { supabase } from '@/integrations/supabase/client';
import { CreateOrderInput } from './types';
import { toast } from '@/components/ui/use-toast';

export const createOrder = async (order: CreateOrderInput): Promise<string | null> => {
  try {
    console.log('Creating order with data:', order);
    
    // Use a more direct and simplified approach to avoid RLS recursion issues
    // We'll first create an order with minimal data using a POST request to the RPC function
    const { data: orderData, error: orderError } = await supabase.rpc(
      'create_order' as any,
      {
        p_user_id: order.user_id,
        p_total_amount: order.total_amount,
        p_shipping_address: order.shipping_address,
        p_payment_method: order.payment_method
      }
    );

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

    console.log('Order created with ID:', orderData);
    const orderId = orderData;

    // Process each order item individually to avoid complex queries
    for (const item of order.items) {
      try {
        // Get product details to get the farmer_id
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('user_id, name')
          .eq('id', item.product_id)
          .single();
        
        if (productError) {
          console.error('Error fetching product details:', productError);
          continue;
        }
        
        const farmerId = product?.user_id;
        console.log(`Found farmer ID ${farmerId} for product ${item.product_id} (${product?.name})`);
        
        if (!farmerId) {
          console.error(`No farmer ID found for product ${item.product_id}`);
          continue;
        }
        
        // Add the order item using a direct RPC call
        const { error: itemError } = await supabase.rpc(
          'add_order_item' as any,
          {
            p_order_id: orderId,
            p_product_id: item.product_id,
            p_quantity: item.quantity,
            p_price: item.price,
            p_farmer_id: farmerId
          }
        );

        if (itemError) {
          console.error('Error adding order item:', itemError, 'for product:', item.product_id);
        } else {
          console.log(`Successfully added order item for product ${item.product_id} with farmer ${farmerId}`);
          
          // Verify the order item was created correctly
          const { data: verifyItem, error: verifyError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .eq('product_id', item.product_id)
            .eq('farmer_id', farmerId)
            .single();
            
          if (verifyError) {
            console.error('Error verifying order item:', verifyError);
          } else {
            console.log('Verified order item:', verifyItem);
          }
        }
      } catch (error) {
        console.error(`Error processing item ${item.product_id}:`, error);
      }
    }

    // Verify all order items were created
    const { data: allOrderItems, error: verifyAllError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
      
    if (verifyAllError) {
      console.error('Error verifying all order items:', verifyAllError);
    } else {
      console.log('All order items for order:', allOrderItems);
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
