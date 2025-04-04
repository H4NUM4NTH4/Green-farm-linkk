
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Eye, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthorization } from '@/hooks/useAuthorization';
import { getOrdersForFarmer } from '@/services/orderService';
import { Order } from '@/types/product';
import { formatDate } from '@/lib/utils';

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const variants: Record<Order['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string }> = {
    'pending': { variant: 'outline', text: 'Pending' },
    'processing': { variant: 'secondary', text: 'Processing' },
    'shipped': { variant: 'default', text: 'Shipped' },
    'delivered': { variant: 'default', text: 'Delivered' },
    'cancelled': { variant: 'destructive', text: 'Cancelled' }
  };

  const { variant, text } = variants[status] || { variant: 'outline', text: status };

  return <Badge variant={variant}>{text}</Badge>;
};

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { hasPermission } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const ordersData = await getOrdersForFarmer(user.id);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const handleViewOrder = (orderId: string) => {
    navigate(`/farmer/orders/${orderId}`);
  };

  if (!hasPermission('list-crops')) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You don't have permission to manage orders.</p>
              <Button onClick={() => navigate('/')}>Return to Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Orders</h1>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-agri-primary"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center p-8">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't received any orders yet.</p>
                  <Button asChild variant="outline">
                    <Link to="/farmer/products">Manage Your Products</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            {formatDate(new Date(order.created_at))}
                          </TableCell>
                          <TableCell>
                            {order.buyer?.full_name || 'Unknown Customer'}
                          </TableCell>
                          <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewOrder(order.id)}
                            >
                              <Eye size={16} className="mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderManagement;
