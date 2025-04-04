
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ShoppingBag, Truck, Clock } from 'lucide-react';
import { getOrderById } from '@/services/orderService';
import { Order } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency } from '@/lib/utils';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="agri-container text-center">
            <h1 className="heading-2 mb-4">Order Not Found</h1>
            <p className="mb-6">We couldn't find the order you're looking for.</p>
            <Button asChild>
              <Link to="/marketplace">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="agri-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="heading-2 mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground">
                Thank you for your order. We've received your order and will begin processing it right away.
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Order #{order.id.substring(0, 8)}</h2>
                  <span className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.created_at)}
                  </span>
                </div>

                <div className="bg-muted p-4 rounded-md mb-6 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span>
                    Your order is currently <strong>{order.status}</strong>
                  </span>
                </div>

                <h3 className="font-semibold mb-4">Items in Your Order</h3>
                <div className="space-y-4 mb-6">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 overflow-hidden rounded bg-gray-100">
                        {item.product?.primary_image && (
                          <img 
                            src={item.product.primary_image} 
                            alt={item.product?.name} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">
                            {item.product?.name || `Product #${item.product_id.substring(0, 8)}`}
                          </h4>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="text-sm">
                      <p className="font-medium">{order.shipping_address.fullName}</p>
                      <p>{order.shipping_address.address}</p>
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                      </p>
                      <p>{order.shipping_address.country}</p>
                      <p className="mt-1">{order.shipping_address.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Payment Information</h3>
                    <div className="text-sm">
                      <p>Payment Method: {order.payment_method === 'credit-card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</p>
                      <p className="font-semibold mt-4">Order Total: {formatCurrency(order.total_amount)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" asChild>
                  <Link to="/marketplace">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
                {user && (
                  <Button variant="outline" asChild>
                    <Link to="/dashboard">
                      <Truck className="mr-2 h-4 w-4" />
                      Track Your Order
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
