
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ShoppingCart, Sun, Moon, LogOut, ShieldCheck, Leaf } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { hasRole } = useAuthorization();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const openAuthModal = () => {
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'AC';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <nav className="bg-background sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm">
        <div className="agri-container">
          <div className="flex justify-between items-center h-16">
            {/* Logo and brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AC</span>
                </span>
                <span className="font-bold text-xl text-primary hidden sm:block">
                  AgriConnect
                </span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/marketplace" className="text-foreground hover:text-primary transition-colors">
                Marketplace
              </Link>
              
              {user && (
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              )}
              
              {hasRole('farmer') && (
                <Link to="/farmer/crops" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Leaf size={16} />
                  <span>My Crops</span>
                </Link>
              )}
              
              {hasRole('admin') && (
                <Link to="/admin/users" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <ShieldCheck size={16} />
                  <span>Admin</span>
                </Link>
              )}
              
              <Link to="/community" className="text-foreground hover:text-primary transition-colors">
                Community
              </Link>
            </div>

            {/* Right navigation - auth, cart, theme toggle */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="text-foreground"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              
              <Button variant="ghost" size="icon" className="text-foreground">
                <ShoppingCart size={20} />
              </Button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        {profile && (
                          <span className="text-xs rounded bg-primary/10 text-primary px-1.5 py-0.5 mt-1 inline-block w-fit">
                            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    
                    {hasRole('farmer') && (
                      <DropdownMenuItem onClick={() => navigate('/farmer/crops')}>
                        <Leaf className="mr-2 h-4 w-4" />
                        <span>My Crops</span>
                      </DropdownMenuItem>
                    )}
                    
                    {hasRole('admin') && (
                      <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Manage Users</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="outline" className="hidden sm:flex items-center gap-2" onClick={openAuthModal}>
                    <User size={16} />
                    <span>Login</span>
                  </Button>
                  
                  <Button variant="default" className="hidden sm:inline-flex" onClick={openAuthModal}>
                    Sign Up
                  </Button>
                </>
              )}
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-background border-t border-border/40">
            <div className="agri-container py-4 space-y-3">
              <Link 
                to="/" 
                className="block py-2 text-foreground hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/marketplace" 
                className="block py-2 text-foreground hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Marketplace
              </Link>
              
              {user && (
                <Link 
                  to="/dashboard" 
                  className="block py-2 text-foreground hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              {hasRole('farmer') && (
                <Link 
                  to="/farmer/crops"
                  className="block py-2 text-foreground hover:text-primary flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Leaf size={16} />
                  <span>My Crops</span>
                </Link>
              )}
              
              {hasRole('admin') && (
                <Link 
                  to="/admin/users"
                  className="block py-2 text-foreground hover:text-primary flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheck size={16} />
                  <span>Admin</span>
                </Link>
              )}
              
              <Link 
                to="/community" 
                className="block py-2 text-foreground hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Community
              </Link>
              
              {!user ? (
                <div className="pt-2 flex gap-2">
                  <Button variant="outline" className="flex-1 text-sm" onClick={() => {
                    setIsOpen(false);
                    openAuthModal();
                  }}>
                    Login
                  </Button>
                  <Button variant="default" className="flex-1 text-sm" onClick={() => {
                    setIsOpen(false);
                    openAuthModal();
                  }}>
                    Sign Up
                  </Button>
                </div>
              ) : (
                <div className="pt-2">
                  <Button variant="destructive" className="w-full text-sm" onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default Navbar;
