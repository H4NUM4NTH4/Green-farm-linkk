
import { supabase } from '@/integrations/supabase/client';
import { ProductWithImages } from '@/types/product';
import { OrderWithItems, RawOrder, OrderItem } from '../types';

export const checkColumnExists = async (table: string, column: string): Promise<boolean> => {
  try {
    // Use stored procedure instead of direct query to information_schema
    const { data, error } = await supabase.rpc('check_column_exists', {
      table_name: table,
      column_name: column
    });

    if (error) {
      console.error('Error checking if column exists:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Exception when checking if column exists:', error);
    return false;
  }
};

export const getOrderIdsForFarmerDirect = async (farmerId: string): Promise<string[]> => {
  try {
    // Get all product IDs for the farmer
    const { data: farmerProducts, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('farmer_id', farmerId);

    if (productsError || !farmerProducts) {
      console.error('Error getting farmer products:', productsError);
      return [];
    }

    if (farmerProducts.length === 0) {
      return [];
    }

    const productIds = farmerProducts.map(product => product.id);

    // Get all order items containing those products
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('order_id')
      .in('product_id', productIds);

    if (orderItemsError || !orderItems) {
      console.error('Error getting order items:', orderItemsError);
      return [];
    }

    // Get unique order IDs
    const uniqueOrderIds = [...new Set(orderItems.map(item => item.order_id))];
    return uniqueOrderIds;
  } catch (error) {
    console.error('Exception in getOrderIdsForFarmerDirect:', error);
    return [];
  }
};

export const mapRawOrderToTyped = (rawOrder: any): OrderWithItems => {
  // Parse shipping_address if it's a string
  let shippingAddress = rawOrder.shipping_address;
  
  if (typeof shippingAddress === 'string') {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (e) {
      console.error('Error parsing shipping_address:', e);
      shippingAddress = {
        fullName: 'Error parsing address',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
      };
    }
  }
  
  // Make sure order items have the correct structure
  const orderItems: OrderItem[] = Array.isArray(rawOrder.order_items) 
    ? rawOrder.order_items.map((item: any) => ({
        id: item.id,
        order_id: rawOrder.id, // Ensure order_id is included
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product: item.product as ProductWithImages,
        created_at: item.created_at
      }))
    : [];

  return {
    id: rawOrder.id,
    userId: rawOrder.user_id,
    status: rawOrder.status as any, 
    totalAmount: rawOrder.total_amount,
    shippingAddress: shippingAddress as any,
    paymentMethod: rawOrder.payment_method,
    createdAt: rawOrder.created_at,
    updatedAt: rawOrder.updated_at,
    buyer: rawOrder.buyer ? {
      id: rawOrder.buyer.id,
      fullName: rawOrder.buyer.full_name || 'Unknown User',
      email: rawOrder.buyer.email
    } : undefined,
    items: orderItems
  };
};
