
import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Process Stripe session if present
  useEffect(() => {
    const sessionId = searchParams.get('session_id') || localStorage.getItem('stripe_session_id');
    
    const processStripeSession = async () => {
      if (sessionId) {
        try {
          setProcessingPayment(true);
          // Verify the payment with our Edge Function
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { sessionId }
          });
          
          if (error) {
            console.error('Error verifying payment:', error);
            toast({
              title: 'Payment verification failed',
              description: error.message || 'Could not verify your payment',
              variant: 'destructive',
            });
            setProcessingPayment(false);
            return;
          }
          
          if (data?.success) {
            setPaymentSuccess(true);
            // If we have an order ID from the verification, navigate to it
            if (data.orderId && !orderId) {
              navigate(`/order-confirmation/${data.orderId}`, { replace: true });
            }
            
            // Clear session ID from storage
            localStorage.removeItem('stripe_session_id');
            
            toast({
              title: 'Payment successful',
              description: 'Your payment has been processed and your order has been placed',
            });
          } else {
            toast({
              title: 'Payment incomplete',
              description: data?.message || 'Your payment has not been completed',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error processing payment:', error);
          toast({
            title: 'Error processing payment',
            description: 'An unexpected error occurred while processing your payment',
            variant: 'destructive',
          });
        } finally {
          setProcessingPayment(false);
        }
      }
    };
    
    processStripeSession();
  }, [searchParams, navigate, orderId]);

  // Fetch order details if we have an order ID
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // FIX: Modified query to correctly handle product relationship
        // Instead of using nested select, use JOIN approach with getOrderById service
        const orderDetails = await getOrderById(orderId);
        
        if (!orderDetails) {
          setError('Order not found');
          toast({
            title: 'Failed to load order',
            description: 'The order could not be found',
            variant: 'destructive',
          });
          return;
        }
        
        setOrder(orderDetails);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
        toast({
          title: 'Failed to load order',
          description: err.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);

  // Loading state
  if (loading || processingPayment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-2">
              {processingPayment ? 'Processing payment...' : 'Loading order details...'}
            </h2>
            <p className="text-muted-foreground">
              {processingPayment 
                ? 'Please wait while we verify your payment with Stripe'
                : 'This may take a moment'
              }
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto">
            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                <CardTitle className="text-center">Failed to Load Order</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-muted-foreground">
                  {error}
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/marketplace">Continue Shopping</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/">Return to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle case where we have payment success but no order yet (redirect will happen)
  if (paymentSuccess && !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your payment has been processed successfully. Retrieving your order details...
            </p>
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Order not found
  if (!order && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="agri-container">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Order Not Found</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-muted-foreground">
                  We couldn't find the order you're looking for. It may have been removed or you may have entered the wrong URL.
                </p>
                <Button asChild>
                  <Link to="/marketplace">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper functions for rendering order data
  const getOrderItems = () => {
    return order?.items || [];
  };

  const getOrderTotal = () => {
    return order?.total_amount || 0;
  };

  const getFormattedAddress = () => {
    const address = order?.shipping_address || {};
    return `${address.fullName}, ${address.address}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const getOrderDate = () => {
    return new Date(order?.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get product image or fallback
  const getProductImage = (item: any) => {
    if (item?.product?.images && item.product.images.length > 0) {
      // Try to find primary image first
      const primaryImage = item.product.images.find((img: any) => img.is_primary);
      if (primaryImage) return primaryImage.image_path;
      // Otherwise use the first image
      return item.product.images[0].image_path;
    }
    return '/placeholder.svg';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="agri-container">
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="heading-2 mb-2">Order Confirmation</h1>
              <p className="text-muted-foreground">
                Order #{orderId} • Placed on {getOrderDate()}
              </p>
            </div>
            <OrderStatusBadge status={order?.status} size="lg" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {getOrderItems().length === 0 ? (
                    <p className="text-muted-foreground">No items in this order</p>
                  ) : (
                    <div className="space-y-4">
                      {getOrderItems().map((item: any) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={getProductImage(item)} 
                              alt={item.product?.name || 'Product'} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium">{item.product?.name || 'Product'}</h3>
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} x ${item.price?.toFixed(2)}
                              </p>
                              <p className="font-medium">${(item.quantity * item.price)?.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-4">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <p>Order status</p>
                    <OrderStatusBadge status={order?.status} />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <p>Payment method</p>
                    <p className="font-medium capitalize">
                      {order?.payment_method === 'stripe' ? 'Credit Card (Stripe)' : order?.payment_method?.replace(/-/g, ' ')}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p className="font-medium">${getOrderTotal().toFixed(2)}</p>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <p>Shipping</p>
                    <p>Free</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>${getOrderTotal().toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{getFormattedAddress()}</p>
                  <p className="text-sm mt-2">Phone: {order?.shipping_address?.phone}</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button asChild>
              <Link to="/marketplace">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Import the getOrderById service directly to properly fetch order details
import { getOrderById } from '@/services/orders/userOrders';

export default OrderConfirmation;
