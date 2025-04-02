
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ShoppingCart, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-background sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm">
      <div className="agri-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-agri-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </span>
              <span className="font-bold text-xl text-agri-primary hidden sm:block">
                AgriConnect
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-agri-primary transition-colors">
              Home
            </Link>
            <Link to="/marketplace" className="text-foreground hover:text-agri-primary transition-colors">
              Marketplace
            </Link>
            <Link to="/dashboard" className="text-foreground hover:text-agri-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/community" className="text-foreground hover:text-agri-primary transition-colors">
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
            
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              <User size={16} />
              <span>Login</span>
            </Button>
            
            <Button variant="default" className="hidden sm:inline-flex">
              Sign Up
            </Button>
            
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
              className="block py-2 text-foreground hover:text-agri-primary"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/marketplace" 
              className="block py-2 text-foreground hover:text-agri-primary"
              onClick={() => setIsOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              to="/dashboard" 
              className="block py-2 text-foreground hover:text-agri-primary"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/community" 
              className="block py-2 text-foreground hover:text-agri-primary"
              onClick={() => setIsOpen(false)}
            >
              Community
            </Link>
            <div className="pt-2 flex gap-2">
              <Button variant="outline" className="flex-1 text-sm">
                Login
              </Button>
              <Button variant="default" className="flex-1 text-sm">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
