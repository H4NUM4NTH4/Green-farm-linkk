
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="py-16 bg-white">
      <div className="agri-container">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-agri-primary tracking-tight mb-6">
            Connecting local farmers directly with health-conscious buyers
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-lg">
            Connect with local farmers directly and get fresh produce delivered to your doorstep.
            Experience farm-to-table quality with AI-driven insights.
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
    </div>
  );
};

export default Hero;
