import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    signIn(); // This will redirect to Replit OAuth
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-accent to-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
          
          {/* Logo */}
          <div className="mb-12">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center shadow-xl mx-auto relative">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-white font-bold text-xl">Y</span>
                </div>
                <div className="absolute inset-0 bg-secondary rounded-full opacity-20 blur-xl"></div>
              </div>
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
                    <span className="text-white text-lg">📱</span>
                  </div>
                  <h3 className="font-semibold text-primary text-lg">Auto SMS Detection</h3>
                </div>
                <p className="text-primary/70 text-sm leading-relaxed">Automatically capture and parse M-Pesa transactions from SMS</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 text-left border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <span className="text-white text-lg">🏷️</span>
                  </div>
                  <h3 className="font-semibold text-primary text-lg">Smart Categorization</h3>
                </div>
                <p className="text-primary/70 text-sm leading-relaxed">Quickly categorize business vs personal expenses</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 text-left border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <h3 className="font-semibold text-primary text-lg">Business Analytics</h3>
                </div>
                <p className="text-primary/70 text-sm leading-relaxed">Track expenses and generate reports for your restaurant</p>
              </div>
            </div>
          </div>

          {/* Auth Button */}
          <div className="space-y-4 w-full max-w-sm">
            <Button 
              onClick={handleSignIn}
              className="w-full bg-white text-primary font-bold py-5 px-6 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 touch-manipulation border-2 border-white/50"
              data-testid="button-signin"
              disabled={isLoading}
            >
              <span className="mr-3 text-secondary">🔑</span>
              {isLoading ? "Connecting..." : "Sign In with Replit"}
            </Button>
            <p className="text-primary/70 text-sm font-medium">
              Secure authentication • Get started in seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
