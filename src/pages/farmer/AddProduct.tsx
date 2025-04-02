
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductForm from '@/components/farmer/ProductForm';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Product } from '@/types/product';
import { createProduct } from '@/services/productService';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AddProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { hasPermission } = useAuthorization();
  const navigate = useNavigate();

  const handleSubmit = async (productData: Partial<Product>, images: File[]) => {
    try {
      setIsLoading(true);
      const productId = await createProduct(productData as any, images);
      toast({
        title: 'Product Added',
        description: 'Your product has been listed successfully',
      });
      navigate(`/marketplace/product/${productId}`);
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setIsLoading(false);
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
              <p className="mb-4">You don't have permission to list products.</p>
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
          <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddProduct;
