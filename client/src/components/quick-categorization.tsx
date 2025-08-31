import { useQuery } from "@tanstack/react-query";

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  otherParty: string;
  description?: string;
  transactionDate: string;
  isPending: boolean;
}

interface Category {
  id: string;
  name: string;
  type: 'business' | 'personal';
  color: string;
  icon: string;
}

interface QuickCategorizationProps {
  transaction: Transaction;
  onCategorize: (params: { transactionId: string; categoryId: string }) => void;
  isLoading: boolean;
}

export default function QuickCategorization({ transaction, onCategorize, isLoading }: QuickCategorizationProps) {
  // Fetch categories for quick buttons
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const businessCategories = categories.filter(cat => cat.type === 'business');
  const personalCategories = categories.filter(cat => cat.type === 'personal');

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `KSh ${num.toLocaleString()}`;
  };

  // Get default categories for quick buttons
  const defaultBusinessCategory = businessCategories.find(cat => cat.name === 'Restaurant Supplies') || businessCategories[0];
  const defaultPersonalCategory = personalCategories.find(cat => cat.name === 'Personal Expenses') || personalCategories[0];

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <i className={`fas ${
            transaction.type === 'received' ? 'fa-arrow-down text-green-600' : 'fa-arrow-up text-red-600'
          }`}></i>
          <span className="font-medium">{formatCurrency(transaction.amount)}</span>
          <span className="text-xs bg-gray-200 px-2 py-1 rounded">SMS Detected</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {transaction.type === 'received' ? 'From' : 'To'}: {transaction.otherParty} • {formatTime(transaction.transactionDate)}
        </p>
        {transaction.description && (
          <p className="text-xs text-muted-foreground">{transaction.description}</p>
        )}
      </div>
      <div className="flex space-x-2">
        {defaultBusinessCategory && (
          <button 
            onClick={() => onCategorize({ transactionId: transaction.id, categoryId: defaultBusinessCategory.id })}
            disabled={isLoading}
            className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-medium touch-manipulation disabled:opacity-50"
            data-testid={`button-categorize-business-${transaction.id}`}
          >
            Business
          </button>
        )}
        {defaultPersonalCategory && (
          <button 
            onClick={() => onCategorize({ transactionId: transaction.id, categoryId: defaultPersonalCategory.id })}
            disabled={isLoading}
            className="bg-muted-foreground text-muted px-3 py-1 rounded text-xs font-medium touch-manipulation disabled:opacity-50"
            data-testid={`button-categorize-personal-${transaction.id}`}
          >
            Personal
          </button>
        )}
      </div>
    </div>
  );
}
