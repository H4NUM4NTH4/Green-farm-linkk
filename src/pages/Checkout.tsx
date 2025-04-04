
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, Truck, MapPin, ChevronsRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createOrder } from '@/services/orderService';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('shipping');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });

  // If cart is empty, redirect to cart page
  React.useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items.length, navigate]);

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate shipping info
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || 
        !shippingInfo.state || !shippingInfo.zipCode || !shippingInfo.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Move to payment tab
    setActiveTab('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete your order",
        variant: "destructive"
      });
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Calculate order total with shipping and tax
      const shipping = 5;
      const tax = cart.totalPrice * 0.07;
      const totalAmount = cart.totalPrice + shipping + tax;
      
      // Prepare order items
      const orderItems = cart.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      // Create the order
      const orderId = await createOrder({
        user_id: user.id,
        total_amount: totalAmount,
        shipping_address: shippingInfo,
        payment_method: paymentMethod,
        items: orderItems
      });

      if (orderId) {
        // Clear the cart
        clearCart();
        
        // Redirect to order confirmation
        navigate(`/order-confirmation/${orderId}`);
      } else {
        toast({
          title: "Order failed",
          description: "There was a problem creating your order. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Order failed",
        description: "There was a problem creating your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals
  const shipping = 5;
  const tax = cart.totalPrice * 0.07;
  const total = cart.totalPrice + shipping + tax;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="agri-container">
          <div className="mb-8">
            <h1 className="heading-2 mb-2">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="shipping" disabled={activeTab === 'payment'}>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      Shipping
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="payment" disabled={activeTab === 'shipping'}>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="shipping">
                  <Card>
                    <CardContent className="pt-6">
                      <form onSubmit={handleShippingSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="md:col-span-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input 
                              id="fullName" 
                              name="fullName" 
                              value={shippingInfo.fullName} 
                              onChange={handleShippingInfoChange} 
                              required 
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <Label htmlFor="address">Street Address *</Label>
                            <Textarea 
                              id="address" 
                              name="address" 
                              value={shippingInfo.address} 
                              onChange={handleShippingInfoChange} 
                              required 
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input 
                              id="city" 
                              name="city" 
                              value={shippingInfo.city} 
                              onChange={handleShippingInfoChange} 
                              required 
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="state">State/Province *</Label>
                            <Input 
                              id="state" 
                              name="state" 
                              value={shippingInfo.state} 
                              onChange={handleShippingInfoChange} 
                              required 
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                            <Input 
                              id="zipCode" 
                              name="zipCode" 
                              value={shippingInfo.zipCode} 
                              onChange={handleShippingInfoChange} 
                              required 
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="country">Country *</Label>
                            <Input 
                              id="country" 
                              name="country" 
                              value={shippingInfo.country} 
                              onChange={handleShippingInfoChange} 
                              required 
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input 
                              id="phone" 
                              name="phone" 
                              type="tel" 
                              value={shippingInfo.phone} 
                              onChange={handleShippingInfoChange} 
                              required 
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <Button variant="outline" type="button" onClick={() => navigate('/cart')}>
                            Back to Cart
                          </Button>
                          <Button type="submit">
                            Continue to Payment
                            <ChevronsRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="payment">
                  <Card>
                    <CardContent className="pt-6">
                      <form onSubmit={handlePaymentSubmit}>
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                          <RadioGroup 
                            value={paymentMethod} 
                            onValueChange={setPaymentMethod}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                              <RadioGroupItem value="credit-card" id="credit-card" />
                              <Label htmlFor="credit-card" className="flex items-center cursor-pointer">
                                <CreditCard className="mr-2 h-5 w-5" />
                                Credit / Debit Card
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                              <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
                              <Label htmlFor="cash-on-delivery" className="flex items-center cursor-pointer">
                                <Truck className="mr-2 h-5 w-5" />
                                Cash on Delivery
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        {paymentMethod === 'credit-card' && (
                          <div className="space-y-4 mb-6">
                            <div>
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input id="expiryDate" placeholder="MM/YY" />
                              </div>
                              
                              <div>
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="nameOnCard">Name on Card</Label>
                              <Input id="nameOnCard" />
                            </div>
                          </div>
                        )}
                        
                        {paymentMethod === 'cash-on-delivery' && (
                          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                              You will pay for your order when it is delivered to your address. Please have the exact amount ready.
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            type="button" 
                            onClick={() => setActiveTab('shipping')}
                          >
                            Back to Shipping
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : 'Place Order'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    {cart.items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-16 h-16 overflow-hidden rounded">
                          <img 
                            src={item.product.primary_image || '/placeholder.svg'} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            ${item.product.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${cart.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
