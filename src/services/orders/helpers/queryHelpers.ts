
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus } from '@/types/product';
import { OrderWithItems, RawOrder, BuyerData, BuyerError } from '../types';

// Type guard to check if the buyer object is of type BuyerData
function isBuyerData(buyer: BuyerData | BuyerError | undefined): buyer is BuyerData {
  return buyer !== undefined && 'id' in buyer && !('error' in buyer);
}

/**
 * Fetches order IDs for a specific farmer from the database directly
 * @param farmerId The ID of the farmer
 * @returns Array of order IDs
 */
export const getOrderIdsForFarmerDirect = async (farmerId: string): Promise<string[]> => {
  try {
    // Get all order items where the farmer is the current user
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('farmer_id', farmerId);

    if (error) {
      console.error('Error fetching order IDs for farmer:', error);
      return [];
    }

    if (!orderItems || orderItems.length === 0) {
      return [];
    }

    // Extract unique order IDs
    const uniqueOrderIds = [...new Set(orderItems.map(item => item.order_id))];
    return uniqueOrderIds;
  } catch (error) {
    console.error('Exception in getOrderIdsForFarmerDirect:', error);
    return [];
  }
};

/**
 * Maps a raw order from database to a typed Order object
 */
export const mapRawOrderToTyped = (rawOrder: RawOrder): OrderWithItems => {
  // Parse shipping address if it's a string
  let shippingAddress = rawOrder.shipping_address;
  if (typeof shippingAddress === 'string') {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (e) {
      console.error('Error parsing shipping address:', e);
    }
  }

  // Handle buyer data that might have an error
  let buyer: { id: string; full_name: string | null; email?: string } | undefined = undefined;
  
  if (rawOrder.buyer) {
    if (isBuyerData(rawOrder.buyer)) {
      buyer = {
        id: rawOrder.buyer.id,
        full_name: rawOrder.buyer.full_name,
        email: rawOrder.buyer.email
      };
    }
  }

  // Process order items with product details
  const items: OrderItem[] = (rawOrder.order_items || []).map((item) => {
    // Process product images to ensure the URL property is populated if available
    const productWithImages = item.product ? {
      ...item.product,
      images: (item.product.images || []).map((image) => ({
        ...image,
        url: image.url || image.image_path
      }))
    } : undefined;

    return {
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      product: productWithImages
    };
  });

  // Format and return the complete order
  return {
    id: rawOrder.id,
    user_id: rawOrder.user_id,
    status: rawOrder.status as OrderStatus,
    total_amount: rawOrder.total_amount,
    shipping_address: shippingAddress as any,
    payment_method: rawOrder.payment_method,
    created_at: rawOrder.created_at,
    updated_at: rawOrder.updated_at,
    buyer: buyer,
    items: items
  };
};
