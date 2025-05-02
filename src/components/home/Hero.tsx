
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="py-16 bg-background border-b">
      <div className="agri-container">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6 lg:flex lg:flex-col lg:justify-center">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-agri-light text-agri-primary mb-4">
                <Leaf size={16} className="mr-2" />
                Farm to Market
              </span>
              
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-6">
                Connect, Trade, Grow
                <span className="block text-agri-primary mt-1">Smarter Farming</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                AgriConnect brings farmers and buyers together through AI-driven insights, predictive pricing, and a seamless marketplace.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button asChild size="lg" className="rounded-md">
                  <Link to="/marketplace">
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-md border-2">
                  <Link to="/dashboard">View AI Insights</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-8 pt-6 border-t">
                <div>
                  <p className="text-3xl font-bold text-agri-primary">5K+</p>
                  <p className="text-sm text-muted-foreground">Farmers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-agri-primary">12K+</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-agri-primary">98%</p>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block lg:col-span-6">
            <div className="relative mt-8 lg:mt-0">
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                  alt="Farm landscape"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute bottom-5 right-5">
                  <div className="bg-white shadow-md rounded-md p-4">
                    <h3 className="text-sm font-medium text-agri-primary">AI Price Prediction</h3>
                    <p className="text-xl font-bold">Wheat: $7.24/bushel</p>
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                      </svg>
                      <span>Predicted to rise 5.2% next week</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
