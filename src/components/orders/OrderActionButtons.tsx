
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Check, 
  X, 
  Truck, 
  PackageCheck
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { OrderStatus } from '@/types/product';
import { updateOrderStatus } from '@/services/orders/orderStatus';

interface OrderActionButtonsProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdate: (newStatus: OrderStatus) => void;
}

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({ 
  orderId, 
  currentStatus,
  onStatusUpdate 
}) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      
      const success = await updateOrderStatus(orderId, newStatus);
      
      if (success) {
        onStatusUpdate(newStatus);
        toast({
          title: "Status updated",
          description: `Order has been marked as ${newStatus}`,
        });
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Render different button sets based on current status
  if (currentStatus === 'pending') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => handleStatusUpdate('processing')}
          disabled={isUpdating}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4 mr-1" />
          Accept Order
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleStatusUpdate('cancelled')}
          disabled={isUpdating}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>
    );
  }

  if (currentStatus === 'processing') {
    return (
      <Button 
        variant="default" 
        size="sm" 
        onClick={() => handleStatusUpdate('shipped')}
        disabled={isUpdating}
        className="bg-indigo-600 hover:bg-indigo-700"
      >
        <Truck className="h-4 w-4 mr-1" />
        Mark as Shipped
      </Button>
    );
  }

  if (currentStatus === 'shipped') {
    return (
      <Button 
        variant="default" 
        size="sm" 
        onClick={() => handleStatusUpdate('delivered')}
        disabled={isUpdating}
        className="bg-green-600 hover:bg-green-700"
      >
        <PackageCheck className="h-4 w-4 mr-1" />
        Mark as Delivered
      </Button>
    );
  }

  // For delivered or cancelled orders, no actions available
  return (
    <Button 
      variant="outline" 
      size="sm" 
      disabled
    >
      <Package className="h-4 w-4 mr-1" />
      {currentStatus === 'delivered' ? 'Delivered' : 'Cancelled'}
    </Button>
  );
};

export default OrderActionButtons;
