
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, OrderItem } from '@/types/product';
import { fetchProductById } from '../productService';
import { OrderItemBasic } from './types';

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
      
      orderIds = [...new Set((items as OrderItemBasic[]).map(item => item.order_id))];
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
      
      orderIds = [...new Set((items as OrderItemBasic[]).map(item => item.order_id))];
    }

    // Get the orders
    const { data: ordersData, error: ordersError } = await supabase
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

    // Process buyer information and cast the data to match the Order type
    const typedOrders: Order[] = ordersData.map(order => {
      // Handle buyer information
      const buyerInfo = order.buyer && 
        typeof order.buyer === 'object' && 
        order.buyer !== null
          ? {
              id: (order.buyer as any)?.id || order.user_id,
              full_name: (order.buyer as any)?.full_name || null,
              email: (order.buyer as any)?.email || null
            }
          : { 
              id: order.user_id, 
              full_name: null, 
              email: null 
            };

      return {
        ...order,
        status: order.status as OrderStatus,
        shipping_address: order.shipping_address as Order['shipping_address'],
        buyer: buyerInfo
      };
    });

    return typedOrders;
  } catch (error) {
    console.error('Error in getOrdersForFarmer:', error);
    return [];
  }
};

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

    // Get the order basic info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_id (id, full_name, email)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
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

    // Handle buyer information
    const buyerInfo = order.buyer && 
      typeof order.buyer === 'object' && 
      order.buyer !== null
        ? {
            id: (order.buyer as any)?.id || order.user_id,
            full_name: (order.buyer as any)?.full_name || null,
            email: (order.buyer as any)?.email || null
          }
        : { 
            id: order.user_id, 
            full_name: null, 
            email: null 
          };

    return {
      ...order,
      status: order.status as OrderStatus,
      shipping_address: order.shipping_address as Order['shipping_address'],
      items: itemsWithProducts,
      buyer: buyerInfo
    };
  } catch (error) {
    console.error('Error in getOrderDetailsForFarmer:', error);
    return null;
  }
};
