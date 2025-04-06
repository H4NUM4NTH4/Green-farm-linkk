
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, OrderItem } from '@/types/product';
import { fetchProductById } from '../productService';
import { OrderItemBasic } from './types';

// Simple type for the Supabase query result
type RawOrderData = {
  id: string;
  user_id: string;
  status: string;
  shipping_address: any;
  total_amount: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  buyer?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
};

export const getOrdersForFarmer = async (farmerId: string): Promise<Order[]> => {
  try {
    // First check if the farmer_id column exists in the order_items table
    const { error: columnCheckError } = await supabase
      .from('order_items')
      .select('farmer_id')
      .limit(1);
    
    let orderIds: string[] = [];
    
    // If farmer_id column doesn't exist, use the old approach with product fetching
    if (columnCheckError && columnCheckError.message.includes("column 'farmer_id' does not exist")) {
      console.log("farmer_id column not found, using product lookup approach");
      
      // Get all products by this farmer
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', farmerId);
      
      if (!products || products.length === 0) {
        return [];
      }
      
      const productIds = products.map(product => product.id);
      
      // Get order items containing these products
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
      orderIds = Array.from(orderIdSet);
    } 
    // If farmer_id column exists, use it directly
    else {
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
      orderIds = Array.from(orderIdSet);
    }

    // Break the inference chain with explicit type annotation
    const { data: rawData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_id (id, full_name, email)
      `)
      .in('id', orderIds)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching farmer orders:', ordersError);
      return [];
    }

    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }

    // Convert raw data to properly typed Order objects
    const orders: Order[] = rawData.map((rawOrder) => {
      // Break type inference with intermediate type
      const orderData = rawOrder as Record<string, any>;
      
      return {
        id: String(orderData.id),
        user_id: String(orderData.user_id),
        status: orderData.status as OrderStatus,
        total_amount: Number(orderData.total_amount),
        shipping_address: orderData.shipping_address as Order['shipping_address'],
        payment_method: String(orderData.payment_method),
        created_at: String(orderData.created_at),
        updated_at: String(orderData.updated_at),
        buyer: orderData.buyer ? {
          id: String(orderData.buyer.id || orderData.user_id),
          full_name: orderData.buyer.full_name || null,
          email: orderData.buyer.email || null
        } : {
          id: String(orderData.user_id),
          full_name: null
        }
      };
    });
    
    return orders;
  } catch (error) {
    console.error('Error in getOrdersForFarmer:', error);
    return [];
  }
};

// Simple helper function to extract buyer info
function getBuyerInfo(order: Record<string, any>): Order['buyer'] {
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

export const getOrderDetailsForFarmer = async (orderId: string, farmerId: string): Promise<Order | null> => {
  try {
    // First, validate this order belongs to the farmer
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', farmerId);

    if (productsError || !products || products.length === 0) {
      return null;
    }

    const productIds = products.map(p => p.id);

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
        itemsWithProducts.push(item as OrderItem);
      }
    }

    // Break the type inference with intermediate type
    const orderData = rawOrder as Record<string, any>;
    
    // Create the order object with explicit types
    const order: Order = {
      id: String(orderData.id),
      user_id: String(orderData.user_id),
      status: orderData.status as OrderStatus,
      total_amount: Number(orderData.total_amount),
      shipping_address: orderData.shipping_address as Order['shipping_address'],
      payment_method: String(orderData.payment_method),
      created_at: String(orderData.created_at),
      updated_at: String(orderData.updated_at),
      items: itemsWithProducts,
      buyer: getBuyerInfo(orderData)
    };
    
    return order;
  } catch (error) {
    console.error('Error in getOrderDetailsForFarmer:', error);
    return null;
  }
};
