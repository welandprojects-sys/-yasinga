import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Landing() {
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your account.",
        });
      }
    } catch (error) {
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await signUp(
        signUpData.email, 
        signUpData.password, 
        signUpData.firstName, 
        signUpData.lastName
      );
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to Yasinga! Your account has been created successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Sign Up Error", 
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-accent to-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center min-h-screen">
          
          {/* Logo */}
          <div className="mb-8">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center shadow-xl mx-auto relative">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-white font-bold text-xl">Y</span>
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-primary mb-2 tracking-wide text-center">Yasinga</h1>
            <p className="text-xl text-gray-700 text-center">Smart M-Pesa Business Expense Tracking</p>
          </div>

          {/* Auth Forms */}
          <Card className="w-full max-w-md">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input 
                        id="signin-email"
                        type="email" 
                        value={signInData.email}
                        onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input 
                        id="signin-password"
                        type="password" 
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                        required 
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="signup">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Create a new account to start tracking your expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstName">First Name</Label>
                        <Input 
                          id="signup-firstName"
                          value={signUpData.firstName}
                          onChange={(e) => setSignUpData({...signUpData, firstName: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-lastName">Last Name</Label>
                        <Input 
                          id="signup-lastName"
                          value={signUpData.lastName}
                          onChange={(e) => setSignUpData({...signUpData, lastName: e.target.value})}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email"
                        type="email" 
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password"
                        type="password" 
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                        required 
                        minLength={6}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
          
          {/* Logo - Inspired by Yasinga brand */}
          <div className="mb-12">
            <div className="relative mb-6">
              {/* Golden background circle */}
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center shadow-xl mx-auto relative">
                {/* Burgundy inner circle */}
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-white font-bold text-xl">Y</span>
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-secondary rounded-full opacity-20 blur-xl"></div>
              </div>
              {/* Brand name with golden accent */}
              <div className="relative">
                <h1 className="text-5xl font-bold text-primary mb-2 tracking-wide">Yasinga</h1>
                <div className="w-16 h-0.5 bg-secondary mx-auto mb-2"></div>
                <p className="text-primary/80 text-lg font-medium uppercase tracking-widest text-sm">Smart M-Pesa Business Tracker</p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="max-w-md mx-auto mb-12">
            <div className="grid gap-4">
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 text-left border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <i className="fas fa-mobile-alt text-white text-lg"></i>
                  </div>
                  <h3 className="font-semibold text-primary text-lg">Auto SMS Detection</h3>
                </div>
                <p className="text-primary/70 text-sm leading-relaxed">Automatically capture and parse M-Pesa transactions from SMS</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 text-left border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <i className="fas fa-tags text-white text-lg"></i>
                  </div>
                  <h3 className="font-semibold text-primary text-lg">Smart Categorization</h3>
                </div>
                <p className="text-primary/70 text-sm leading-relaxed">Quickly categorize business vs personal expenses</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 text-left border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <i className="fas fa-chart-line text-white text-lg"></i>
                  </div>
                  <h3 className="font-semibold text-primary text-lg">Business Analytics</h3>
                </div>
                <p className="text-primary/70 text-sm leading-relaxed">Track expenses and generate reports for your restaurant</p>
              </div>
            </div>
          </div>

          {/* Auth Button */}
          <div className="space-y-4 w-full max-w-sm">
            <button 
              onClick={handleSignIn}
              className="w-full bg-white text-primary font-bold py-5 px-6 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 touch-manipulation border-2 border-white/50"
              data-testid="button-signin"
            >
              <i className="fas fa-sign-in-alt mr-3 text-secondary"></i>
              Sign In with Replit
            </button>
            <p className="text-primary/70 text-sm font-medium">
              Secure authentication • Get started in seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
