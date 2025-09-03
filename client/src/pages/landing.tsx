
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, TrendingUp, ShieldCheck, Zap, ArrowRight, CheckCircle } from "lucide-react";

export default function Landing() {
  const { signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await signUp(signupEmail, signupPassword, firstName, lastName);
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-grid-black/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="container mx-auto px-4 py-16">
          {/* Header with branding */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Yasinga
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Smart M-Pesa expense tracking for Kenyan businesses and individuals
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="h-16 w-16 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Zap className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Automatic SMS Processing</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Instantly processes M-Pesa SMS notifications to track your expenses</p>
            </div>
            <div className="text-center group">
              <div className="h-16 w-16 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-800 dark:to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Smart Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Get insights into your spending patterns with intelligent categorization</p>
            </div>
            <div className="text-center group">
              <div className="h-16 w-16 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-800 dark:to-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <ShieldCheck className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Your financial data is protected with enterprise-grade security</p>
            </div>
          </div>

          {/* Auth Section */}
          <div className="max-w-lg mx-auto">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Get Started</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Join thousands of users managing their M-Pesa expenses smarter
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm transition-all duration-200">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm transition-all duration-200">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-6 mt-6">
                    <form onSubmit={handleSignIn} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-gray-700 dark:text-gray-300 font-medium">Email Address</Label>
                        <Input
                          data-testid="input-login-email"
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="h-12 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-gray-700 dark:text-gray-300 font-medium">Password</Label>
                        <Input
                          data-testid="input-login-password"
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="h-12 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                        />
                      </div>
                      <Button 
                        data-testid="button-sign-in"
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-6 mt-6">
                    <form onSubmit={handleSignUp} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name" className="text-gray-700 dark:text-gray-300 font-medium">First Name</Label>
                          <Input
                            data-testid="input-first-name"
                            id="first-name"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="h-11 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name" className="text-gray-700 dark:text-gray-300 font-medium">Last Name</Label>
                          <Input
                            data-testid="input-last-name"
                            id="last-name"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="h-11 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-gray-700 dark:text-gray-300 font-medium">Email Address</Label>
                        <Input
                          data-testid="input-signup-email"
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className="h-12 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-gray-700 dark:text-gray-300 font-medium">Password</Label>
                        <Input
                          data-testid="input-signup-password"
                          id="signup-password"
                          type="password"
                          placeholder="Create a secure password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                          className="h-12 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Password must be at least 6 characters long
                      </div>
                      <Button 
                        data-testid="button-create-account"
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <div className="mt-12 text-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Why choose Yasinga?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Real-time transaction tracking</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Intelligent expense categorization</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Business & personal separation</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Comprehensive reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
