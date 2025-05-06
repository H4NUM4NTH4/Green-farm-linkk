
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, Droplets, LineChart, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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

// Function to fetch price prediction data
const fetchPricePredictionData = async (): Promise<PriceData[]> => {
  // Simulate API call with a delay
  // In a real app, this would be an actual API call
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const getRandomPrice = (base: number) => {
    return +(base + Math.random() * 0.5).toFixed(2);
  };
  
  const getRandomPercentage = (min: number, max: number) => {
    return +(min + Math.random() * (max - min)).toFixed(1);
  };
  
  const weatherConditions = ['Favorable', 'Mixed', 'Concerning'];
  const supplyConditions = ['Decreasing', 'Stable', 'Increasing'];
  const demandConditions = ['Decreasing', 'Stable', 'Increasing'];
  
  const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  
  // Base data
  const baseData = [
    {
      crop: 'Wheat',
      currentPrice: 7.25,
      changePercentage: 7.9,
    },
    {
      crop: 'Corn',
      currentPrice: 4.95,
      changePercentage: 8.1,
    },
    {
      crop: 'Soybeans',
      currentPrice: 13.45,
      changePercentage: 5.9,
    },
  ];
  
  // Generate randomized data based on the base data
  return baseData.map(item => {
    const changePercentage = getRandomPercentage(3, 9);
    const currentPrice = getRandomPrice(item.currentPrice * 0.9);
    const predictedPrice = +(currentPrice * (1 + changePercentage / 100)).toFixed(2);
    
    return {
      crop: item.crop,
      currentPrice,
      predictedPrice,
      changePercentage,
      factors: {
        weather: getRandomElement(weatherConditions),
        supply: getRandomElement(supplyConditions),
        demand: getRandomElement(demandConditions)
      }
    };
  });
};

const PricePrediction = () => {
  // Use React Query for data fetching with caching and automatic refetching
  const { data: priceData, isLoading, isError } = useQuery({
    queryKey: ['price-prediction'],
    queryFn: fetchPricePredictionData,
    refetchInterval: 120000, // Refetch every 2 minutes
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (priceData) {
      setLastUpdated(new Date());
    }
  }, [priceData]);

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-500 font-medium">Error loading price prediction data</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try refreshing the page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Price Forecast</CardTitle>
            <CardDescription>AI-powered price predictions for next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading price forecasts...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {priceData?.map((item, index) => (
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
            )}
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Last updated: {isLoading ? 'updating...' : `${Math.floor((new Date().getTime() - lastUpdated.getTime()) / 60000)} minutes ago`}
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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Loading chart data...</p>
              </div>
            ) : (
              <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-muted/40 rounded-md">
                <p className="text-muted-foreground">AI Price Chart Visualization</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricePrediction;
