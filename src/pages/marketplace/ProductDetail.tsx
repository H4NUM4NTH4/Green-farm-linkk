import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fetchProductById } from '@/services/productService';
import { ProductWithImages } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Calendar, ShoppingCart, Edit, Star, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const productData = await fetchProductById(id);
        setProduct(productData);
        setSelectedImage(productData.primary_image || null);
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product details',
          variant: 'destructive',
        });
        navigate('/marketplace');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${product?.name} has been added to your cart`,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The product you're looking for does not exist or has been removed.
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              Return to Marketplace
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canEdit = user?.id === product.user_id;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/marketplace')}
            className="mb-4 pl-0"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Marketplace
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden border bg-background">
                <img 
                  src={selectedImage || product.primary_image || '/placeholder.svg'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image) => (
                    <div 
                      key={image.id}
                      className={`aspect-square rounded-md overflow-hidden border cursor-pointer ${
                        (image.url || '') === selectedImage ? 'ring-2 ring-agri-primary' : ''
                      }`}
                      onClick={() => setSelectedImage(image.url || '')}
                    >
                      <img 
                        src={image.url || '/placeholder.svg'} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin size={16} className="mr-1" />
                      <span>{product.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary" className="mb-2">
                      {product.category}
                    </Badge>
                    {product.ai_recommended && (
                      <Badge variant="default" className="bg-agri-primary">
                        AI Recommended
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-agri-primary">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-muted-foreground ml-2">
                  / {product.quantity_unit}
                </span>
              </div>

              <div className="flex items-center">
                <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  <span>Available: </span>
                  <span className="font-semibold ml-1">
                    {parseFloat(product.quantity.toString()).toFixed(2)} {product.quantity_unit}
                  </span>
                </div>
                <div className="flex items-center ml-4 text-muted-foreground text-sm">
                  <Calendar size={14} className="mr-1" />
                  <span>Listed on {formatDate(product.created_at)}</span>
                </div>
              </div>

              <Separator />

              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                      {product.seller?.avatar_url ? (
                        <img 
                          src={product.seller.avatar_url} 
                          alt="Seller" 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        product.seller?.full_name?.charAt(0) || 'S'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">
                          {product.seller?.full_name || 'Anonymous Seller'}
                        </span>
                        {product.seller?.verified && (
                          <Badge variant="outline" className="ml-2 text-xs border-green-500 text-green-600">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>4.9 Rating</span>
                        <span className="mx-2">•</span>
                        <span>Farmer since 2022</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-3 pt-2">
                <Button className="flex-1 h-12" onClick={handleAddToCart}>
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </Button>
                
                {canEdit && (
                  <Button variant="outline" onClick={() => navigate(`/farmer/product/edit/${product.id}`)}>
                    <Edit size={18} className="mr-2" />
                    Edit Product
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
