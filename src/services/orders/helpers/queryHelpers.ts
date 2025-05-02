
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus, OrderWithItems, RawOrder } from '../types';
import { User } from '@supabase/supabase-js';

// Function to check if the farmer_id column exists in the order_items table
export const checkFarmerIdColumn = async (): Promise<boolean> => {
  try {
    // Use a type assertion here to avoid the type checking error
    const { data, error } = await supabase.rpc('check_column_exists' as any, {
      p_table_name: 'order_items',
      p_column_name: 'farmer_id'
    });

    if (error) {
      console.error('Error checking if farmer_id column exists:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in checkFarmerIdColumn:', error);
    return false;
  }
};

/**
 * Helper to build a select query for orders
 */
export const buildOrdersQuery = () => {
  return supabase.from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(
          *,
          seller:profiles(id, full_name, email)
        )
      )
    `);
};

/**
 * Helper to map raw order data from Supabase to our Order type
 */
export const mapRawOrderToTyped = (order: any): OrderWithItems => {
  // Extract the order items from the order
  const orderItems = order.order_items ? order.order_items.map((item: any) => ({
    id: item.id,
    order_id: item.order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    farmer_id: item.farmer_id || null,
    product: item.product ? {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      price: item.product.price,
      quantity_available: item.product.quantity_available,
      quantity_unit: item.product.quantity_unit,
      category: item.product.category,
      location: item.product.location,
      ai_recommended: item.product.ai_recommended,
      created_at: item.product.created_at,
      user_id: item.product.user_id,
      primary_image: item.product.primary_image,
      images: item.product.images || [],
      seller: item.product.seller ? {
        id: item.product.seller.id,
        full_name: item.product.seller.full_name,
        email: item.product.seller.email
      } : null
    } : null
  })) : [];

  // Create a typed order object using explicit property assignments
  const typedOrder: OrderWithItems = {
    id: order.id,
    user_id: order.user_id,
    status: order.status as OrderStatus,
    total_amount: order.total_amount,
    shipping_address: order.shipping_address,
    payment_method: order.payment_method,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items: orderItems,
    buyer: order.buyer ? {
      id: order.buyer.id,
      full_name: order.buyer.full_name,
      email: order.buyer.email
    } : undefined
  };

  return typedOrder;
};

/**
 * Helper to transform a raw order from Supabase to our Order type
 */
export const rawOrderToTyped = (order: RawOrder): OrderWithItems => {
  // Use the mapRawOrderToTyped function to transform the order
  return mapRawOrderToTyped(order);
};
