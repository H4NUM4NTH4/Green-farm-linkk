
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Box, 
  Package,
  Truck,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FarmerSidebar = () => {
  const { signOut, profile, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/farmer/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'My Products', 
      path: '/farmer/products', 
      icon: Box 
    },
    { 
      name: 'Orders', 
      path: '/farmer/orders', 
      icon: Package 
    },
    { 
      name: 'Delivery Status', 
      path: '/farmer/orders', 
      icon: Truck 
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/farmer/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="flex flex-col items-center justify-center pt-4 pb-2">
        <div className="w-full flex items-center space-x-2 px-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            {profile?.full_name?.[0] || 'F'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{profile?.full_name}</span>
            <span className="text-xs text-muted-foreground">Farmer</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive(item.path)}
                  tooltip={item.name}
                >
                  <Link to={item.path}>
                    <item.icon className="size-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Settings"
              >
                <Link to="/farmer/settings">
                  <Settings className="size-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default FarmerSidebar;
