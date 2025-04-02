
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AtSign, Lock, User } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('buyer');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      onClose();
      toast({
        title: "Login successful",
        description: "Welcome back to AgriConnect!",
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(email, password, name, userRole);
      setActiveTab('login');
      toast({
        title: "Account created",
        description: "Please check your email for verification",
      });
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setUserRole('buyer');
    setActiveTab('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to AgriConnect
          </DialogTitle>
          <DialogDescription className="text-center">
            Connect with farmers and buyers around the world
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="email-login" 
                    type="email" 
                    placeholder="Enter your email" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password-login">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="password-login" 
                    type="password" 
                    placeholder="Enter your password" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
              </Button>
              
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full"
                  onClick={() => {
                    onClose();
                    window.location.href = '/auth?tab=phone';
                  }}
                >
                  Phone
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-register">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="name-register" 
                    type="text" 
                    placeholder="Enter your name" 
                    className="pl-10" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-register">Email</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="email-register" 
                    type="email" 
                    placeholder="Enter your email" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-register">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="password-register" 
                    type="password" 
                    placeholder="Create a password" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-type">I am a</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    type="button" 
                    variant={userRole === 'farmer' ? 'default' : 'outline'}
                    className={userRole !== 'farmer' ? 'border-primary text-primary hover:bg-primary/10' : ''}
                    onClick={() => setUserRole('farmer')}
                  >
                    Farmer
                  </Button>
                  <Button 
                    type="button" 
                    variant={userRole === 'buyer' ? 'default' : 'outline'}
                    className={userRole !== 'buyer' ? 'border-primary text-primary hover:bg-primary/10' : ''}
                    onClick={() => setUserRole('buyer')}
                  >
                    Buyer
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create an account'}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
