import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FarmerDashboardLayout from '@/components/layout/FarmerDashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  ChevronLeft, 
  Loader2, 
  FileText,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderDetailsForFarmer } from '@/services/orders';
import { Order, OrderStatus } from '@/types/product';
import { formatDate, formatCurrency } from '@/lib/utils';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrderActionButtons from '@/components/orders/OrderActionButtons';
import ShippingDetailsModal from '@/components/orders/ShippingDetailsModal';

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShippingModal, setShowShippingModal] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!user || !orderId) return;
      
      try {
        setLoading(true);
        const orderDetails = await getOrderDetailsForFarmer(orderId, user.id);
        
        if (!orderDetails) {
          toast({
            title: "Order not found",
            description: "The order details could not be found or you don't have permission to view them",
            variant: "destructive",
          });
          navigate('/farmer/orders');
          return;
        }
        
        setOrder(orderDetails);
      } catch (error) {
        console.error('Error loading order details:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [user, orderId, toast, navigate]);

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    if (order) {
      setOrder({ ...order, status: newStatus });
    }
  };

  if (loading) {
    return (
      <FarmerDashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </FarmerDashboardLayout>
    );
  }

  if (!order) {
    return (
      <FarmerDashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/farmer/orders')}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Orders
          </Button>
        </div>
      </FarmerDashboardLayout>
    );
  }

  return (
    <FarmerDashboardLayout>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/farmer/dashboard">
                  <Home className="h-3 w-3 mr-1" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/farmer/orders">Orders</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                Order #{orderId?.substring(0, 8)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Order Details</h1>
            <p className="text-muted-foreground">
              Order #{orderId?.substring(0, 8)} • {formatDate(order.created_at)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/farmer/orders')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Orders
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowShippingModal(true)}
            >
              <FileText className="mr-1 h-4 w-4" />
              Shipping Details
            </Button>
          </div>
        </div>

        {/* Order Status and Actions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle className="text-xl">Order Status</CardTitle>
                <CardDescription>
                  Current status: <OrderStatusBadge status={order.status} className="ml-1" />
                </CardDescription>
              </div>
              
              <OrderActionButtons
                orderId={order.id}
                currentStatus={order.status}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>
          </CardHeader>
        </Card>

        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Items included in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Quantity</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {order.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {item.product?.images && item.product.images.length > 0 && (
                                  <img 
                                    src={item.product.images[0].url || item.product.images[0].image_path} 
                                    alt={item.product.name} 
                                    className="w-10 h-10 object-cover rounded mr-3"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">
                                    {item.product?.name || 'Unknown Product'}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {item.product_id.substring(0, 8)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md bg-muted/25">
                    <p className="text-muted-foreground">No items found in this order</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/25 py-4">
              <div className="text-right">
                <div className="flex justify-between w-48">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between w-48 font-bold mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Customer Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div>{order.buyer?.full_name || 'Unknown'}</div>
                  </div>
                  {order.buyer?.email && (
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div>{order.buyer.email}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="font-medium">{order.shipping_address.fullName}</div>
                  <div>{order.shipping_address.address}</div>
                  <div>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                  </div>
                  <div>{order.shipping_address.country}</div>
                  <div className="pt-2">{order.shipping_address.phone}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setShowShippingModal(true)} 
                  variant="outline" 
                  className="w-full"
                >
                  View Shipping Label
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Method</div>
                    <div className="capitalize">{order.payment_method}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Status</div>
                    <div className="capitalize">Paid</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ShippingDetailsModal
        order={order}
        open={showShippingModal}
        onOpenChange={setShowShippingModal}
      />
    </FarmerDashboardLayout>
  );
};

export default OrderDetail;
