
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProducts } from '@/services/productService';
import { ProductWithImages } from '@/types/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Leaf, Package, TrendingUp, Plus, ArrowUpRight } from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';

const FarmerDashboard: React.FC = () => {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { hasPermission } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const productsData = await fetchProducts();
        
        // Filter to only show the current user's products
        const userProducts = productsData.filter(p => p.user_id === user.id);
        setProducts(userProducts);
        
        // Get the 3 most recent products
        const recent = [...userProducts].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 3);
        setRecentProducts(recent);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user]);

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const soldProducts = products.filter(p => p.status === 'sold').length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-8">
        <div className="agri-container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Farmer Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your products and track your sales
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/farmer/products')} variant="outline" size="sm" className="gap-1">
                <Package className="h-4 w-4" />
                My Products
              </Button>
              <Button onClick={() => navigate('/farmer/product/add')} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
          
          {/* Dashboard summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{activeProducts}</div>
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Products Sold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{soldProducts}</div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Market Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">Active</div>
                    <div className="flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>+5.2% this month</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Products */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Products</CardTitle>
                  <CardDescription>Your recently added products</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/farmer/products')}
                  className="flex items-center gap-1 text-sm"
                >
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : recentProducts.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">You haven't added any products yet.</p>
                  <Button onClick={() => navigate('/farmer/product/add')} variant="outline" className="gap-2">
                    <Plus size={16} />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded overflow-hidden bg-gray-100">
                          <img 
                            src={product.primary_image || '/placeholder.svg'} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">${product.price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <Badge
                              variant={
                                product.status === 'active' ? 'default' :
                                product.status === 'sold' ? 'secondary' : 'destructive'
                              }
                              className="text-xs py-0 h-5"
                            >
                              {product.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/farmer/product/edit/${product.id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Management Tools */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add New Product
                  </CardTitle>
                  <CardDescription>List a new product for sale</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button onClick={() => navigate('/farmer/product/add')} className="w-full">
                    Add Product
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Manage Products
                  </CardTitle>
                  <CardDescription>Edit and update your products</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button onClick={() => navigate('/farmer/products')} variant="outline" className="w-full">
                    View All Products
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    View Analytics
                  </CardTitle>
                  <CardDescription>See how your products are performing</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                    View Analytics
                  </Button>
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

export default FarmerDashboard;
