import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/ui/bottom-navigation";

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  otherParty: string;
  description?: string;
  transactionDate: string;
  isPending: boolean;
  categoryId?: string;
}

export default function Transactions() {
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

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    retry: false,
  });

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `KSh ${num.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Navigation */}
      <nav className="bg-card border-b sticky top-0 z-50 pwa-header">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="font-bold text-lg">Transactions</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 hover:bg-muted rounded-lg touch-manipulation"
                data-testid="button-filter"
              >
                <i className="fas fa-filter text-muted-foreground"></i>
              </button>
              <button
                className="p-2 hover:bg-muted rounded-lg touch-manipulation"
                data-testid="button-search"
              >
                <i className="fas fa-search text-muted-foreground"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Transactions List */}
      <main className="container mx-auto px-4 py-6">
        {transactionsLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-receipt text-muted-foreground text-xl"></i>
            </div>
            <h3 className="font-semibold text-lg mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground mb-6">
              SMS detection will automatically capture your M-Pesa transactions, or you can add them manually.
            </p>
            <button
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium touch-manipulation"
              data-testid="button-add-first-transaction"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-card rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'received' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <i className={`fas ${
                        transaction.type === 'received'
                          ? 'fa-arrow-down text-green-600'
                          : 'fa-arrow-up text-red-600'
                      } text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{transaction.otherParty}</p>
                        <p className={`font-bold text-lg ${
                          transaction.type === 'received' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {transaction.description || `${transaction.type === 'received' ? 'Received from' : 'Sent to'} ${transaction.otherParty}`}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.transactionDate)} • {formatTime(transaction.transactionDate)}
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
                  </div>
                </div>

                {transaction.isPending && (
                  <div className="mt-3 pt-3 border-t flex space-x-2">
                    <button
                      className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium touch-manipulation"
                      data-testid={`button-categorize-${transaction.id}`}
                    >
                      Categorize
                    </button>
                    <button
                      className="px-4 py-2 border border-border rounded-lg text-sm font-medium touch-manipulation"
                      data-testid={`button-edit-${transaction.id}`}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}