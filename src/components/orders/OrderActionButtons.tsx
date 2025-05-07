
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Check, 
  X, 
  Truck, 
  PackageCheck,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { OrderStatus } from '@/types/product';
import { updateOrderStatus } from '@/services/orders/orderStatus';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      
      const success = await updateOrderStatus(orderId, newStatus);
      
      if (success) {
        onStatusUpdate(newStatus);
        
        let statusMessage = "";
        switch(newStatus) {
          case 'processing':
            statusMessage = "Order has been accepted and is now being processed";
            break;
          case 'cancelled':
            statusMessage = "Order has been rejected";
            break;
          case 'shipped':
            statusMessage = "Order has been marked as shipped";
            break;
          case 'delivered':
            statusMessage = "Order has been marked as delivered";
            break;
          default:
            statusMessage = `Order has been marked as ${newStatus}`;
        }
        
        toast({
          title: "Status updated",
          description: statusMessage,
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
      setShowRejectDialog(false);
    }
  };

  // Render different button sets based on current status
  if (currentStatus === 'pending') {
    return (
      <>
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
            onClick={() => setShowRejectDialog(true)}
            disabled={isUpdating}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
        
        {/* Confirmation dialog for rejecting order */}
        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this order? This action cannot be undone.
                The buyer will be notified that their order has been cancelled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Reject Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
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
