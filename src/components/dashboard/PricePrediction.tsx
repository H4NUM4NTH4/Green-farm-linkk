
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, Droplets, LineChart } from 'lucide-react';

interface PriceData {
  crop: string;
  currentPrice: number;
  predictedPrice: number;
  changePercentage: number;
  factors: {
    weather: string;
    supply: string;
    demand: string;
  };
}

const priceData: PriceData[] = [
  {
    crop: 'Wheat',
    currentPrice: 7.25,
    predictedPrice: 7.82,
    changePercentage: 7.9,
    factors: {
      weather: 'Favorable',
      supply: 'Decreasing',
      demand: 'Stable',
    },
  },
  {
    crop: 'Corn',
    currentPrice: 4.95,
    predictedPrice: 5.35,
    changePercentage: 8.1,
    factors: {
      weather: 'Mixed',
      supply: 'Stable',
      demand: 'Increasing',
    },
  },
  {
    crop: 'Soybeans',
    currentPrice: 13.45,
    predictedPrice: 14.25,
    changePercentage: 5.9,
    factors: {
      weather: 'Favorable',
      supply: 'Decreasing',
      demand: 'Increasing',
    },
  },
];

const PricePrediction = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Price Forecast</CardTitle>
            <CardDescription>AI-powered price predictions for next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priceData.map((item, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold">{item.crop}</h3>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      item.changePercentage > 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {item.changePercentage > 0 ? '+' : ''}{item.changePercentage}%
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <div className="text-muted-foreground">Current: ${item.currentPrice.toFixed(2)}</div>
                    <div className="text-lg font-bold text-agri-primary">
                      ${item.predictedPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      <span>{item.factors.weather}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart className="h-3 w-3" />
                      <span>Supply: {item.factors.supply}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <LineChart className="h-3 w-3" />
                      <span>Demand: {item.factors.demand}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Last updated: 2 hours ago
              </div>
              <button className="text-sm text-agri-primary hover:underline">View Full Report</button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Price Prediction Chart</CardTitle>
            <CardDescription>30-day price forecast visualization</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center p-6">
            <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-muted/40 rounded-md">
              <p className="text-muted-foreground">AI Price Chart Visualization</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricePrediction;
