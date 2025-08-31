import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  const handleSignIn = () => {
    toast({
      title: "Redirecting to sign in",
      description: "Taking you to secure authentication...",
    });
    // Redirect to Replit Auth
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-accent to-primary">
      <div className="container mx-auto px-4 py-8">
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
