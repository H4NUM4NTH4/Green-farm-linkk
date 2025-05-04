
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Order, OrderStatus } from '@/types/product';
import OrderStatusBadge from './OrderStatusBadge';
import OrderActionButtons from './OrderActionButtons';
import ShippingDetailsModal from './ShippingDetailsModal';

interface OrderRequestCardProps {
  order: Order;
  onStatusUpdate?: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderRequestCard: React.FC<OrderRequestCardProps> = ({ 
  order, 
  onStatusUpdate 
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [showShippingModal, setShowShippingModal] = useState(false);

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    if (onStatusUpdate) {
      onStatusUpdate(order.id, newStatus);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="p-5 bg-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Order #{order.id.substring(0, 8)}
                </p>
                <p className="font-medium text-lg">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
              <OrderStatusBadge status={currentStatus} />
            </div>
            
            <div className="text-sm space-y-1 mb-4">
              <p>
                <span className="font-medium">Date:</span>{' '}
                {formatDate(order.created_at)}
              </p>
              <p>
                <span className="font-medium">Buyer:</span>{' '}
                {order.buyer?.full_name || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Items:</span>{' '}
                {order.items?.length || 0}
              </p>
            </div>
            
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {order.shipping_address.address}, {order.shipping_address.city}
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 bg-gray-50 flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowShippingModal(true)}
            >
              <FileText className="h-4 w-4 mr-1" />
              Shipping
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link to={`/farmer/orders/${order.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Link>
            </Button>
          </div>
          
          <OrderActionButtons
            orderId={order.id}
            currentStatus={currentStatus}
            onStatusUpdate={handleStatusUpdate}
          />
        </CardFooter>
      </Card>
      
      {showShippingModal && (
        <ShippingDetailsModal
          order={order}
          open={showShippingModal}
          onOpenChange={setShowShippingModal}
        />
      )}
    </>
  );
};

export default OrderRequestCard;
