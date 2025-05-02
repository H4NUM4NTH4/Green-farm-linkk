
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus } from '@/types/product';
import { fetchProductById } from '../productService';
import { getFarmerProductIds, mapRawOrderToTyped } from './helpers/queryHelpers';
import { RawOrder } from './types';

export const getOrderDetailsForFarmer = async (orderId: string, farmerId: string): Promise<Order | null> => {
  try {
    // First, validate this order belongs to the farmer
    const productIds = await getFarmerProductIds(farmerId);

    if (productIds.length === 0) {
      return null;
    }

    // Get the order basic info with explicit typing
    const { data: rawOrder, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_id (id, full_name, email)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !rawOrder) {
      return null;
    }

    // Get order items belonging to this farmer
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .in('product_id', productIds);

    if (orderItemsError) {
      return null;
    }

    // Fetch product details for each order item
    const itemsWithProducts: OrderItem[] = [];
    for (const item of orderItems || []) {
      const product = await fetchProductById(item.product_id);
      if (product) {
        itemsWithProducts.push({
          ...item,
          product
        });
      } else {
        // Ensure the item has all required properties including order_id
        itemsWithProducts.push({
          ...item,
          order_id: orderId // Make sure order_id is present
        } as OrderItem);
      }
    }

    // Create the order object with proper typing
    const order = mapRawOrderToTyped({
      ...rawOrder,
      status: rawOrder.status as OrderStatus, // Ensure status is cast to OrderStatus
      order_items: itemsWithProducts
    } as RawOrder);
    
    return order;
  } catch (error) {
    console.error('Error in getOrderDetailsForFarmer:', error);
    return null;
  }
};
