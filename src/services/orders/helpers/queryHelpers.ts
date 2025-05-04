
import { supabase } from '@/integrations/supabase/client';
import { RawOrder, OrderWithItems, OrderStatus, BuyerData, BuyerError } from '../types';
import { ProductWithImages } from '@/types/product';

// Type guard to check if the buyer object is of type BuyerData
function isBuyerData(buyer: BuyerData | BuyerError | undefined): buyer is BuyerData {
  return buyer !== undefined && 'id' in buyer && !('error' in buyer);
}

export const checkColumnExists = async (table: string, column: string): Promise<boolean> => {
  try {
    // Since we can't query pg_catalog directly, we'll use a simpler approach
    // This is a placeholder implementation that always returns true
    // In a real scenario, you might want to implement a custom function in Supabase
    console.log(`Checking if column ${column} exists in table ${table}`);
    return true; // Simplified for now to avoid the catalog query issues
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
      .eq('user_id', farmerId);

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

// Function to map raw order data to our typed model
export const mapRawOrderToTyped = (rawOrder: RawOrder): OrderWithItems => {
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
  const orderItems = Array.isArray(rawOrder.order_items) 
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

  // Handle buyer information using type guard
  let buyer: { 
    id: string; 
    fullName: string; 
    full_name: string; // Include both for compatibility
    email?: string 
  } | undefined = undefined;
  
  if (rawOrder.buyer) {
    if (isBuyerData(rawOrder.buyer)) {
      buyer = {
        id: rawOrder.buyer.id,
        fullName: rawOrder.buyer.full_name || 'Unknown User',
        full_name: rawOrder.buyer.full_name || 'Unknown User', // Include both for compatibility
        email: rawOrder.buyer.email
      };
    } else {
      // If it's a BuyerError, leave buyer as undefined
      console.log('Buyer data has an error:', rawOrder.buyer);
    }
  }

  // Convert the raw database object to our typed model
  return {
    id: rawOrder.id,
    user_id: rawOrder.user_id,
    userId: rawOrder.user_id, // Include both user_id and userId for compatibility
    status: rawOrder.status as OrderStatus, 
    total_amount: rawOrder.total_amount,
    totalAmount: rawOrder.total_amount, // Include both for compatibility
    shipping_address: shippingAddress,
    shippingAddress: shippingAddress, // Include both for compatibility
    payment_method: rawOrder.payment_method,
    paymentMethod: rawOrder.payment_method, // Include both for compatibility
    created_at: rawOrder.created_at,
    createdAt: rawOrder.created_at, // Include both for compatibility
    updated_at: rawOrder.updated_at,
    updatedAt: rawOrder.updated_at, // Include both for compatibility
    buyer: buyer,
    items: orderItems
  } as OrderWithItems;
};
