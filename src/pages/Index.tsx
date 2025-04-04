
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProductGrid from '@/components/marketplace/ProductGrid';
import { fetchProducts } from '@/services/productService';
import { ProductWithImages } from '@/types/product';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithImages[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  useEffect(() => {
    // Fetch featured products for homepage
    const loadFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        // Fetch products with the ai_recommended flag
        const products = await fetchProducts({ aiRecommended: true });
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch recent products for homepage
    const loadRecentProducts = async () => {
      try {
        setIsLoadingRecent(true);
        // Fetch most recent products
        const products = await fetchProducts({ sortBy: 'newest', limit: 4 });
        setRecentProducts(products);
      } catch (error) {
        console.error('Error loading recent products:', error);
      } finally {
        setIsLoadingRecent(false);
      }
    };

    loadFeaturedProducts();
    loadRecentProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <div className="agri-container">
          <section className="py-16">
            <ProductGrid
              products={featuredProducts}
              title="Featured Products"
              subtitle="Handpicked quality produce from verified farmers"
              isLoading={isLoading}
            />
          </section>
          <section className="py-16 pt-0">
            <ProductGrid
              products={recentProducts}
              title="Recently Added"
              subtitle="Browse the latest products from our farmers"
              isLoading={isLoadingRecent}
            />
          </section>
        </div>
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
