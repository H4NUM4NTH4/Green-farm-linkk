
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProductWithImages, CartItem, ShoppingCart } from '@/types/product';
import { toast } from '@/components/ui/use-toast';

interface CartContextType {
  cart: ShoppingCart;
  addToCart: (product: ProductWithImages, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartEmpty: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const initialCart: ShoppingCart = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<ShoppingCart>(() => {
    // Try to load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : initialCart;
  });

  // Helper function to calculate cart totals
  const calculateTotals = (items: CartItem[]): ShoppingCart => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    return {
      items,
      totalItems,
      totalPrice
    };
  };

  // Save cart to localStorage whenever it changes
  const saveCart = (newCart: ShoppingCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (product: ProductWithImages, quantity: number = 1) => {
    const existingItemIndex = cart.items.findIndex(
      item => item.product.id === product.id
    );

    let newItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Item already exists, update quantity
      newItems = [...cart.items];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + quantity
      };
      toast({
        title: "Updated cart",
        description: `${product.name} quantity updated in your cart`,
      });
    } else {
      // Item doesn't exist, add new item
      newItems = [...cart.items, { product, quantity }];
      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart`,
      });
    }

    const newCart = calculateTotals(newItems);
    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newItems = cart.items.filter(item => item.product.id !== productId);
    const newCart = calculateTotals(newItems);
    saveCart(newCart);
    
    toast({
      title: "Removed from cart",
      description: "Item removed from your cart",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // Don't allow quantity less than 1
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const newItems = cart.items.map(item => 
      item.product.id === productId 
        ? { ...item, quantity } 
        : item
    );

    const newCart = calculateTotals(newItems);
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart(initialCart);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const isCartEmpty = () => {
    return cart.items.length === 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartEmpty
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
