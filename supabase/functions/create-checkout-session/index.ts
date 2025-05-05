
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderData } = await req.json();
    
    // Check if STRIPE_SECRET_KEY is properly set
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Stripe configuration error", 
          details: "API key not configured" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    // Log information about the order for debugging
    console.log(`Creating checkout session for order with ${orderData.items.length} items`);
    console.log(`Total amount: ${orderData.total_amount}`);
    
    // Initialize Stripe with proper error handling
    let stripe;
    try {
      stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
      console.log("Stripe initialized successfully");
    } catch (stripeInitError) {
      console.error("Failed to initialize Stripe:", stripeInitError);
      return new Response(
        JSON.stringify({ 
          error: "Stripe initialization failed", 
          details: stripeInitError instanceof Error ? stripeInitError.message : "Unknown error" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Format line items for Stripe
    const lineItems = orderData.items.map((item: any) => {
      const product = {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            images: item.product.images && item.product.images.length > 0 
              ? [item.product.images[0].image_path] 
              : undefined,
          },
          unit_amount: Math.round(item.product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
      console.log(`Adding product to checkout: ${item.product.name}, $${item.product.price} x ${item.quantity}`);
      return product;
    });

    // Create the base URL for success and cancel
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const successUrl = `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/checkout?canceled=true`;
    
    console.log(`Success URL: ${successUrl}`);
    console.log(`Cancel URL: ${cancelUrl}`);

    // Create Checkout Session with better error handling
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          order_details: JSON.stringify({
            user_id: orderData.user_id,
            shipping_address: orderData.shipping_address,
            payment_method: orderData.payment_method,
            total_amount: orderData.total_amount
          })
        }
      });
      
      console.log(`Checkout session created: ${session.id}`);
      console.log(`Checkout URL: ${session.url}`);

      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (checkoutError) {
      console.error("Error creating checkout session:", checkoutError);
      
      // Provide more specific error information
      let errorMessage = "Unknown checkout error";
      let errorDetails = "";
      
      if (checkoutError instanceof Error) {
        errorMessage = checkoutError.message;
        
        // Check for common Stripe errors
        if (errorMessage.includes("API key")) {
          errorDetails = "Invalid or unauthorized API key. Please check your Stripe configuration.";
        } else if (errorMessage.includes("rate limit")) {
          errorDetails = "Too many requests to Stripe. Please try again in a moment.";
        }
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: errorDetails || "See Edge Function logs for more details" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("General error in checkout function:", errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
