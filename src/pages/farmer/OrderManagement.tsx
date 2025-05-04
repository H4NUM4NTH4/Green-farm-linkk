
import React, { useEffect, useState } from 'react';
import FarmerDashboardLayout from '@/components/layout/FarmerDashboardLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersForFarmer } from '@/services/orders';
import { Order, OrderStatus } from '@/types/product';
import OrderRequestCard from '@/components/orders/OrderRequestCard';
import OrderStats from '@/components/farmer/OrderStats';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

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

  // Handle status update from child components
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter(order => {
    // First apply status filter
    if (activeTab !== 'all' && order.status !== activeTab) {
      return false;
    }
    
    // Then apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        (order.buyer?.full_name || '').toLowerCase().includes(searchLower) ||
        order.shipping_address.fullName.toLowerCase().includes(searchLower) ||
        order.shipping_address.address.toLowerCase().includes(searchLower) ||
        order.shipping_address.city.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Sort the filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortOrder === 'highest') {
      return b.total_amount - a.total_amount;
    } else if (sortOrder === 'lowest') {
      return a.total_amount - b.total_amount;
    }
    return 0;
  });

  return (
    <FarmerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-muted-foreground">
            Track and manage orders for your products
          </p>
        </div>

        <OrderStats orders={orders} />

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" disabled>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <TabsList className="mb-4 md:mb-0">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="processing">Processing</TabsTrigger>
                  <TabsTrigger value="shipped">Shipped</TabsTrigger>
                  <TabsTrigger value="delivered">Delivered</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <Input
                    placeholder="Search orders..."
                    className="w-full md:w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="highest">Highest amount</SelectItem>
                      <SelectItem value="lowest">Lowest amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sortedOrders.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <p className="text-muted-foreground">No orders found{activeTab !== 'all' ? ` with status "${activeTab}"` : ''}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedOrders.map((order) => (
                      <OrderRequestCard 
                        key={order.id} 
                        order={order} 
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </FarmerDashboardLayout>
  );
};

export default OrderManagement;
