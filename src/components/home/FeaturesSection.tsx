
import React from 'react';
import { ArrowUpRight, BarChart4, BrainCircuit, Globe, Leaf, Shield, ShoppingBag, Truck, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'AI Price Prediction',
    description: 'Get accurate crop price predictions based on historical data, weather conditions, and market trends.',
    icon: <BrainCircuit className="h-8 w-8 text-agri-primary" />,
    link: '/dashboard',
    style: 'bg-white dark:bg-card'
  },
  {
    title: 'Direct Marketplace',
    description: 'Connect directly with buyers and sellers, eliminating middlemen and increasing your profits.',
    icon: <ShoppingBag className="h-8 w-8 text-agri-primary" />,
    link: '/marketplace',
    style: 'bg-agri-light dark:bg-secondary/80'
  },
  {
    title: 'Market Insights',
    description: 'Access AI-generated insights on top-selling crops, demand trends, and regional variations.',
    icon: <BarChart4 className="h-8 w-8 text-agri-primary" />,
    link: '/dashboard',
    style: 'bg-white dark:bg-card'
  },
  {
    title: 'Fraud Protection',
    description: 'Our AI system automatically detects and prevents suspicious activities and transactions.',
    icon: <Shield className="h-8 w-8 text-agri-primary" />,
    link: '/about',
    style: 'bg-agri-light dark:bg-secondary/80'
  },
  {
    title: 'Smart Logistics',
    description: 'Optimize delivery routes and predict delivery times based on traffic and weather conditions.',
    icon: <Truck className="h-8 w-8 text-agri-primary" />,
    link: '/logistics',
    style: 'bg-white dark:bg-card'
  },
  {
    title: 'Community Forum',
    description: 'Join discussions with other farmers and buyers to share knowledge and best practices.',
    icon: <Users2 className="h-8 w-8 text-agri-primary" />,
    link: '/community',
    style: 'bg-agri-light dark:bg-secondary/80'
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="agri-container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-medium text-agri-primary mb-3 px-3 py-1 bg-agri-light rounded-full">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            AI-Powered Features for Modern Agriculture
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform combines cutting-edge AI technology with agriculture expertise to provide you with the tools you need to succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`${feature.style} border border-border rounded-xl p-6 transition-all hover:shadow-md hover:border-agri-primary/40 transform hover:-translate-y-1`}
              style={{transform: index === 1 ? 'rotate(-1deg)' : (index === 3 ? 'rotate(1deg)' : '')}}
            >
              <div className="w-14 h-14 rounded-lg bg-agri-light dark:bg-secondary flex items-center justify-center mb-5">
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

        <div className="mt-20 pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Sustainable Farming for a Better Future</h3>
              <p className="text-muted-foreground text-lg">
                AgriConnect is committed to promoting sustainable farming practices that benefit both farmers and the environment. Our AI technology helps farmers make data-driven decisions that maximize yields while minimizing environmental impact.
              </p>
            </div>
            <div className="flex-shrink-0 transform rotate-3">
              <div className="inline-flex items-center justify-center p-10 rounded-full bg-agri-light dark:bg-secondary border-4 border-white dark:border-card">
                <Leaf className="h-16 w-16 text-agri-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center relative">
          <div className="absolute inset-0 flex items-center">
            <div className="h-px w-full bg-border"></div>
          </div>
          <div className="relative">
            <span className="bg-background dark:bg-background px-6 text-lg font-medium">
              Trusted by Farmers Worldwide
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 mt-12 opacity-70">
            <span className="text-xl font-bold text-muted-foreground" style={{fontFamily: 'Georgia, serif'}}>FarmCoop</span>
            <span className="text-xl font-bold text-muted-foreground" style={{fontFamily: 'Arial, sans-serif'}}>AgriTech</span>
            <span className="text-xl font-bold text-muted-foreground" style={{fontFamily: 'Trebuchet MS, sans-serif'}}>GrowWell</span>
            <span className="text-xl font-bold text-muted-foreground" style={{fontFamily: 'Verdana, sans-serif'}}>HarvestPlus</span>
            <span className="text-xl font-bold text-muted-foreground" style={{fontFamily: 'Tahoma, sans-serif'}}>EcoFarm</span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-40 -left-20 w-40 h-40 rounded-full bg-agri-peach opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-agri-light opacity-50"></div>
    </section>
  );
};

export default FeaturesSection;
