
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/product';
import { 
  checkFarmerIdColumn,
  getOrderIdsForFarmerDirect,
  getFarmerProductIds,
  getOrderIdsForFarmerProducts,
  mapRawOrderToTyped
} from './helpers/queryHelpers';

export const getOrdersForFarmer = async (farmerId: string): Promise<Order[]> => {
  try {
    // First check if the farmer_id column exists in the order_items table
    const farmerIdColumnExists = await checkFarmerIdColumn();
    
    let orderIds: string[] = [];
    
    // If farmer_id column doesn't exist, use the old approach with product fetching
    if (!farmerIdColumnExists) {
      console.log("farmer_id column not found, using product lookup approach");
      
      // Get all products by this farmer
      const productIds = await getFarmerProductIds(farmerId);
      
      if (productIds.length === 0) {
        return [];
      }
      
      // Get order items containing these products
      orderIds = await getOrderIdsForFarmerProducts(productIds);
    } 
    // If farmer_id column exists, use it directly
    else {
      orderIds = await getOrderIdsForFarmerDirect(farmerId);
    }

    if (orderIds.length === 0) {
      return [];
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
    const orders: Order[] = rawData.map((rawOrder) => mapRawOrderToTyped(rawOrder));
    
    return orders;
  } catch (error) {
    console.error('Error in getOrdersForFarmer:', error);
    return [];
  }
};
