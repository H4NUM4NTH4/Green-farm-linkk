
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Card, CardHeader, CardTitle, CardDescription, 
  CardContent, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, User, Phone, MapPin, Mail, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderDetailsForFarmer, updateOrderStatus } from '@/services/orders';
import { Order, OrderStatus } from '@/types/product';
import { toast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!user || !orderId) return;
      
      try {
        setLoading(true);
        const orderDetails = await getOrderDetailsForFarmer(orderId, user.id);
        setOrder(orderDetails);
      } catch (error) {
        console.error('Error loading order details:', error);
        toast({
          title: "Error",
          description: "Could not load order details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId, user]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !orderId) return;
    
    try {
      setUpdating(true);
      const updated = await updateOrderStatus(orderId, newStatus as OrderStatus);
      
      if (updated) {
        setOrder({
          ...order,
          status: newStatus as OrderStatus
        });
        
        toast({
          title: "Status Updated",
          description: `Order status changed to "${newStatus}"`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Could not update order status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Could not update order status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="heading-3 mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/farmer/orders')}>
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2 -ml-4" 
              onClick={() => navigate('/farmer/orders')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <h1 className="heading-2 mb-1">Order #{order.id.substring(0, 8)}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <Card className="border-2 border-green-100">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-base flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              Buyer Information
            </CardTitle>
            <CardDescription>
              Complete details about the customer who placed this order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Contact Details</h3>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.shipping_address.fullName}</p>
                  </div>
                </div>
                {order.buyer?.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p>{order.buyer.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p>{order.shipping_address.phone}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Shipping Address</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p>{order.shipping_address.address}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                    </p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Payment Information</h3>
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p>
                    <span className="font-medium">Method: </span>
                    {order.payment_method === 'credit-card' 
                      ? 'Credit/Debit Card' 
                      : 'Cash on Delivery'}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Total Amount: </span>
                    <span className="text-lg font-semibold">{formatCurrency(order.total_amount)}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} in this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 border-b pb-4 last:border-0"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    {item.product?.primary_image && (
                      <img 
                        src={item.product.primary_image} 
                        alt={item.product?.name || 'Product image'} 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        {item.product?.name || `Product ID: ${item.product_id}`}
                      </h3>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <p>{formatCurrency(item.price)} × {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end">
              <div className="w-1/2 space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p>{formatCurrency(order.total_amount)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Shipping</p>
                  <p>Free</p>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <p>Total</p>
                  <p className="text-lg">{formatCurrency(order.total_amount)}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Select 
              defaultValue={order.status} 
              onValueChange={handleStatusChange}
              disabled={updating}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" asChild>
              <Link to="/farmer/orders">
                Back to Orders
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetail;
