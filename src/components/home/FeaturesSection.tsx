
import React from 'react';
import { ArrowUpRight, BarChart4, BrainCircuit, Globe, Leaf, Shield, ShoppingBag, Truck, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'AI Price Prediction',
    description: 'Get accurate crop price predictions based on historical data, weather conditions, and market trends.',
    icon: <BrainCircuit className="h-8 w-8 text-agri-primary" />,
    link: '/dashboard'
  },
  {
    title: 'Direct Marketplace',
    description: 'Connect directly with buyers and sellers, eliminating middlemen and increasing your profits.',
    icon: <ShoppingBag className="h-8 w-8 text-agri-primary" />,
    link: '/marketplace'
  },
  {
    title: 'Market Insights',
    description: 'Access AI-generated insights on top-selling crops, demand trends, and regional variations.',
    icon: <BarChart4 className="h-8 w-8 text-agri-primary" />,
    link: '/dashboard'
  },
  {
    title: 'Fraud Protection',
    description: 'Our AI system automatically detects and prevents suspicious activities and transactions.',
    icon: <Shield className="h-8 w-8 text-agri-primary" />,
    link: '/about'
  },
  {
    title: 'Smart Logistics',
    description: 'Optimize delivery routes and predict delivery times based on traffic and weather conditions.',
    icon: <Truck className="h-8 w-8 text-agri-primary" />,
    link: '/logistics'
  },
  {
    title: 'Community Forum',
    description: 'Join discussions with other farmers and buyers to share knowledge and best practices.',
    icon: <Users2 className="h-8 w-8 text-agri-primary" />,
    link: '/community'
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="agri-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="heading-2 text-foreground mb-4">
            AI-Powered Features for Modern Agriculture
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform combines cutting-edge AI technology with agriculture expertise to provide you with the tools you need to succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-background dark:bg-card border border-border rounded-xl p-6 transition-all hover:shadow-md hover:border-agri-primary/40"
            >
              <div className="h-14 w-14 rounded-lg bg-agri-light dark:bg-secondary flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <Link 
                to={feature.link} 
                className="inline-flex items-center text-agri-primary font-medium hover:underline"
              >
                Learn more <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-12 border-t border-border/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl">
              <h3 className="heading-3 mb-4">Sustainable Farming for a Better Future</h3>
              <p className="text-muted-foreground">
                AgriConnect is committed to promoting sustainable farming practices that benefit both farmers and the environment. Our AI technology helps farmers make data-driven decisions that maximize yields while minimizing environmental impact.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center p-10 rounded-full bg-agri-light dark:bg-secondary">
                <Leaf className="h-16 w-16 text-agri-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="heading-3 mb-6">Trusted by Farmers Worldwide</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <span className="text-xl font-bold text-muted-foreground">FarmCoop</span>
            <span className="text-xl font-bold text-muted-foreground">AgriTech</span>
            <span className="text-xl font-bold text-muted-foreground">GrowWell</span>
            <span className="text-xl font-bold text-muted-foreground">HarvestPlus</span>
            <span className="text-xl font-bold text-muted-foreground">EcoFarm</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
