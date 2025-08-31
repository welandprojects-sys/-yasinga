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
      <main className="container mx-auto px-4 py-6 max-w-md">
        
        {/* Header with Balance */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-sm mb-1">Good Morning</p>
          <h2 className="text-base font-medium text-foreground mb-6">
            {user?.firstName || "User"}
          </h2>
          <div className="mb-1">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <h3 className="text-4xl font-bold text-foreground mb-2">KES 12,754.00</h3>
            <div className="flex items-center justify-center text-muted-foreground text-sm">
              <i className="fas fa-edit mr-1"></i>
              <span>Edit</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Circular Layout */}
        <div className="flex justify-center space-x-8 mb-8">
          <button className="text-center touch-manipulation" data-testid="button-add-expense">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <i className="fas fa-receipt text-white text-xl"></i>
            </div>
            <p className="text-sm font-medium text-foreground">Add Expense</p>
          </button>
          <button className="text-center touch-manipulation" data-testid="button-suppliers">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <i className="fas fa-truck text-white text-xl"></i>
            </div>
            <p className="text-sm font-medium text-foreground">Suppliers</p>
          </button>
          <button 
            className="text-center touch-manipulation" 
            onClick={() => setShowSMSModal(true)}
            data-testid="button-setup-mpesa"
          >
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <i className="fas fa-mobile-alt text-white text-xl"></i>
            </div>
            <p className="text-sm font-medium text-foreground">Setup M-Pesa</p>
          </button>
        </div>

        {/* Restaurant Performance Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-4 text-center border shadow-sm">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-300" strokeDasharray="100, 100" strokeDashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-green-500" strokeDasharray="75, 100" strokeDashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-utensils text-green-500 text-lg"></i>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Today's Revenue</p>
            <p className="text-lg font-bold text-foreground">
              {stats ? formatCurrency(stats.todayBusiness) : "KES 0"}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center border shadow-sm">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-300" strokeDasharray="100, 100" strokeDashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-red-500" strokeDasharray="45, 100" strokeDashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-shopping-cart text-red-500 text-lg"></i>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Today's Expenses</p>
            <p className="text-lg font-bold text-foreground">
              {stats ? formatCurrency(stats.todayPersonal) : "KES 0"}
            </p>
          </div>
        </div>

        {/* Latest Transactions */}
        <div className="bg-card rounded-2xl border mb-6">
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Latest Transactions</h3>
              <button 
                className="text-primary text-sm font-medium touch-manipulation" 
                data-testid="button-view-all-transactions"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="px-4 pb-4">
            {recentLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading transactions...
              </div>
            ) : (
              <div className="space-y-3">
                {/* Sample transactions matching the screenshot */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                      <i className="fas fa-arrow-up text-red-500 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">JOHN GROCERY</p>
                      <p className="text-sm text-muted-foreground">Today</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">KES 2,045.00</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <i className="fas fa-arrow-down text-green-500 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Top Up - Mpesa</p>
                      <p className="text-sm text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">KES 1,705.00</p>
                  </div>
                </div>
                
                {/* Show real transactions if available */}
                {recentTransactions.slice(0, 2).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'received' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <i className={`fas text-sm ${
                          transaction.type === 'received' ? 'fa-arrow-down text-green-500' : 'fa-arrow-up text-red-500'
                        }`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.otherParty}</p>
                        <p className="text-sm text-muted-foreground">{formatTime(transaction.transactionDate)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
