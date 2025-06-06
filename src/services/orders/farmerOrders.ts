import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus } from '@/types/product';
import { RawOrder, BuyerData, BuyerError } from './types';
import { fetchProductById } from '../productService';

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

// Type guard to check if the buyer object is of type BuyerData
function isBuyerData(buyer: BuyerData | BuyerError | undefined): buyer is BuyerData {
  return buyer !== undefined && 'id' in buyer && !('error' in buyer);
}

// Type guard to check if the shipping address is valid
function isValidShippingAddress(address: any): address is ShippingAddress {
  return (
    typeof address === 'object' &&
    address !== null &&
    typeof address.fullName === 'string' &&
    typeof address.address === 'string' &&
    typeof address.city === 'string' &&
    typeof address.state === 'string' &&
    typeof address.zipCode === 'string' &&
    typeof address.country === 'string' &&
    typeof address.phone === 'string'
  );
}

/**
 * Fetches all orders that contain products uploaded by a specific farmer
 * @param farmerId The ID of the farmer
 */
export const getOrdersForFarmer = async (farmerId: string): Promise<Order[]> => {
  try {
    console.log('Fetching orders for farmer:', farmerId);
    
    // First, get all order IDs that contain products from this farmer
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('order_id, product_id, farmer_id')
      .eq('farmer_id', farmerId);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return [];
    }

    console.log('Found order items:', orderItems);

    if (!orderItems || orderItems.length === 0) {
      console.log('No order items found for farmer:', farmerId);
      return [];
    }

    // Extract unique order IDs
    const orderIds = [...new Set(orderItems.map(item => item.order_id))];
    console.log('Unique order IDs:', orderIds);

    // Now fetch the full order details for these orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        status,
        total_amount,
        shipping_address,
        payment_method,
        created_at,
        updated_at,
        buyer:profiles!orders_user_id_fkey (
          id,
          full_name
        ),
        order_items (
          id,
          product_id,
          quantity,
          price,
          farmer_id
        )
      `)
      .in('id', orderIds)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }

    console.log('Fetched orders:', orders);

    if (!orders || orders.length === 0) {
      console.log('No orders found for IDs:', orderIds);
      return [];
    }

    // Process and format the orders
    const formattedOrders = orders.map(order => {
      // Filter order items to only include those from this farmer
      const farmerOrderItems = order.order_items.filter(
        (item: any) => item.farmer_id === farmerId
      );

      console.log(`Order ${order.id} has ${farmerOrderItems.length} items from farmer ${farmerId}`);

      // Parse shipping_address if it's a string
      let shippingAddress: ShippingAddress;
      if (typeof order.shipping_address === 'string') {
        try {
          const parsed = JSON.parse(order.shipping_address);
          if (isValidShippingAddress(parsed)) {
            shippingAddress = parsed;
          } else {
            throw new Error('Invalid shipping address format');
          }
        } catch (e) {
          console.error('Error parsing shipping address:', e);
          // Provide a default shipping address if parsing fails
          shippingAddress = {
            fullName: 'Unknown',
            address: 'Unknown',
            city: 'Unknown',
            state: 'Unknown',
            zipCode: 'Unknown',
            country: 'Unknown',
            phone: 'Unknown'
          };
        }
      } else if (isValidShippingAddress(order.shipping_address)) {
        shippingAddress = order.shipping_address;
      } else {
        // Provide a default shipping address if the format is invalid
        shippingAddress = {
          fullName: 'Unknown',
          address: 'Unknown',
          city: 'Unknown',
          state: 'Unknown',
          zipCode: 'Unknown',
          country: 'Unknown',
          phone: 'Unknown'
        };
      }

      // Handle buyer data
      let buyer: { id: string; full_name: string | null } | undefined = undefined;
      if (order.buyer && typeof order.buyer === 'object') {
        if (isBuyerData(order.buyer as any)) {
          const buyerData = order.buyer as BuyerData;
          buyer = {
            id: buyerData.id,
            full_name: buyerData.full_name
          };
        }
      }

      return {
        id: order.id,
        user_id: order.user_id,
        status: order.status as OrderStatus,
        total_amount: order.total_amount,
        shipping_address: shippingAddress,
        payment_method: order.payment_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
        buyer: buyer,
        items: farmerOrderItems.map((item: any) => ({
          id: item.id,
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };
    });

    console.log('Returning formatted orders:', formattedOrders);
    return formattedOrders;
  } catch (error) {
    console.error('Error in getOrdersForFarmer:', error);
    return [];
  }
};

/**
 * Fetches detailed order information for a farmer
 */
export const getOrderDetailsForFarmer = async (orderId: string, farmerId: string): Promise<Order | null> => {
  try {
    // First check if the farmer has any items in this order
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .eq('farmer_id', farmerId);

    if (itemsError || !orderItems || orderItems.length === 0) {
      console.error('Error or no items found:', itemsError);
      return null;
    }

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_id (
          id,
          full_name
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return null;
    }

    // Handle buyer data that might have an error
    let buyer: { id: string; full_name: string | null } | undefined = undefined;
      
    if (order.buyer && typeof order.buyer === 'object') {
      if (isBuyerData(order.buyer as any)) {
        const buyerData = order.buyer as BuyerData;
        buyer = {
          id: buyerData.id,
          full_name: buyerData.full_name
        };
      }
    }

    // Parse shipping_address if it's a string
    let shippingAddress = order.shipping_address;
    if (typeof shippingAddress === 'string') {
      try {
        shippingAddress = JSON.parse(shippingAddress);
      } catch (e) {
        console.error('Error parsing shipping address:', e);
      }
    }

    // Process order items with product details
    const itemsWithProducts: OrderItem[] = await Promise.all(
      orderItems.map(async (item): Promise<OrderItem> => {
        let product = null;
        
        try {
          product = await fetchProductById(item.product_id);
        } catch (error) {
          console.error(`Error fetching product ${item.product_id}:`, error);
        }
        
        return {
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product: product || undefined
        };
      })
    );

    // Format and return the complete order
    return {
      id: order.id,
      user_id: order.user_id,
      status: order.status as OrderStatus,
      total_amount: order.total_amount,
      shipping_address: shippingAddress as any, // Cast to any to resolve type mismatch
      payment_method: order.payment_method,
      created_at: order.created_at,
      updated_at: order.updated_at,
      buyer: buyer,
      items: itemsWithProducts
    };
  } catch (error) {
    console.error('Exception in getOrderDetailsForFarmer:', error);
    return null;
  }
};
