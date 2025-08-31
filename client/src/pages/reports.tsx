import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/ui/bottom-navigation";

interface DashboardStats {
  todayBusiness: string;
  todayPersonal: string;
  pendingCount: number;
  totalTransactions: number;
}

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch dashboard stats for basic reporting
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `KSh ${num.toLocaleString()}`;
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
              <h1 className="font-bold text-lg">Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 hover:bg-muted rounded-lg touch-manipulation" 
                data-testid="button-export"
              >
                <i className="fas fa-download text-muted-foreground"></i>
              </button>
              <button 
                className="p-2 hover:bg-muted rounded-lg touch-manipulation"
                data-testid="button-date-filter"
              >
                <i className="fas fa-calendar text-muted-foreground"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Reports Content */}
      <main className="container mx-auto px-4 py-6">
        
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-muted-foreground">Business Total</h4>
              <i className="fas fa-store text-chart-1"></i>
            </div>
            <p className="text-2xl font-bold text-chart-1" data-testid="text-business-total">
              {statsLoading ? "..." : formatCurrency(stats?.todayBusiness || "0")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Today's business expenses</p>
          </div>

          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-muted-foreground">Personal Total</h4>
              <i className="fas fa-user text-chart-2"></i>
            </div>
            <p className="text-2xl font-bold text-chart-2" data-testid="text-personal-total">
              {statsLoading ? "..." : formatCurrency(stats?.todayPersonal || "0")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Today's personal expenses</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h3 className="font-semibold mb-4">Transaction Summary</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary" data-testid="text-total-transactions">
                {statsLoading ? "..." : stats?.totalTransactions || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary" data-testid="text-pending-transactions">
                {statsLoading ? "..." : stats?.pendingCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </div>
        </div>

        {/* Report Actions */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold">Generate Reports</h3>
          
          <div className="grid gap-4">
            <button className="bg-card border rounded-xl p-4 text-left hover:shadow-md transition-shadow touch-manipulation">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-chart-1"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">Monthly Business Report</h4>
                    <p className="text-sm text-muted-foreground">Business expenses breakdown</p>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </div>
            </button>

            <button className="bg-card border rounded-xl p-4 text-left hover:shadow-md transition-shadow touch-manipulation">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-pie text-chart-2"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">Category Analysis</h4>
                    <p className="text-sm text-muted-foreground">Spending by category</p>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </div>
            </button>

            <button className="bg-card border rounded-xl p-4 text-left hover:shadow-md transition-shadow touch-manipulation">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-chart-3"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">Custom Date Range</h4>
                    <p className="text-sm text-muted-foreground">Transactions for specific period</p>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </div>
            </button>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="bg-gradient-to-r from-accent to-accent/50 rounded-xl p-6">
          <h3 className="font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Advanced analytics and reporting features are being developed to help you better understand your business finances.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <i className="fas fa-check text-chart-3"></i>
              <span>Visual charts and graphs</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-check text-chart-3"></i>
              <span>Supplier spending analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-check text-chart-3"></i>
              <span>Export to PDF/Excel</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-check text-chart-3"></i>
              <span>Automated monthly reports</span>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
