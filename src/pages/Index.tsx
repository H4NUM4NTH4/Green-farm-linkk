
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProductGrid from '@/components/marketplace/ProductGrid';
import { fetchProducts } from '@/services/productService';
import { ProductWithImages } from '@/types/product';
import { Separator } from '@/components/ui/separator';

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

    // Stagger the API calls slightly to seem more natural
    loadFeaturedProducts();
    setTimeout(() => {
      loadRecentProducts();
    }, 300);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <div className="agri-container">
          <section className="py-16">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold">AI Recommended Products</h2>
              <a href="/marketplace" className="text-agri-primary font-medium hover:underline">
                View all products →
              </a>
            </div>
            <p className="text-muted-foreground mb-8">Handpicked quality produce from verified farmers</p>
            <ProductGrid
              products={featuredProducts}
              isLoading={isLoading}
            />
          </section>
          
          <Separator className="my-6" />

          <section className="py-12">
            <div className="mb-2 flex items-center">
              <h2 className="text-2xl md:text-3xl font-bold">Recently Added</h2>
              <div className="ml-3 px-2 py-1 bg-agri-peach/20 text-xs rounded-md text-agri-primary font-medium">New</div>
            </div>
            <p className="text-muted-foreground mb-8">Browse the latest products from our farmers</p>
            <ProductGrid
              products={recentProducts}
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
