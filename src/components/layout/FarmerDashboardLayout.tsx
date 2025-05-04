
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import FarmerSidebar from '@/components/farmer/FarmerSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Navigate } from 'react-router-dom';

interface FarmerDashboardLayoutProps {
  children: React.ReactNode;
}

const FarmerDashboardLayout: React.FC<FarmerDashboardLayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { hasRole } = useAuthorization();
  
  // Show loading state
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Check authentication
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Check role authorization
  if (!hasRole(['farmer', 'admin'])) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <FarmerSidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="container py-6 px-4 md:px-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default FarmerDashboardLayout;
