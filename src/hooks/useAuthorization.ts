
import { useAuth, UserRole } from "@/contexts/AuthContext";

type Permission = 'list-crops' | 'purchase-crops' | 'manage-users' | 'edit-product' | 'delete-product';

// Map permissions to roles
const rolePermissions: Record<UserRole, Permission[]> = {
  farmer: ['list-crops', 'purchase-crops', 'edit-product', 'delete-product'],
  buyer: ['purchase-crops'],
  admin: ['list-crops', 'purchase-crops', 'manage-users', 'edit-product', 'delete-product']
};

export const useAuthorization = () => {
  const { user, profile } = useAuth();
  
  const isAuthenticated = !!user;
  
  const hasPermission = (permission: Permission): boolean => {
    if (!isAuthenticated || !profile) return false;
    return rolePermissions[profile.role]?.includes(permission) || false;
  };
  
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!isAuthenticated || !profile) return false;
    
    if (Array.isArray(role)) {
      return role.includes(profile.role);
    }
    
    return profile.role === role;
  };
  
  return {
    isAuthenticated,
    hasPermission,
    hasRole,
    userRole: profile?.role
  };
};
