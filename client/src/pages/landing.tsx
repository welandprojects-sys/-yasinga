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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-grid-black/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="container mx-auto px-4 py-6 md:py-12">
          {/* Header with branding - Compact for mobile */}
          <div className="text-center mb-6 md:mb-12">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Yasinga
              </h1>
            </div>
            <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
              Smart M-Pesa expense tracking for Kenyan businesses and individuals
            </p>
          </div>

          {/* Features Grid - Hidden on mobile */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Zap, title: "Automatic SMS Processing", desc: "Instantly processes M-Pesa SMS notifications to track your expenses", color: "blue" },
              { icon: TrendingUp, title: "Smart Analytics", desc: "Get insights into your spending patterns with intelligent categorization", color: "indigo" },
              { icon: ShieldCheck, title: "Secure & Private", desc: "Your financial data is protected with enterprise-grade security", color: "slate" }
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center group">
                <div className={`h-16 w-16 bg-gradient-to-br from-${color}-100 to-${color}-200 dark:from-${color}-800 dark:to-${color}-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`h-8 w-8 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile Features - Simple list */}
          <div className="md:hidden mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                ✨ Automatic SMS Processing • 📊 Smart Analytics • 🔒 Secure & Private
              </p>
            </div>
          </div>

          {/* Auth Section */}
          <div className="max-w-lg mx-auto">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Get Started</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                  Join thousands managing their M-Pesa expenses smarter
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

                  <TabsContent value="login" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
                    <form onSubmit={handleSignIn} className="space-y-4 md:space-y-5">
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
                          className="h-10 md:h-12 text-sm md:text-base"
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
                          className="h-10 md:h-12 text-sm md:text-base"
                        />
                      </div>
                      <Button
                        data-testid="button-sign-in"
                        type="submit"
                        className="w-full h-10 md:h-12 text-sm md:text-base"
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

                  <TabsContent value="signup" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
                    <form onSubmit={handleSignUp} className="space-y-4 md:space-y-5">
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
                            className="h-9 md:h-11 text-sm md:text-base"
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
                            className="h-9 md:h-11 text-sm md:text-base"
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
                          className="h-10 md:h-12 text-sm md:text-base"
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
                          className="h-10 md:h-12 text-sm md:text-base"
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                        Password must be at least 6 characters long
                      </div>
                      <Button
                        data-testid="button-create-account"
                        type="submit"
                        className="w-full h-10 md:h-12 text-sm md:text-base"
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

            {/* Benefits Section - Simplified for mobile */}
            <div className="mt-6 md:mt-12 text-center">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 md:mb-6 hidden md:block">Why choose Yasinga?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Real-time transaction tracking</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Intelligent expense categorization</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Business & personal separation</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Comprehensive reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}