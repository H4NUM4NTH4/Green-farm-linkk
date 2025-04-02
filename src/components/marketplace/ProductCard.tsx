
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShoppingCart, Star } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: string;
  location: string;
  category: string;
  image: string;
  rating: number;
  seller: {
    name: string;
    verified: boolean;
  };
  aiRecommended?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:border-agri-primary/40 h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {product.aiRecommended && (
            <Badge variant="secondary" className="bg-agri-primary text-white">
              AI Recommended
            </Badge>
          )}
          <Badge variant="secondary" className="bg-background">
            {product.category}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
            <span className="text-sm">{product.rating}</span>
          </div>
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span>{product.location}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-0 flex-grow">
        <div className="flex items-baseline mt-1 mb-3">
          <span className="text-2xl font-bold text-agri-primary">${product.price.toFixed(2)}</span>
          <span className="text-muted-foreground text-sm ml-1">/ {product.quantity}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="flex items-center mr-2">
            Seller: {product.seller.name}
          </span>
          {product.seller.verified && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
              Verified
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t border-border/60">
        <Button className="w-full gap-2">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
