
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/product';
import { toast } from '@/components/ui/use-toast';

/**
 * Updates the status of an order
 * @param orderId - The ID of the order to update
 * @param status - The new status for the order
 * @returns boolean indicating success
 */
export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update failed",
        description: error.message || "Could not update order status",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating order status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    toast({
      title: "Update failed",
      description: errorMessage,
      variant: "destructive",
    });
    return false;
  }
};
