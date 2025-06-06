import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthorization } from '@/hooks/useAuthorization';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fetchProducts, deleteProduct } from '@/services/productService';
import { ProductWithImages } from '@/types/product';
import { Edit, Trash2, Plus, Eye, AlertTriangle } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { hasPermission } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await fetchProducts();
        // Filter to only show the current user's products
        const userProducts = productsData.filter(p => p.user_id === user?.id);
        setProducts(userProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your products',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProducts();
    }
  }, [user]);

  const handleAddProduct = () => {
    navigate('/farmer/product/add');
  };

  const handleEditProduct = (id: string) => {
    navigate(`/farmer/product/edit/${id}`);
  };

  const handleViewProduct = (id: string) => {
    navigate(`/marketplace/product/${id}`);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
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
              <p className="mb-4">You don't have permission to manage products.</p>
              <Button onClick={() => navigate('/')}>Return to Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Your Products</h1>
            <Button onClick={handleAddProduct} className="gap-2">
              <Plus size={16} />
              Add New Product
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-agri-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">You haven't added any products yet.</p>
                  <Button onClick={handleAddProduct} variant="outline" className="gap-2">
                    <Plus size={16} />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                                <img 
                                  src={product.primary_image || '/placeholder.svg'} 
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span>{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>
                            {product.quantity} {product.quantity_unit}
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.status === 'active' ? 'default' :
                                product.status === 'sold' ? 'secondary' : 'destructive'
                              }
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewProduct(product.id)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditProduct(product.id)}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductManagement;
