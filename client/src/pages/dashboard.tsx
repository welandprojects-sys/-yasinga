import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/ui/bottom-navigation";
import SMSConfigModal from "@/components/sms-config-modal";
import QuickCategorization from "@/components/quick-categorization";

interface DashboardStats {
  todayBusiness: string;
  todayPersonal: string;
  pendingCount: number;
  totalTransactions: number;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  otherParty: string;
  description: string;
  transactionDate: string;
  isPending: boolean;
  categoryId?: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showSMSModal, setShowSMSModal] = useState(false);

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

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Fetch pending transactions
  const { data: pendingTransactions = [], isLoading: pendingLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/pending"],
    retry: false,
  });

  // Fetch recent transactions
  const { data: recentTransactions = [], isLoading: recentLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    retry: false,
  });

  // Quick categorization mutation
  const categorizeMutation = useMutation({
    mutationFn: async ({ transactionId, categoryId }: { transactionId: string; categoryId: string }) => {
      await apiRequest("POST", `/api/transactions/${transactionId}/categorize`, { categoryId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Transaction categorized",
        description: "The transaction has been successfully categorized.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to categorize transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `KSh ${num.toLocaleString()}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center relative shadow-md">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Y</span>
                </div>
              </div>
              <h1 className="font-bold text-lg text-primary">Yasinga</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 hover:bg-muted rounded-lg touch-manipulation" 
                data-testid="button-notifications"
              >
                <i className="fas fa-bell text-muted-foreground"></i>
              </button>
              <button 
                className="p-2 hover:bg-muted rounded-lg touch-manipulation"
                data-testid="button-profile"
              >
                <i className="fas fa-user-circle text-muted-foreground"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-6">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.firstName || "there"}!
          </h2>
          <p className="text-muted-foreground">Monitor your M-Pesa transactions and track business expenses</p>
        </div>

        {/* SMS Monitoring Status - PRIMARY FEATURE */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary rounded-xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Auto SMS Detection</h3>
              <p className="text-white/90">Real-time M-Pesa monitoring</p>
            </div>
            <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
              <i className="fas fa-mobile-alt text-2xl text-secondary"></i>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Active Monitoring</span>
            </div>
            <span className="text-sm text-primary-foreground/80">
              Last sync: <span>2 min ago</span>
            </span>
          </div>
          
          <button 
            onClick={() => setShowSMSModal(true)}
            className="w-full bg-secondary/20 hover:bg-secondary/30 font-semibold py-3 px-4 rounded-lg transition-all duration-200 touch-manipulation backdrop-blur-sm border border-secondary/30"
            data-testid="button-configure-sms"
          >
            <i className="fas fa-cog mr-2 text-secondary"></i>
            Configure SMS Detection
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 border border-primary/20 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-muted-foreground">Today's Business</h4>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-store text-primary text-sm"></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary" data-testid="text-today-business">
              {statsLoading ? "..." : formatCurrency(stats?.todayBusiness || "0")}
            </p>
            <p className="text-sm text-primary/70 mt-1 font-medium">
              <i className="fas fa-arrow-up mr-1"></i>
              Business expenses
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-secondary/30 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-muted-foreground">Personal Expenses</h4>
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-secondary text-sm"></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary" data-testid="text-today-personal">
              {statsLoading ? "..." : formatCurrency(stats?.todayPersonal || "0")}
            </p>
            <p className="text-sm text-secondary/80 mt-1 font-medium">
              Personal transactions
            </p>
          </div>
        </div>

        {/* Pending Categorization - Key Feature */}
        {pendingTransactions.length > 0 && (
          <div className="bg-card rounded-xl border mb-6">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Pending Categorization</h3>
                <span 
                  className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full"
                  data-testid="text-pending-count"
                >
                  {pendingTransactions.length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Review and categorize recent transactions</p>
            </div>
            
            <div className="p-4 space-y-4">
              {pendingTransactions.slice(0, 3).map((transaction) => (
                <QuickCategorization
                  key={transaction.id}
                  transaction={transaction}
                  onCategorize={categorizeMutation.mutate}
                  isLoading={categorizeMutation.isPending}
                />
              ))}
              
              {pendingTransactions.length > 3 && (
                <button 
                  className="w-full text-primary font-medium py-2 text-sm touch-manipulation"
                  data-testid="button-view-all-pending"
                >
                  View All Pending <i className="fas fa-arrow-right ml-1"></i>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl border mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Transactions</h3>
              <button 
                className="text-primary text-sm font-medium touch-manipulation" 
                data-testid="button-view-all-transactions"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="divide-y">
            {recentLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading transactions...
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No transactions yet. SMS detection will automatically capture M-Pesa transactions.
              </div>
            ) : (
              recentTransactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'received' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <i className={`fas ${
                        transaction.type === 'received' ? 'fa-arrow-down text-green-600' : 'fa-arrow-up text-red-600'
                      }`}></i>
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || transaction.otherParty}</p>
                      <p className="text-sm text-muted-foreground">{transaction.otherParty}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(transaction.transactionDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'received' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      transaction.isPending 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {transaction.isPending ? 'Pending' : 'Categorized'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            className="bg-card border border-secondary/20 rounded-xl p-4 text-left hover:shadow-md hover:border-secondary/40 transition-all duration-300 touch-manipulation"
            data-testid="button-add-transaction"
          >
            <div className="w-10 h-10 bg-secondary/15 rounded-lg flex items-center justify-center mb-3">
              <i className="fas fa-plus text-secondary"></i>
            </div>
            <h4 className="font-medium mb-1 text-primary">Add Transaction</h4>
            <p className="text-sm text-muted-foreground">Manual entry for missing items</p>
          </button>
          
          <button 
            className="bg-card border border-primary/20 rounded-xl p-4 text-left hover:shadow-md hover:border-primary/40 transition-all duration-300 touch-manipulation"
            data-testid="button-view-reports"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <i className="fas fa-chart-bar text-primary"></i>
            </div>
            <h4 className="font-medium mb-1 text-primary">View Reports</h4>
            <p className="text-sm text-muted-foreground">Business analytics & insights</p>
          </button>
        </div>

        {/* Account Status */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-semibold mb-3">M-Pesa Accounts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-store text-primary text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-primary">Business Account</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.businessPhoneNumber || "+254 7XX XXX 890"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-secondary/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-secondary text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-secondary">Personal Account</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.personalPhoneNumber || "+254 7XX XXX 123"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-secondary">Active</span>
              </div>
            </div>
          </div>
          
          <button 
            className="w-full mt-4 text-primary font-medium py-3 text-sm border border-primary rounded-lg hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 touch-manipulation"
            data-testid="button-manage-accounts"
          >
            <i className="fas fa-cog mr-2 text-secondary"></i>
            Manage Accounts
          </button>
        </div>

      </main>

      {/* SMS Configuration Modal */}
      <SMSConfigModal 
        isOpen={showSMSModal} 
        onClose={() => setShowSMSModal(false)} 
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
