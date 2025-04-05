
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus, ProductWithImages } from '@/types/product';
import { fetchProductById } from './productService';

export type CreateOrderInput = {
  user_id: string;
  total_amount: number;
  shipping_address: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  payment_method: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
};

export const createOrder = async (order: CreateOrderInput): Promise<string | null> => {
  try {
    // First, insert the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: order.user_id,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        status: 'pending'
      })
      .select('id')
      .single();

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      return null;
    }

    const orderId = orderData.id;

    // Then, insert order items
    const orderItems = order.items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError);
      return null;
    }

    return orderId;
  } catch (error) {
    console.error('Error in createOrder:', error);
    return null;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    // Fetch the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_id (id, full_name, email)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      console.error('Error fetching order:', orderError);
      return null;
    }

    // Fetch order items
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      return null;
    }

    // Fetch product details for each order item
    const itemsWithProducts: OrderItem[] = [];
    for (const item of orderItems || []) {
      try {
        const product = await fetchProductById(item.product_id);
        if (product) {
          itemsWithProducts.push({
            ...item,
            product
          });
        } else {
          itemsWithProducts.push(item as OrderItem);
        }
      } catch (e) {
        // If we can't fetch a product, still keep the item
        itemsWithProducts.push(item as OrderItem);
      }
    }

    // Handle buyer information - ensure it matches the expected type
    const buyerInfo = orderData.buyer && 
      typeof orderData.buyer === 'object' && 
      orderData.buyer !== null && 
      'error' in orderData.buyer && 
      !orderData.buyer.error 
        ? orderData.buyer 
        : {
            id: orderData.user_id,
            full_name: null,
            email: null
          };

    // Create the complete order object with proper type casting
    const order: Order = {
      ...orderData,
      status: orderData.status as OrderStatus,
      shipping_address: orderData.shipping_address as Order['shipping_address'],
      items: itemsWithProducts,
      buyer: buyerInfo
    };

    return order;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
};

export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }

    // Cast the data to match the Order type
    const orders: Order[] = data.map(order => ({
      ...order,
      status: order.status as OrderStatus,
      shipping_address: order.shipping_address as Order['shipping_address']
    }));

    return orders;
  } catch (error) {
    console.error('Error in getOrdersForUser:', error);
    return [];
  }
};

export const getOrdersForFarmer = async (farmerId: string): Promise<Order[]> => {
  try {
    // First find products by the farmer
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', farmerId);

    if (productsError || !products || products.length === 0) {
      return [];
    }

    const productIds = products.map(p => p.id);

    // Find order items containing the farmer's products
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('order_id')
      .in('product_id', productIds);

    if (orderItemsError || !orderItems || orderItems.length === 0) {
      return [];
    }

    const orderIds = [...new Set(orderItems.map(item => item.order_id))];

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
        order.buyer !== null && 
        'error' in order.buyer && 
        !order.buyer.error 
          ? order.buyer 
          : { id: order.user_id, full_name: null, email: null };

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
      order.buyer !== null && 
      'error' in order.buyer && 
      !order.buyer.error 
        ? order.buyer 
        : { id: order.user_id, full_name: null, email: null };

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

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return false;
  }
};
