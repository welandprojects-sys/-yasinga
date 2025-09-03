import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/ui/bottom-navigation";

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // User will automatically be redirected to landing page by the Router component
      // No need for manual redirect
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    try {
      toast({
        title: "Logging out",
        description: "Signing you out...",
      });
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <nav className="bg-card border-b sticky top-0 z-50 pwa-header">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="font-bold text-lg">Settings</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Content */}
      <main className="container mx-auto px-4 py-6">
        
        {/* Profile Section */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h3 className="font-semibold mb-4">Profile Information</h3>
          <div className="flex items-center space-x-4 mb-4">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-primary text-xl"></i>
              </div>
            )}
            <div>
              <p className="font-medium text-lg">
                {user?.firstName || user?.lastName 
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : 'User'}
              </p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button 
            className="text-primary font-medium text-sm touch-manipulation"
            data-testid="button-edit-profile"
          >
            <i className="fas fa-edit mr-2"></i>
            Edit Profile
          </button>
        </div>

        {/* M-Pesa Accounts */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">M-Pesa Accounts</h3>
            <div className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <i className="fas fa-sim-card"></i>
              <span>Multi-SIM Ready</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-store text-green-600"></i>
                </div>
                <div>
                  <p className="font-medium">Business Account</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.businessPhoneNumber || "Not configured"}
                  </p>
                  <p className="text-xs text-green-600">
                    <i className="fas fa-check-circle mr-1"></i>
                    Auto-detects from any SIM
                  </p>
                </div>
              </div>
              <button 
                className="text-primary text-sm font-medium touch-manipulation"
                data-testid="button-edit-business-account"
              >
                Edit
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-blue-600"></i>
                </div>
                <div>
                  <p className="font-medium">Personal Account</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.personalPhoneNumber || "Not configured"}
                  </p>
                  <p className="text-xs text-blue-600">
                    <i className="fas fa-check-circle mr-1"></i>
                    Auto-detects from any SIM
                  </p>
                </div>
              </div>
              <button 
                className="text-primary text-sm font-medium touch-manipulation"
                data-testid="button-edit-personal-account"
              >
                Edit
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <i className="fas fa-info-circle text-amber-600 mt-0.5 text-sm"></i>
              <div className="text-xs text-amber-700">
                <p className="font-medium">SIM Card Flexibility</p>
                <p>Switch between any SIM cards - Yasinga will continue tracking M-Pesa transactions automatically without any setup needed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-4 mb-6">
          <button className="w-full bg-card border rounded-xl p-4 text-left hover:shadow-md transition-shadow touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-mobile-alt text-primary"></i>
                </div>
                <div>
                  <h4 className="font-medium">SMS Detection Settings</h4>
                  <p className="text-sm text-muted-foreground">Configure automatic transaction detection</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-muted-foreground"></i>
            </div>
          </button>

          <button className="w-full bg-card border rounded-xl p-4 text-left hover:shadow-md transition-shadow touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-tags text-chart-2"></i>
                </div>
                <div>
                  <h4 className="font-medium">Categories</h4>
                  <p className="text-sm text-muted-foreground">Manage expense categories</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-muted-foreground"></i>
            </div>
          </button>

          <button className="w-full bg-card border rounded-xl p-4 text-left hover:shadow-md transition-shadow touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bell text-chart-3"></i>
                </div>
                <div>
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-muted-foreground">Alert preferences</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-muted-foreground"></i>
            </div>
          </button>

          <button className="w-full bg-card border rounded-xl p-4 text-left hover:shadow-md transition-shadow touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-download text-chart-4"></i>
                </div>
                <div>
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">Download your transaction history</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-muted-foreground"></i>
            </div>
          </button>
        </div>

        {/* App Information */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h3 className="font-semibold mb-4">About Yasinga</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Version 1.0.0</p>
            <p>Smart M-Pesa Business Tracker for Restaurant Owners</p>
            <p>Built with ❤️ for small business success</p>
          </div>
          <div className="flex space-x-4 mt-4">
            <button className="text-primary text-sm font-medium touch-manipulation">
              Privacy Policy
            </button>
            <button className="text-primary text-sm font-medium touch-manipulation">
              Terms of Service
            </button>
            <button className="text-primary text-sm font-medium touch-manipulation">
              Support
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full bg-destructive text-destructive-foreground font-medium py-3 px-4 rounded-lg touch-manipulation"
          data-testid="button-logout"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Sign Out
        </button>

      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
