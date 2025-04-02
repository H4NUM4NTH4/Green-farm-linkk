
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProductGrid from '@/components/marketplace/ProductGrid';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <div className="agri-container">
          <section className="py-16">
            <ProductGrid
              title="Featured Products"
              subtitle="Handpicked quality produce from verified farmers"
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
