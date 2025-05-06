
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricePrediction from '@/components/dashboard/PricePrediction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, BrainCircuit, CalendarClock, LineChart, TrendingUp, Download, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

// Market data service
const fetchMarketData = async () => {
  // Simulate API call with random data generation
  // In a real app, this would be an actual API call to your backend
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const getRandomPercentage = (min: number, max: number) => {
    return +(min + Math.random() * (max - min)).toFixed(1);
  };
  
  const getRandomVolume = () => {
    return +(0.8 + Math.random() * 1.5).toFixed(1) + 'M';
  };
  
  const getRandomAccuracy = () => {
    return +(90 + Math.random() * 8).toFixed(1) + '%';
  };
  
  const getMarketTrend = () => {
    const value = getRandomPercentage(-3, 8);
    return { 
      value, 
      trend: value > 0 ? 'Bullish' : 'Bearish',
      percentage: value
    };
  };

  const trend = getMarketTrend();
  
  return {
    marketTrend: trend.trend,
    trendPercentage: trend.percentage,
    tradingVolume: getRandomVolume(),
    volumeChange: getRandomPercentage(5, 15),
    forecastAccuracy: getRandomAccuracy(),
    nextUpdate: `${Math.floor(Math.random() * 3)}h ${Math.floor(Math.random() * 59)}m`,
    alerts: [
      {
        id: 1,
        message: "Weather conditions in the Midwest may affect wheat prices in the next 2 weeks. Consider securing your supply now.",
        severity: "warning",
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        message: "Corn prices expected to rise due to increasing international demand.",
        severity: "info",
        timestamp: new Date().toISOString()
      }
    ],
    lastUpdated: new Date().toISOString()
  };
};

