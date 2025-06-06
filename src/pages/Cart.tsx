import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="agri-container">
          <h1 className="heading-2 mb-8">Shopping Cart</h1>

          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button asChild size="lg">
                <Link to="/marketplace">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <Card key={item.product.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-1/4 aspect-square">
                          <img 
                            src={item.product.primary_image || '/placeholder.svg'} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Sold by: {item.product.seller?.full_name || 'Unknown Seller'}
                              </p>
                              <p className="text-sm text-muted-foreground mb-4">
                                {formatCurrency(item.product.price)} / {item.product.quantity_unit}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border rounded-md">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8"
                              >
                                <Minus size={14} />
                              </Button>
                              <div className="w-12 text-center">{item.quantity}</div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="h-8 w-8"
                              >
                                <Plus size={14} />
                              </Button>
                            </div>
                            <div className="font-bold text-lg">
                              {formatCurrency(item.product.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => navigate('/marketplace')}>
                    Continue Shopping
                  </Button>
                  <Button variant="destructive" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({cart.totalItems} items)</span>
                        <span>{formatCurrency(cart.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping Fee</span>
                        <span>{formatCurrency(5)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>{formatCurrency(cart.totalPrice * 0.07)}</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatCurrency(cart.totalPrice + 5 + cart.totalPrice * 0.07)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => navigate('/checkout')}
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
