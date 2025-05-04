
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types/product';

interface OrderStatsProps {
  orders: Order[];
}

const OrderStats: React.FC<OrderStatsProps> = ({ orders }) => {
  // Calculate order statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

  // Calculate total revenue from all orders
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      description: "All time",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Pending",
      value: pendingOrders,
      description: "Awaiting action",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      title: "Processing",
      value: processingOrders,
      description: "Accepted orders",
      color: "bg-indigo-100 text-indigo-800"
    },
    {
      title: "Shipped",
      value: shippedOrders,
      description: "In transit",
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Delivered",
      value: deliveredOrders,
      description: "Successfully delivered",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Cancelled",
      value: cancelledOrders,
      description: "Rejected or cancelled",
      color: "bg-red-100 text-red-800"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border shadow-sm">
          <CardHeader className={`${stat.color} rounded-t-lg py-2 px-4`}>
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-2 px-4">
            <div className="text-2xl font-bold">{stat.value}</div>
            <CardDescription className="text-xs">{stat.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderStats;
