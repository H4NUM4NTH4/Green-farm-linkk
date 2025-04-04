
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ArrowLeft, Mail, Phone, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthorization } from '@/hooks/useAuthorization';
import { getOrderDetailsForFarmer, updateOrderStatus } from '@/services/orderService';
import { Order, OrderStatus } from '@/types/product';
import { formatDate } from '@/lib/utils';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { user } = useAuth();
  const { hasPermission } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !user) return;

      try {
        setLoading(true);
        const orderData = await getOrderDetailsForFarmer(orderId, user.id);
        setOrder(orderData);
      } catch (error) {
        console.error('Error loading order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, user]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!orderId || !order) return;

    try {
      setUpdatingStatus(true);
      const success = await updateOrderStatus(orderId, newStatus);
      
      if (success) {
        setOrder((prev) => prev ? { ...prev, status: newStatus } : null);
        toast({
          title: 'Status Updated',
          description: `Order status has been updated to ${newStatus}.`,
        });
      } else {
        toast({
          title: 'Update Failed',
          description: 'Failed to update order status. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating the status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!hasPermission('list-crops')) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You don't have permission to view this order.</p>
              <Button onClick={() => navigate('/')}>Return to Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow p-6">
          <div className="max-w-5xl mx-auto">
            <Button variant="outline" className="mb-4" onClick={() => navigate('/farmer/orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  This order doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => navigate('/farmer/orders')}>Return to Orders</Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-6">
        <div className="max-w-5xl mx-auto">
          <Button variant="outline" className="mb-4" onClick={() => navigate('/farmer/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                    <Badge className="w-fit">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Placed on {formatDate(new Date(order.created_at))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Your Products in This Order</h3>
                      <div className="divide-y">
                        {order.items?.map((item) => (
                          <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex gap-4">
                              <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                                {item.product?.primary_image && (
                                  <img 
                                    src={item.product.primary_image} 
                                    alt={item.product?.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                  <h4 className="font-medium">
                                    {item.product?.name || `Product ID: ${item.product_id.substring(0, 8)}`}
                                  </h4>
                                  <div className="text-right">
                                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                                    <div className="text-muted-foreground text-sm">
                                      ${item.price.toFixed(2)} x {item.quantity}
                                    </div>
                                  </div>
                                </div>
                                {item.product?.quantity_unit && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Unit: {item.product.quantity_unit}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3">Update Order Status</h3>
                      <div className="flex items-center gap-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                          disabled={updatingStatus || order.status === 'delivered' || order.status === 'cancelled'}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-sm text-muted-foreground flex-1">
                          {updatingStatus ? 'Updating status...' : 
                            order.status === 'delivered' || order.status === 'cancelled' ? 
                              'This order is finalized and cannot be updated.' : 
                              'Change the order status to keep your customer informed.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">{order.buyer?.full_name || 'Customer'}</h4>
                        {order.buyer?.email && (
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 mr-1" />
                            <span>{order.buyer.email}</span>
                          </div>
                        )}
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          <span>{order.shipping_address.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{order.shipping_address.fullName}</p>
                    <p>{order.shipping_address.address}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                    </p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t flex flex-col items-start pt-4">
                  <div className="text-sm mb-1">
                    <span className="font-medium">Payment Method:</span> {order.payment_method === 'credit-card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Order Total:</span> ${order.total_amount.toFixed(2)}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
