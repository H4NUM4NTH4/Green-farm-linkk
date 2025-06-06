import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricePrediction from '@/components/dashboard/PricePrediction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  BrainCircuit, 
  CalendarClock, 
  LineChart, 
  TrendingUp, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Loader2,
  ArrowUpRight,
  ArrowDownRight 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchMarketData } from '@/services/marketData/usdaMarketService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const [activeAlert, setActiveAlert] = useState(0);

  // Use React Query to fetch and cache market data
  const { data: marketData, isLoading, isError, refetch } = useQuery({
    queryKey: ['market-data'],
    queryFn: fetchMarketData,
    refetchInterval: 120000, // Refetch every 2 minutes
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Calculate time since last update
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<string>('Just now');
  
  useEffect(() => {
    if (!marketData) return;
    
    const updateTimeSince = () => {
      const lastUpdated = new Date(marketData.lastUpdated);
      const now = new Date();
      const diffMs = now.getTime() - lastUpdated.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        setTimeSinceUpdate('Just now');
      } else if (diffMins === 1) {
        setTimeSinceUpdate('1 minute ago');
      } else {
        setTimeSinceUpdate(`${diffMins} minutes ago`);
      }
    };
    
    updateTimeSince();
    const interval = setInterval(updateTimeSince, 30000);
    
    return () => clearInterval(interval);
  }, [marketData]);

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

  // Get alert severity style
  const getAlertStyle = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20';
      default:
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  // Get alert text style
  const getAlertTextStyle = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  // Get alert icon
  const getAlertIcon = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
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
                  Last updated: {timeSinceUpdate}
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
                        {(marketData?.trendPercentage || 0) >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
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
          <Card className={`mb-8 ${marketData?.alerts && marketData.alerts.length > 0 ? 
            getAlertStyle(marketData.alerts[activeAlert]?.severity) : 
            'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20'}`}>
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
                    {marketData?.alerts && marketData.alerts.length > 0 ? 
                      getAlertIcon(marketData.alerts[activeAlert]?.severity) : 
                      <AlertCircle className="h-5 w-5 text-amber-600" />}
                  </div>
                  <div>
                    <p className={`font-medium ${marketData?.alerts && marketData.alerts.length > 0 ? 
                      getAlertTextStyle(marketData.alerts[activeAlert]?.severity) : 
                      'text-amber-800 dark:text-amber-400'}`}>
                      AI Market Alert
                    </p>
                    <p className={`text-sm ${marketData?.alerts && marketData.alerts.length > 0 ? 
                      getAlertTextStyle(marketData.alerts[activeAlert]?.severity) : 
                      'text-amber-700 dark:text-amber-500'}`}>
                      {marketData?.alerts && marketData.alerts.length > 0 
                        ? marketData.alerts[activeAlert]?.message 
                        : "No current market alerts"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className={`ml-auto ${marketData?.alerts && marketData.alerts.length > 0 ?
                    `border-${marketData.alerts[activeAlert]?.severity === 'critical' ? 'red' : 'amber'}-300 dark:border-${marketData.alerts[activeAlert]?.severity === 'critical' ? 'red' : 'amber'}-700 text-${marketData.alerts[activeAlert]?.severity === 'critical' ? 'red' : 'amber'}-700 dark:text-${marketData.alerts[activeAlert]?.severity === 'critical' ? 'red' : 'amber'}-400 hover:bg-${marketData.alerts[activeAlert]?.severity === 'critical' ? 'red' : 'amber'}-100 dark:hover:bg-${marketData.alerts[activeAlert]?.severity === 'critical' ? 'red' : 'amber'}-900/30` :
                    'border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'}`}>
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
                      {marketData?.sellingRecommendations.map((item, index) => (
                        <li key={index} className={`flex justify-between items-center ${
                          index < marketData.sellingRecommendations.length - 1 ? 'border-b border-border pb-3' : ''
                        }`}>
                          <div>
                            <div className="font-medium">{item.crop}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          <Badge className="bg-green-600">+{item.changePercentage.toFixed(1)}%</Badge>
                        </li>
                      ))}
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
                      {marketData?.buyingRecommendations.map((item, index) => (
                        <li key={index} className={`flex justify-between items-center ${
                          index < marketData.buyingRecommendations.length - 1 ? 'border-b border-border pb-3' : ''
                        }`}>
                          <div>
                            <div className="font-medium">{item.crop}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          <Badge className="bg-red-600">{item.changePercentage.toFixed(1)}%</Badge>
                        </li>
                      ))}
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

function BuyerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    if (user?.id) fetchOrders();
  }, [user?.id]);

  if (loading) return <div className="p-8">Loading orders...</div>;
  if (!orders.length) return <div className="p-8">No orders found.</div>;
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border rounded p-4">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">Order #{order.id.slice(0, 8)}</div>
                <div className="text-sm text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</div>
                <div className="text-sm">Status: {order.status}</div>
              </div>
              <div className="font-bold text-lg">₹{order.total_amount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
