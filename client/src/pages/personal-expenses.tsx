
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/ui/bottom-navigation";

interface Category {
  id: string;
  name: string;
  type: 'business' | 'personal';
  color: string;
  icon: string;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  otherParty: string;
  description?: string;
  transactionDate: string;
  categoryId?: string;
  category?: Category;
}

interface CategorySpending {
  category: Category;
  totalAmount: number;
  transactionCount: number;
  lastTransaction: string;
}

export default function PersonalExpenses() {
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

  // Fetch personal transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    retry: false,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Process personal transactions and group by category
  const personalCategories = categories.filter(cat => cat.type === 'personal');
  const personalTransactions = transactions.filter(transaction => {
    const category = categories.find(cat => cat.id === transaction.categoryId);
    return category?.type === 'personal' && transaction.type === 'sent';
  });

  // Calculate spending by category
  const categorySpending: CategorySpending[] = personalCategories.map(category => {
    const categoryTransactions = personalTransactions.filter(t => t.categoryId === category.id);
    const totalAmount = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const lastTransaction = categoryTransactions.length > 0 
      ? categoryTransactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())[0].transactionDate
      : '';

    return {
      category,
      totalAmount,
      transactionCount: categoryTransactions.length,
      lastTransaction,
    };
  }).filter(cs => cs.transactionCount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // Smart category suggestions based on transaction descriptions
  const getSmartSuggestions = () => {
    const uncategorizedTransactions = personalTransactions.filter(t => !t.categoryId);
    const suggestions = [];

    // Analyze descriptions for common personal expense patterns
    uncategorizedTransactions.forEach(transaction => {
      if (transaction.description) {
        const desc = transaction.description.toLowerCase();
        if (desc.includes('food') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('restaurant')) {
          suggestions.push({ type: 'Food & Dining', amount: parseFloat(transaction.amount) });
        } else if (desc.includes('transport') || desc.includes('fuel') || desc.includes('taxi') || desc.includes('matatu')) {
          suggestions.push({ type: 'Transportation', amount: parseFloat(transaction.amount) });
        } else if (desc.includes('grocery') || desc.includes('shopping') || desc.includes('supermarket')) {
          suggestions.push({ type: 'Groceries', amount: parseFloat(transaction.amount) });
        } else if (desc.includes('medical') || desc.includes('hospital') || desc.includes('pharmacy')) {
          suggestions.push({ type: 'Healthcare', amount: parseFloat(transaction.amount) });
        } else if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('fun')) {
          suggestions.push({ type: 'Entertainment', amount: parseFloat(transaction.amount) });
        }
      }
    });

    return suggestions;
  };

  const smartSuggestions = getSmartSuggestions();
  const totalPersonalSpending = personalTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

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
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-muted rounded-lg touch-manipulation"
              >
                <i className="fas fa-arrow-left text-muted-foreground"></i>
              </button>
              <h1 className="font-bold text-lg">Personal Expenses</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-muted rounded-lg touch-manipulation">
                <i className="fas fa-filter text-muted-foreground"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Summary Card */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-user text-green-600 text-xl"></i>
            </div>
            <div>
              <h2 className="font-bold text-xl">Total Personal Spending</h2>
              <p className="text-muted-foreground">All time personal expenses</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPersonalSpending)}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {personalTransactions.length} transactions across {categorySpending.length} categories
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-4">Spending by Category</h3>
          {transactionsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading expenses...</p>
            </div>
          ) : categorySpending.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user text-muted-foreground text-xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">No Personal Expenses Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start categorizing your M-Pesa transactions as personal expenses to see insights here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorySpending.map((spending) => (
                <div key={spending.category.id} className="bg-card rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: spending.category.color }}
                      >
                        <i className={`${spending.category.icon} text-lg`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{spending.category.name}</h4>
                          <p className="font-bold text-lg text-red-600">
                            -{formatCurrency(spending.totalAmount)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {spending.transactionCount} transactions
                        </p>
                        {spending.lastTransaction && (
                          <p className="text-xs text-muted-foreground">
                            Last: {formatDate(spending.lastTransaction)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Suggestions */}
        {smartSuggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4">Smart Category Suggestions</h3>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <i className="fas fa-lightbulb text-green-600"></i>
                <p className="text-sm font-medium text-green-800">
                  Based on transaction descriptions, we detected these potential categories:
                </p>
              </div>
              <div className="space-y-2">
                {smartSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-green-700">{suggestion.type}</span>
                    <span className="font-medium text-green-800">{formatCurrency(suggestion.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.href = '/transactions'}
            className="bg-green-600 text-white p-4 rounded-xl font-medium touch-manipulation"
          >
            <i className="fas fa-list mr-2"></i>
            View All Transactions
          </button>
          <button 
            onClick={() => window.location.href = '/settings'}
            className="bg-card border p-4 rounded-xl font-medium touch-manipulation"
          >
            <i className="fas fa-tags mr-2"></i>
            Manage Categories
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
