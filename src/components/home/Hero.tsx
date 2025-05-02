
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-pattern pt-8 pb-16 md:pb-20 lg:pb-24">
      <div className="agri-container">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
            <div className="lg:py-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-agri-light text-agri-primary mb-4">
                <Leaf size={16} className="mr-2" />
                <span>AI-Powered Agriculture</span>
              </div>
              <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                <span className="block">Connect, Trade, Grow</span>
                <span className="block mt-1 text-agri-primary">Smarter Farming</span>
              </h1>
              <p className="mt-5 text-lg leading-7 text-muted-foreground">
                AgriConnect brings farmers and buyers together through AI-driven insights, predictive pricing, and a seamless marketplace designed for the future of agriculture.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-5 sm:gap-4">
                <Button asChild size="lg" className="rounded-lg font-medium">
                  <Link to="/marketplace">
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-lg border-2 font-medium">
                  <Link to="/dashboard">
                    View AI Insights
                  </Link>
                </Button>
              </div>
              <div className="mt-10 pt-6 border-t border-border grid grid-cols-3 gap-8">
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
          <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-xl shadow-lg overflow-hidden lg:max-w-md">
              <div className="relative block w-full h-80 sm:h-96 lg:h-[28rem] bg-white rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                  alt="Farm landscape"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-agri-primary/60 to-transparent mix-blend-multiply" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border/50 transform -rotate-1">
                    <div className="text-sm font-medium text-agri-primary">AI Price Prediction</div>
                    <div className="text-xl font-bold">Wheat: $7.24/bushel</div>
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
      
      <div className="hidden lg:block absolute -bottom-24 -left-24 w-64 h-64 bg-agri-light rounded-full opacity-20"></div>
      <div className="hidden lg:block absolute top-10 right-10 w-20 h-20 bg-agri-brown/10 rounded-full"></div>
    </div>
  );
};

export default Hero;
