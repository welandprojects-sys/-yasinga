
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const { signIn, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">ExpenseTracker</h1>
          <p className="text-white/80">Track your M-Pesa expenses with ease</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to ExpenseTracker</CardTitle>
            <CardDescription>
              Sign in with your Replit account to start tracking your M-Pesa transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Use your existing Replit account to access ExpenseTracker
              </p>
              <Button 
                onClick={signIn} 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign in with Replit
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                New to Replit? <a href="https://replit.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Create a free account</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
