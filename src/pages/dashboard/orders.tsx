import React, { useEffect, useState } from 'react';
import { getOrdersForUser } from '@/services/orders/userOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types/product';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setLoading(true);
        const data = await getOrdersForUser(user.id);
        setOrders(data);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto py-8">
          <div>Please log in to view your orders.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        {loading ? (
          <div>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div>No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Order ID</th>
                  <th className="px-4 py-2 border-b">Date</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Total</th>
                  <th className="px-4 py-2 border-b">Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{order.id}</td>
                    <td className="px-4 py-2 border-b">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border-b">{order.status}</td>
                    <td className="px-4 py-2 border-b">₹{order.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-2 border-b">
                      <Link to={`/order/${order.id}`} className="text-blue-600 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage; 