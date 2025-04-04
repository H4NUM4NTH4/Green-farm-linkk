
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductForm from '@/components/farmer/ProductForm';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Product, ProductWithImages } from '@/types/product';
import { fetchProductById, updateProduct } from '@/services/productService';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const { hasPermission } = useAuthorization();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const productData = await fetchProductById(id);
        setProduct(productData);
        
        // Check if the product belongs to the current user
        if (productData.user_id !== user?.id) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to edit this product',
            variant: 'destructive',
          });
          navigate('/farmer/products');
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product details',
          variant: 'destructive',
        });
        navigate('/farmer/products');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, user, navigate]);

  const handleSubmit = async (productData: Partial<Product>, images: File[], deletedImageIds: string[] = []) => {
    if (!id) return;
    
    try {
      setIsSaving(true);
      
      // Combine any existing images to delete with newly deleted ones
      const allImagesToDelete = [...imagesToDelete, ...deletedImageIds];
      
      await updateProduct(id, productData, images, allImagesToDelete);
      
      toast({
        title: 'Product Updated',
        description: 'Your product has been updated successfully',
      });
      
      navigate(`/marketplace/product/${id}`);
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setIsSaving(false);
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
              <p className="mb-4">You don't have permission to edit products.</p>
              <Button onClick={() => navigate('/')}>Return to Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-agri-primary mb-4" />
            <p className="text-muted-foreground">Loading product details...</p>
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
          <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
          {product && (
            <ProductForm 
              initialData={product} 
              onSubmit={handleSubmit} 
              isLoading={isSaving} 
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProduct;
