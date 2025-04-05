
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isFarmerRoute = location.pathname.startsWith('/farmer');

  const farmerMenuItems = [
    { name: 'Dashboard', path: '/farmer/dashboard' },
    { name: 'Products', path: '/farmer/products' },
    { name: 'Orders', path: '/farmer/orders' },
    { name: 'Crops', path: '/farmer/crops' },
  ];

  const buyerMenuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Orders', path: '/dashboard/orders' },
    { name: 'Favorites', path: '/dashboard/favorites' },
  ];

  const menuItems = isFarmerRoute ? farmerMenuItems : buyerMenuItems;

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr] md:gap-6 lg:gap-10 py-8">
        <aside className="fixed top-20 z-30 -ml-2 hidden h-[calc(100vh-6rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-2 pr-6">
            <div className="px-4 py-2">
              <h2 className="font-semibold text-lg mb-1">{user.full_name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{isFarmerRoute ? 'Farmer' : 'Buyer'}</p>
            </div>
            <Separator className="my-4" />
            <div className="space-y-1 py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center py-2 px-4 text-sm font-medium rounded-md",
                    location.pathname === item.path || 
                    (item.path !== '/farmer/dashboard' && location.pathname.startsWith(item.path))
                      ? "bg-muted" 
                      : "hover:bg-muted/50"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
