import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProductDetail from "./pages/marketplace/ProductDetail";
import ProductManagement from "./pages/farmer/ProductManagement";
import AddProduct from "./pages/farmer/AddProduct";
import EditProduct from "./pages/farmer/EditProduct";
import FarmerDashboard from "./pages/farmer/Dashboard";
import OrderManagement from "./pages/farmer/OrderManagement";
import OrderDetail from "./pages/farmer/OrderDetail";
import Community from "./pages/Community";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import ChatBot from '@/components/chat/ChatBot';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/community" element={<Community />} />
              
              {/* Marketplace routes */}
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/product/:id" element={<ProductDetail />} />
              
              {/* Cart and Checkout routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              
              {/* Order confirmation routes - handle both root path and with orderId */}
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              
              {/* Protected routes with role-based access */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/farmer/*" 
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                    {/* Farmer routes will be nested here */}
                    <Routes>
                      <Route path="/" element={<FarmerDashboard />} />
                      <Route path="dashboard" element={<FarmerDashboard />} />
                      <Route path="products" element={<ProductManagement />} />
                      <Route path="product/add" element={<AddProduct />} />
                      <Route path="product/edit/:id" element={<EditProduct />} />
                      <Route path="orders" element={<OrderManagement />} />
                      <Route path="orders/:orderId" element={<OrderDetail />} />
                      <Route path="crops" element={<div>Farmer Crops Page (Placeholder)</div>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    {/* Admin routes will be nested here */}
                    <Routes>
                      <Route path="/" element={<div>Admin Dashboard (Placeholder)</div>} />
                      <Route path="users" element={<div>User Management (Placeholder)</div>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <ChatBot />
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
