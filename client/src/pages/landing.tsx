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
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
          
          {/* Logo */}
          <div className="mb-12">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto">
              <i className="fas fa-wave-square text-primary text-3xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Yasinga</h1>
            <p className="text-accent-foreground/80 text-lg">Smart M-Pesa Business Tracker</p>
          </div>

          {/* Features List */}
          <div className="max-w-md mx-auto mb-12">
            <div className="grid gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
                <div className="flex items-center mb-2">
                  <i className="fas fa-mobile-alt text-white text-xl mr-3"></i>
                  <h3 className="font-semibold text-white">Auto SMS Detection</h3>
                </div>
                <p className="text-accent-foreground/80 text-sm">Automatically capture and parse M-Pesa transactions from SMS</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
                <div className="flex items-center mb-2">
                  <i className="fas fa-tags text-white text-xl mr-3"></i>
                  <h3 className="font-semibold text-white">Smart Categorization</h3>
                </div>
                <p className="text-accent-foreground/80 text-sm">Quickly categorize business vs personal expenses</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
                <div className="flex items-center mb-2">
                  <i className="fas fa-chart-line text-white text-xl mr-3"></i>
                  <h3 className="font-semibold text-white">Business Analytics</h3>
                </div>
                <p className="text-accent-foreground/80 text-sm">Track expenses and generate reports for your restaurant</p>
              </div>
            </div>
          </div>

          {/* Auth Button */}
          <div className="space-y-4 w-full max-w-sm">
            <button 
              onClick={handleSignIn}
              className="w-full bg-white text-primary font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
              data-testid="button-signin"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In with Replit
            </button>
            <p className="text-accent-foreground/70 text-sm">
              Secure authentication powered by Replit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
