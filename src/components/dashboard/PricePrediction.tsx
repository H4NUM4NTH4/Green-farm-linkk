
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, Droplets, LineChart, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { fetchMarketData } from '@/services/marketData/usdaMarketService';

const PricePrediction = () => {
  // Use React Query for data fetching with caching and automatic refetching
  const { data: marketData, isLoading, isError } = useQuery({
    queryKey: ['market-data'],
    queryFn: fetchMarketData,
    refetchInterval: 120000, // Refetch every 2 minutes
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  useEffect(() => {
    if (marketData) {
      setLastUpdated(new Date());
      if (!selectedCrop && marketData.crops.length > 0) {
        setSelectedCrop(marketData.crops[0].crop);
      }
    }
  }, [marketData, selectedCrop]);

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

  // Get the selected crop data for the chart
  const getSelectedCropData = () => {
    if (!marketData || !selectedCrop) return null;
    return marketData.crops.find(crop => crop.crop === selectedCrop);
  };

  // Get chart data for the selected crop
  const getChartData = () => {
    const cropData = getSelectedCropData();
    if (!cropData) return [];
    return cropData.priceHistory;
  };

  // Format chart data to include the predicted price
  const formatChartData = () => {
    const cropData = getSelectedCropData();
    if (!cropData) return [];
    
    const chartData = [...cropData.priceHistory];
    const lastDate = new Date(chartData[chartData.length - 1].date);
    
    // Add predicted price point
    const predictedDate = new Date(lastDate);
    predictedDate.setDate(predictedDate.getDate() + 30); // 30 days in the future
    
    chartData.push({
      date: predictedDate.toISOString().split('T')[0],
      price: cropData.predictedPrice,
      isPredicted: true
    });
    
    return chartData;
  };

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
                {marketData?.crops.map((item, index) => (
                  <div 
                    key={index} 
                    className={`border-b border-border pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/20 rounded p-2 transition-colors ${selectedCrop === item.crop ? 'bg-muted/30' : ''}`}
                    onClick={() => setSelectedCrop(item.crop)}
                  >
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
            ) : selectedCrop ? (
              <div className="w-full h-full min-h-[220px]">
                <ResponsiveContainer width="100%" height={220}>
                  <RechartsLineChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Price']}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Line 
                      type="monotone"
                      dataKey="price"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        // If this is the predicted point, highlight it
                        if (payload.isPredicted) {
                          return (
                            <svg x={cx - 10} y={cy - 10} width={20} height={20}>
                              <circle cx="10" cy="10" r="6" fill="#8884d8" stroke="#fff" strokeWidth={2} />
                            </svg>
                          );
                        }
                        return <circle cx={cx} cy={cy} r={4} fill="#8884d8" />;
                      }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center text-muted-foreground text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Historical prices</span>
                    <div className="w-3 h-3 rounded-full bg-purple-500 ml-4 border-2 border-white"></div>
                    <span>Predicted price ({getSelectedCropData()?.predictedPrice.toFixed(2)})</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-muted/40 rounded-md">
                <p className="text-muted-foreground">Select a crop to view its price chart</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricePrediction;
