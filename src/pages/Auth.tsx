
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AtSign, LockIcon, Phone, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const AuthPage: React.FC = () => {
  const { user, isLoading, signIn, signUp, signInWithGoogle, signInWithPhone, verifyOtp } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'farmer' | 'buyer'>('buyer');
  const [loading, setLoading] = useState<boolean>(false);

  // Redirect if already logged in
  if (user && !isLoading) {
    return <Navigate to="/" />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
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
    
    setLoading(true);
    
    try {
      await signUp(email, password, name, userRole);
      setActiveTab('login');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await signInWithPhone(phoneNumber);
      setShowOtpInput(true);
    } catch (error) {
      console.error('Phone login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await verifyOtp(phoneNumber, otp);
      navigate('/');
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to AgriConnect
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Connect with farmers and buyers around the world
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div className="space-y-6">
              <div className="flex justify-center space-x-4">
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                  Google
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setActiveTab('phone');
                  }}
                >
                  Phone
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-login">Email address</Label>
                    <div className="relative mt-1">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

                  <div>
                    <div className="flex justify-between">
                      <Label htmlFor="password-login">Password</Label>
                      <a
                        href="#"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative mt-1">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="name-register">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="name-register"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email-register">Email</Label>
                <div className="relative mt-1">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

              <div>
                <Label htmlFor="password-register">Password</Label>
                <div className="relative mt-1">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

              <div>
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <Button
                    type="button"
                    variant={userRole === 'farmer' ? 'default' : 'outline'}
                    onClick={() => setUserRole('farmer')}
                    className={userRole === 'farmer' ? 'bg-primary' : ''}
                  >
                    Farmer
                  </Button>
                  <Button
                    type="button"
                    variant={userRole === 'buyer' ? 'default' : 'outline'}
                    onClick={() => setUserRole('buyer')}
                    className={userRole === 'buyer' ? 'bg-primary' : ''}
                  >
                    Buyer
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="phone">
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-4">
                <Badge variant="outline" className="bg-muted">
                  Phone Authentication
                </Badge>
              </div>

              {!showOtpInput ? (
                <form onSubmit={handlePhoneLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone-number"
                        type="tel"
                        placeholder="+1234567890"
                        className="pl-10"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter phone with country code (e.g., +1 for US)
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending Code..." : "Send Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <div className="mt-2 flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Login"}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        setShowOtpInput(false);
                        setOtp('');
                      }}
                      className="text-xs"
                    >
                      Change phone number
                    </Button>
                  </div>
                </form>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setActiveTab('login')}
              >
                Back to Login
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
