
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types/product';

// Helper function to extract buyer info from raw order data
export function getBuyerInfo(order: Record<string, any>): Order['buyer'] {
  if (!order.buyer || typeof order.buyer !== 'object') {
    return { 
      id: String(order.user_id), 
      full_name: null
    };
  }
  
  return {
    id: String(order.buyer.id || order.user_id),
    full_name: order.buyer.full_name || null,
    email: order.buyer.email || null
  };
}

// Get farmer product IDs for queries
export async function getFarmerProductIds(farmerId: string): Promise<string[]> {
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('user_id', farmerId);
    
  if (!products || products.length === 0) {
    return [];
  }
  
  return products.map(product => product.id);
}

// Check if farmer_id column exists in order_items
export async function checkFarmerIdColumn(): Promise<boolean> {
  const { error: columnCheckError } = await supabase
    .from('order_items')
    .select('farmer_id')
    .limit(1);
  
  return !(columnCheckError && columnCheckError.message.includes("column 'farmer_id' does not exist"));
}

// Get order IDs associated with a farmer's products
export async function getOrderIdsForFarmerProducts(productIds: string[]): Promise<string[]> {
  const { data: items } = await supabase
    .from('order_items')
    .select('order_id')
    .in('product_id', productIds);
    
  if (!items || items.length === 0) {
    return [];
  }
  
  // Extract order IDs using a simple for loop
  const orderIdSet = new Set<string>();
  for (const item of items) {
    if (item && item.order_id) {
      orderIdSet.add(item.order_id);
    }
  }
  return Array.from(orderIdSet);
}

// Get order IDs directly using farmer_id
export async function getOrderIdsForFarmerDirect(farmerId: string): Promise<string[]> {
  const { data: items } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('farmer_id', farmerId);
    
  if (!items || items.length === 0) {
    return [];
  }
  
  // Extract order IDs using a simple for loop
  const orderIdSet = new Set<string>();
  for (const item of items) {
    if (item && item.order_id) {
      orderIdSet.add(item.order_id);
    }
  }
  return Array.from(orderIdSet);
}

// Convert raw order data to typed Order object
export function mapRawOrderToTyped(rawOrder: Record<string, any>): Order {
  return {
    id: String(rawOrder.id),
    user_id: String(rawOrder.user_id),
    status: rawOrder.status as OrderStatus,
    total_amount: Number(rawOrder.total_amount),
    shipping_address: rawOrder.shipping_address as Order['shipping_address'],
    payment_method: String(rawOrder.payment_method),
    created_at: String(rawOrder.created_at),
    updated_at: String(rawOrder.updated_at),
    buyer: getBuyerInfo(rawOrder)
  };
}
