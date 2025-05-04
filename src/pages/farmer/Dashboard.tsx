
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FarmerDashboardLayout from '@/components/layout/FarmerDashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Loader2, Eye, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersForFarmer } from '@/services/orders';
import { Order } from '@/types/product';
import OrderStats from '@/components/farmer/OrderStats';
import OrderRequestCard from '@/components/orders/OrderRequestCard';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const farmerOrders = await getOrdersForFarmer(user.id);
        setOrders(farmerOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  // Process data for charts
  const processOrdersForChart = (orders: Order[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders: 0,
        amount: 0
      };
    });
    
    // Group orders by date
    orders.forEach(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      const existingDay = last7Days.find(day => day.date === orderDate);
      
      if (existingDay) {
        existingDay.orders += 1;
        existingDay.amount += order.total_amount;
      }
    });
    
    return last7Days;
  };

  const chartData = processOrdersForChart(orders);

  // Get the latest pending orders for the dashboard
  const pendingOrders = orders
    .filter(order => order.status === 'pending')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <FarmerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Farmer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your farmer dashboard
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <OrderStats orders={orders} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>
                    Orders and revenue for the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="display" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const parts = value.split(' ');
                            if (parts.length >= 2) {
                              return `${parts[0]} ${parts[1]}`;
                            }
                            return value;
                          }}
                        />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(value)} 
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value as number), 'Revenue']} 
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#colorAmount)" 
                          name="Revenue"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Pending Orders</CardTitle>
                      <CardDescription>
                        Orders awaiting your action
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/farmer/orders">
                        <Eye className="h-4 w-4 mr-1" />
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingOrders.length > 0 ? (
                      pendingOrders.map((order) => (
                        <div key={order.id} className="p-3 border rounded-lg hover:bg-muted/50">
                          <Link to={`/farmer/orders/${order.id}`} className="block">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">
                                  #{order.id.substring(0, 8)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {formatCurrency(order.total_amount)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground text-sm">
                          No pending orders at the moment
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t">
                  <Button variant="link" asChild className="w-full">
                    <Link to="/farmer/orders?status=pending">View all pending orders</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Recent Orders</h2>
                  <p className="text-muted-foreground">
                    Your most recent orders
                  </p>
                </div>
                <Button asChild>
                  <Link to="/farmer/products/add">
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Product
                  </Link>
                </Button>
              </div>
              
              {orders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3)
                    .map((order) => (
                      <OrderRequestCard key={order.id} order={order} />
                    ))
                  }
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No orders have been placed for your products yet.
                    </p>
                    <Button asChild>
                      <Link to="/farmer/products/add">
                        <Plus className="h-4 w-4 mr-1" />
                        Add New Product
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {orders.length > 3 && (
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/farmer/orders">View all orders</Link>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </FarmerDashboardLayout>
  );
};

export default Dashboard;
