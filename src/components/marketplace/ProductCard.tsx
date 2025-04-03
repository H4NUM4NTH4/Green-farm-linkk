
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShoppingCart, Star } from 'lucide-react';
import { ProductWithImages } from '@/types/product';

interface ProductCardProps {
  product: ProductWithImages;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Calculate a simple random rating between 4.0 and 5.0
  // In a real app, this would come from actual ratings
  const randomRating = Math.floor((Math.random() * 10) + 40) / 10;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:border-agri-primary/40 h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.primary_image || '/placeholder.svg'} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {product.ai_recommended && (
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
            <span className="text-sm">{randomRating.toFixed(1)}</span>
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
          <span className="text-muted-foreground text-sm ml-1">/ {product.quantity_unit}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="flex items-center mr-2">
            {product.seller?.full_name || 'Unknown Seller'}
          </span>
          {product.seller && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
              Verified
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t border-border/60">
        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-agri-primary rounded-md hover:bg-agri-primary/90 transition-colors">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
