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

interface Category {
  id: string;
  name: string;
  type: 'business' | 'personal';
  color: string;
  icon: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  category?: Category;
  onCategorize?: (transactionId: string, categoryId: string) => void;
  onEdit?: (transactionId: string) => void;
  isLoading?: boolean;
}

export default function TransactionCard({ 
  transaction, 
  category, 
  onCategorize, 
  onEdit, 
  isLoading = false 
}: TransactionCardProps) {
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

  return (
    <div className="bg-card rounded-xl border p-4" data-testid={`card-transaction-${transaction.id}`}>
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
              <p className="font-medium truncate" data-testid={`text-party-${transaction.id}`}>
                {transaction.otherParty}
              </p>
              <p className={`font-bold text-lg ${
                transaction.type === 'received' ? 'text-green-600' : 'text-red-600'
              }`} data-testid={`text-amount-${transaction.id}`}>
                {transaction.type === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground truncate" data-testid={`text-description-${transaction.id}`}>
              {transaction.description || `${transaction.type === 'received' ? 'Received from' : 'Sent to'} ${transaction.otherParty}`}
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground" data-testid={`text-date-${transaction.id}`}>
                {formatDate(transaction.transactionDate)} • {formatTime(transaction.transactionDate)}
              </p>
              <div className="flex items-center space-x-2">
                {category && (
                  <span 
                    className="text-xs px-2 py-1 rounded text-white"
                    style={{ backgroundColor: category.color }}
                    data-testid={`text-category-${transaction.id}`}
                  >
                    <i className={`${category.icon} mr-1`}></i>
                    {category.name}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded ${
                  transaction.isPending 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-green-100 text-green-700'
                }`} data-testid={`text-status-${transaction.id}`}>
                  {transaction.isPending ? 'Pending' : 'Categorized'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {transaction.isPending && onCategorize && (
        <div className="mt-3 pt-3 border-t flex space-x-2">
          <button 
            onClick={() => onCategorize(transaction.id, '')}
            disabled={isLoading}
            className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium touch-manipulation disabled:opacity-50"
            data-testid={`button-categorize-${transaction.id}`}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Categorizing...
              </>
            ) : (
              "Categorize"
            )}
          </button>
          {onEdit && (
            <button 
              onClick={() => onEdit(transaction.id)}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium touch-manipulation"
              data-testid={`button-edit-${transaction.id}`}
            >
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
