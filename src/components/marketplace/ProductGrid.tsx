
import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { ProductWithImages } from '@/types/product';

interface ProductGridProps {
  products: ProductWithImages[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products = [],
  title = "Featured Products",
  subtitle = "Browse our latest products from verified farmers",
  isLoading = false,
  emptyMessage = "No products found. Check back soon for new listings."
}) => {
  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="heading-3 mb-2">{title}</h2>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg bg-gray-100 animate-pulse h-80"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <Link to={`/marketplace/product/${product.id}`} key={product.id} className="no-underline text-foreground">
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
