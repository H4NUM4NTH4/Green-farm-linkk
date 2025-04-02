
import React from 'react';
import ProductCard, { Product } from './ProductCard';

// Sample product data
export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Wheat',
    price: 7.25,
    quantity: 'bushel',
    location: 'Kansas City, MO',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    seller: {
      name: 'Heartland Farms',
      verified: true,
    },
    aiRecommended: true,
  },
  {
    id: '2',
    name: 'Fresh Tomatoes',
    price: 3.99,
    quantity: 'kg',
    location: 'San Joaquin Valley, CA',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    seller: {
      name: 'Valley Fresh Produce',
      verified: true,
    },
  },
  {
    id: '3',
    name: 'Free-Range Eggs',
    price: 5.99,
    quantity: 'dozen',
    location: 'Portland, OR',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    seller: {
      name: 'Sunrise Poultry',
      verified: true,
    },
  },
  {
    id: '4',
    name: 'Grass-Fed Beef',
    price: 15.99,
    quantity: 'lb',
    location: 'Austin, TX',
    category: 'Meat',
    image: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    seller: {
      name: 'Texas Ranch Supply',
      verified: true,
    },
    aiRecommended: true,
  },
  {
    id: '5',
    name: 'Fresh Apples',
    price: 2.49,
    quantity: 'lb',
    location: 'Yakima Valley, WA',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    seller: {
      name: 'Orchard Fresh',
      verified: false,
    },
  },
  {
    id: '6',
    name: 'Raw Honey',
    price: 12.99,
    quantity: 'jar',
    location: 'Hudson Valley, NY',
    category: 'Specialty',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    seller: {
      name: 'Beekeepers Collective',
      verified: true,
    },
  },
];

interface ProductGridProps {
  products?: Product[];
  title?: string;
  subtitle?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products = sampleProducts,
  title = "Featured Products",
  subtitle = "Browse our latest products from verified farmers"
}) => {
  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="heading-3 mb-2">{title}</h2>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
