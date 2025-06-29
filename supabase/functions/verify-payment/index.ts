import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hardcode the Stripe API key for now (in a production environment, you should use environment variables)
const STRIPE_SECRET_KEY = "sk_test_51RLUlPQPVrDKBz6Wo5rMLIxO354DB4T96AymQgOvL0nWjRz9auf79YrWcz1DVB1Ot6WZx8ez3BJ3nh6VkivPcj7p00MCeqe0oh";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    console.log(`Processing Stripe session: ${sessionId}`);
    
    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // Retrieve checkout session to verify payment status
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(`Payment status for session ${sessionId}: ${session.payment_status}`);
    
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Payment not completed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If we have a successful payment, create the order in our database
    const orderMetadata = JSON.parse(session.metadata?.order_details || "{}");
    console.log(`Processing order with metadata:`, orderMetadata);
    
    // Create Supabase client with service role key for administrative operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Create order with payment details
    const orderData = {
      user_id: orderMetadata.user_id,
      shipping_address: orderMetadata.shipping_address,
      payment_method: "stripe",
      total_amount: orderMetadata.total_amount,
      status: "paid",
      payment_id: session.id,
      payment_intent: session.payment_intent
    };

    console.log(`Creating order with data:`, orderData);

    // Use the RPC function to create the order
    const { data: orderId, error: orderError } = await supabaseAdmin.rpc(
      'create_order',
      {
        p_user_id: orderData.user_id,
        p_total_amount: orderData.total_amount,
        p_shipping_address: orderData.shipping_address,
        p_payment_method: orderData.payment_method,
        p_status: 'paid'
      }
    );

    console.log(`Order created with ID:`, orderId);

    let finalOrderId = orderId;
    // Fallback: If orderId is null, look up the order by payment_id (session.id)
    if (!finalOrderId) {
      const { data: foundOrder, error: findOrderError } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('payment_id', session.id)
        .maybeSingle();
      if (findOrderError) {
        console.error('Error finding order by payment_id:', findOrderError);
      }
      if (foundOrder && foundOrder.id) {
        finalOrderId = foundOrder.id;
        console.log('Found order by payment_id:', finalOrderId);
      } else {
        console.error('Order not found by payment_id:', session.id);
      }
    }

    // Process each line item to add to order_items
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    console.log(`Found ${lineItems.data.length} line items in checkout session`);
    
    // Try to get cart data from metadata if available
    let cartData = [];
    if (orderMetadata.cart_items && Array.isArray(orderMetadata.cart_items)) {
      cartData = orderMetadata.cart_items;
      console.log(`Using cart data from metadata with ${cartData.length} items`);
    } else {
      // Fall back to querying the database if needed
      try {
        console.log(`No cart data in metadata, checking database for user ${orderData.user_id}`);
        const { data, error } = await supabaseAdmin
          .from('shopping_cart')
          .select('*')
          .eq('user_id', orderData.user_id);
        
        if (error) {
          console.error("Error fetching cart:", error);
        } else if (data) {
          cartData = data;
          console.log(`Found ${data.length} items in shopping cart table`);
        }
      } catch (err) {
        console.error('Error fetching shopping cart data:', err);
      }
    }

    // Process order items from line items if cart data is not available
    if (!cartData || cartData.length === 0) {
      // Extract data from Stripe line items as fallback
      console.log("Using line items from Stripe as fallback for order items");
      
      for (const item of lineItems.data) {
        try {
          const itemName = item.description || "Unknown product";
          
          // Try to find the product by name (not ideal but a fallback)
          const { data: products, error: productsError } = await supabaseAdmin
            .from('products')
            .select('id, user_id, price')
            .ilike('name', `%${itemName}%`)
            .limit(1);
          
          if (productsError) {
            console.error(`Error searching for product ${itemName}:`, productsError);
            continue;
          }
          
          if (products && products.length > 0) {
            const product = products[0];
            
            // Add the order item
            const { error: itemError } = await supabaseAdmin.rpc(
              'add_order_item',
              {
                p_order_id: finalOrderId,
                p_product_id: product.id,
                p_quantity: item.quantity || 1,
                p_price: product.price,
                p_farmer_id: product.user_id
              }
            );

            if (itemError) {
              console.error(`Error adding order item for product ${product.id}:`, itemError);
            } else {
              console.log(`Successfully added order item for product ${product.id}`);
            }
          } else {
            console.error(`Could not find product matching "${itemName}"`);
          }
        } catch (err) {
          console.error('Error processing line item:', err);
        }
      }
    } else {
      // Process order items if we have the cart
      console.log(`Processing ${cartData.length} order items`);
      
      for (const item of cartData) {
        try {
          const productId = item.product_id || item.id;
          console.log(`Processing order item for product ${productId}`);
          
          // Get product details to get the farmer_id
          const { data: product, error: productError } = await supabaseAdmin
            .from('products')
            .select('user_id')
            .eq('id', productId)
            .single();
          
          if (productError) {
            console.error(`Error fetching product details for ${productId}:`, productError);
            continue;
          }
          
          const farmerId = product?.user_id;
          
          if (!farmerId) {
            console.error(`No farmer ID found for product ${productId}`);
            continue;
          }
          
          // Add the order item
          const { error: itemError } = await supabaseAdmin.rpc(
            'add_order_item',
            {
              p_order_id: finalOrderId,
              p_product_id: productId,
              p_quantity: item.quantity,
              p_price: item.price || item.product?.price,
              p_farmer_id: farmerId
            }
          );

          if (itemError) {
            console.error(`Error adding order item for product ${productId}:`, itemError);
          } else {
            console.log(`Successfully added order item for product ${productId}`);
          }
        } catch (err) {
          console.error('Error processing order item:', err);
        }
      }

      // Clear the cart after successful order
      if (orderMetadata.user_id) {
        try {
          const { error: clearCartError } = await supabaseAdmin
            .from('shopping_cart')
            .delete()
            .eq('user_id', orderMetadata.user_id);
            
          if (clearCartError) {
            console.error('Error clearing shopping cart:', clearCartError);
          } else {
            console.log(`Cleared shopping cart for user ${orderMetadata.user_id}`);
          }
        } catch (err) {
          console.error('Error clearing shopping cart:', err);
        }
      }
    }

    // Return success response with order ID
    return new Response(JSON.stringify({ 
      success: true, 
      orderId: finalOrderId,
      session
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error verifying payment:", errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