const Dashboard = () => {
  const [activeAlert, setActiveAlert] = useState(0);

  // Use React Query to fetch and cache market data
  const { data: marketData, isLoading, isError, refetch } = useQuery({
    queryKey: ['market-data'],
    queryFn: fetchMarketData,
    refetchInterval: 120000, // Refetch every 2 minutes
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Rotate alerts every 10 seconds
  useEffect(() => {
    if (!marketData?.alerts || marketData.alerts.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveAlert(prev => (prev + 1) % marketData.alerts.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [marketData?.alerts]);

  // Handle manual refresh
  const handleRefresh = async () => {
    toast({
      title: "Refreshing data",
      description: "Fetching the latest market insights..."
    });
    await refetch();
    toast({
      title: "Data refreshed",
      description: "Market insights have been updated"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-8">
        <div className="agri-container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="heading-2 mb-1">AI Insights Dashboard</h1>
              <p className="text-muted-foreground">
                AI-powered market analysis and price predictions
              </p>
              {!isLoading && marketData && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </Button>
              <Button size="sm" className="gap-1">
                <BrainCircuit className="h-4 w-4" />
                New Analysis
              </Button>
            </div>
          </div>
          
          {/* Dashboard summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Market Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    <div className="h-7 bg-muted animate-pulse rounded"></div>
                    <div className="h-5 bg-muted animate-pulse rounded w-24"></div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{marketData?.marketTrend || "Unknown"}</div>
                      <div className={`flex items-center text-sm ${
                        (marketData?.trendPercentage || 0) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>{(marketData?.trendPercentage || 0) >= 0 ? '+' : ''}{marketData?.trendPercentage}% this month</span>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <LineChart className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Trading Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    <div className="h-7 bg-muted animate-pulse rounded"></div>
                    <div className="h-5 bg-muted animate-pulse rounded w-24"></div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">${marketData?.tradingVolume || "0M"}</div>
                      <div className="flex items-center text-green-600 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+{marketData?.volumeChange || 0}% from last week</span>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Forecast Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    <div className="h-7 bg-muted animate-pulse rounded"></div>
                    <div className="h-5 bg-muted animate-pulse rounded w-24"></div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{marketData?.forecastAccuracy || "0%"}</div>
                      <div className="flex items-center text-amber-600 text-sm">
                        <span>Last 30 days</span>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <BrainCircuit className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Next Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    <div className="h-7 bg-muted animate-pulse rounded"></div>
                    <div className="h-5 bg-muted animate-pulse rounded w-24"></div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{marketData?.nextUpdate || "0h 0m"}</div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <span>Daily forecast at 4:00 PM</span>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <CalendarClock className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* AI alert */}
          <Card className="mb-8 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4 flex items-center gap-4">
              {isLoading ? (
                <>
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 bg-amber-200 animate-pulse rounded-full"></div>
                  </div>
                  <div className="flex-grow">
                    <div className="h-5 bg-amber-200 animate-pulse rounded w-40 mb-2"></div>
                    <div className="h-4 bg-amber-200 animate-pulse rounded w-full"></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-400">
                      AI Market Alert
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-500">
                      {marketData?.alerts && marketData.alerts.length > 0 
                        ? marketData.alerts[activeAlert]?.message 
                        : "No current market alerts"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30">
                    View Details
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* AI Price Prediction */}
          <Tabs defaultValue="price-prediction" className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="price-prediction">Price Prediction</TabsTrigger>
                <TabsTrigger value="market-trends">Market Trends</TabsTrigger>
                <TabsTrigger value="supply-demand">Supply & Demand</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-6 gap-1">
                  <CalendarClock className="h-3 w-3" />
                  30-Day Forecast
                </Badge>
              </div>
            </div>
            
            <TabsContent value="price-prediction">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center h-80">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <PricePrediction />
              )}
            </TabsContent>
            
            <TabsContent value="market-trends">
              <Card>
                <CardHeader>
                  <CardTitle>Market Trends Analysis</CardTitle>
                  <CardDescription>AI analysis of current market trends and factors</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-80">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <p className="text-muted-foreground">Market trends visualization coming soon</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="supply-demand">
              <Card>
                <CardHeader>
                  <CardTitle>Supply & Demand Analysis</CardTitle>
                  <CardDescription>AI insights on supply and demand factors affecting pricing</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-80">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <p className="text-muted-foreground">Supply & demand visualization coming soon</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Recommendations */}
          <div className="mb-8">
            <h2 className="heading-3 mb-4">AI Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Selling Recommendations</CardTitle>
                  <CardDescription>Best crops to sell based on current market conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center border-b border-border pb-3">
                          <div className="w-full">
                            <div className="h-5 bg-muted animate-pulse rounded w-24 mb-2"></div>
                            <div className="h-4 bg-muted animate-pulse rounded w-40"></div>
                          </div>
                          <div className="h-6 w-12 bg-muted animate-pulse rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center border-b border-border pb-3">
                        <div>
                          <div className="font-medium">Organic Wheat</div>
                          <div className="text-sm text-muted-foreground">Supply is decreasing, demand remains high</div>
                        </div>
                        <Badge className="bg-green-600">+7.9%</Badge>
                      </li>
                      <li className="flex justify-between items-center border-b border-border pb-3">
                        <div>
                          <div className="font-medium">Sweet Corn</div>
                          <div className="text-sm text-muted-foreground">Seasonal demand spike expected</div>
                        </div>
                        <Badge className="bg-green-600">+6.4%</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Organic Tomatoes</div>
                          <div className="text-sm text-muted-foreground">Premium prices in urban markets</div>
                        </div>
                        <Badge className="bg-green-600">+4.8%</Badge>
                      </li>
                    </ul>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Buying Recommendations</CardTitle>
                  <CardDescription>Best crops to buy based on current market conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center border-b border-border pb-3">
                          <div className="w-full">
                            <div className="h-5 bg-muted animate-pulse rounded w-24 mb-2"></div>
                            <div className="h-4 bg-muted animate-pulse rounded w-40"></div>
                          </div>
                          <div className="h-6 w-12 bg-muted animate-pulse rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center border-b border-border pb-3">
                        <div>
                          <div className="font-medium">Barley</div>
                          <div className="text-sm text-muted-foreground">Oversupply in midwest regions</div>
                        </div>
                        <Badge className="bg-red-600">-3.2%</Badge>
                      </li>
                      <li className="flex justify-between items-center border-b border-border pb-3">
                        <div>
                          <div className="font-medium">Apples</div>
                          <div className="text-sm text-muted-foreground">Bumper harvest expected in Washington</div>
                        </div>
                        <Badge className="bg-red-600">-2.7%</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Coffee Beans</div>
                          <div className="text-sm text-muted-foreground">International prices dropping</div>
                        </div>
                        <Badge className="bg-red-600">-4.5%</Badge>
                      </li>
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
