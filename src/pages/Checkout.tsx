
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { createOrder } from '@/services/orderService';

const shippingFormSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  zipCode: z.string().min(5, { message: 'Zip code is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  paymentMethod: z.enum(['credit-card', 'cash-on-delivery'])
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      paymentMethod: 'credit-card'
    }
  });

  const onSubmit = async (data: ShippingFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete your order",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      navigate('/marketplace');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const orderData = {
        user_id: user.id,
        total_amount: cart.totalPrice,
        shipping_address: {
          fullName: data.fullName,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          phone: data.phone
        },
        payment_method: data.paymentMethod,
        items: cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

      const orderId = await createOrder(orderData);
      
      if (orderId) {
        // First navigate to the confirmation page
        navigate(`/order-confirmation/${orderId}`);
        
        // Only clear the cart after successful navigation
        // This ensures the user sees their order confirmation with items
        // We use a small timeout to ensure navigation completes first
        setTimeout(() => {
          clearCart();
        }, 300);
      } else {
        toast({
          title: "Error placing order",
          description: "There was a problem creating your order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error placing order",
        description: "There was a problem creating your order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="agri-container">
          <h1 className="heading-2 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Shipping and Payment Form */}
            <div className="lg:col-span-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" {...register('fullName')} />
                      {errors.fullName && (
                        <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" {...register('address')} />
                      {errors.address && (
                        <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" {...register('city')} />
                        {errors.city && (
                          <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" {...register('state')} />
                        {errors.state && (
                          <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input id="zipCode" {...register('zipCode')} />
                        {errors.zipCode && (
                          <p className="text-sm text-red-500 mt-1">{errors.zipCode.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" {...register('country')} defaultValue="United States" />
                        {errors.country && (
                          <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" {...register('phone')} />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </CardContent>
                  
                  <Separator />
                  
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      defaultValue="credit-card" 
                      className="space-y-3"
                      {...register('paymentMethod')}
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card" className="flex-grow cursor-pointer">
                          Credit / Debit Card
                          <p className="text-sm text-muted-foreground">
                            Pay with your card (Demo - no real payment processing)
                          </p>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
                        <Label htmlFor="cash-on-delivery" className="flex-grow cursor-pointer">
                          Cash on Delivery
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive your order
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.items.length === 0 ? (
                    <p className="text-muted-foreground">Your cart is empty</p>
                  ) : (
                    <>
                      {cart.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <div>
                            <p>{item.product.name} × {item.quantity}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.product.price.toFixed(2)} each
                            </p>
                          </div>
                          <p className="font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex justify-between font-medium">
                        <p>Subtotal</p>
                        <p>${cart.totalPrice.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <p>Shipping</p>
                        <p>Free</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold">
                        <p>Total</p>
                        <p>${cart.totalPrice.toFixed(2)}</p>
                      </div>
                    </>
                  )}
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
