
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, ShoppingCart } from 'lucide-react';

const Hero = () => {
  return (
    <div className="py-16 bg-white">
      <div className="agri-container">
        <div className="flex flex-col items-start text-left max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-agri-primary tracking-tight mb-6">
            Connect, Trade, Grow<br />
            <span className="text-agri-primary">Smarter Farming</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-lg">
            AgriConnect brings farmers and buyers together through AI-driven insights, predictive pricing, and a seamless marketplace designed for the future of agriculture.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/marketplace">
                Shop Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-agri-primary text-agri-primary hover:bg-agri-light hover:text-agri-primary">
              <Link to="/dashboard">
                Learn more
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Insights Section */}
      <div className="mt-24 bg-agri-light py-16">
        <div className="agri-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Key Insights</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our AI-powered platform provides valuable insights to help farmers and buyers make better decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-agri-light flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-agri-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Price Predictions</h3>
              <p className="text-muted-foreground">
                AI-driven price forecasting helps farmers plan harvests and buyers anticipate market trends.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-agri-light flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-agri-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Connections</h3>
              <p className="text-muted-foreground">
                Connect directly with local farmers or buyers, eliminating middlemen and reducing costs.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-agri-light flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-agri-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seamless Marketplace</h3>
              <p className="text-muted-foreground">
                Browse, purchase, and sell agricultural products with ease through our intuitive platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
