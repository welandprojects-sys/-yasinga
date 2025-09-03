
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/ui/bottom-navigation";

interface Supplier {
  id: string;
  name: string;
  phoneNumber?: string;
  transactionCount: string;
  lastTransactionDate?: string;
  defaultCategoryId?: string;
}

export default function Suppliers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Check authentication status
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Auth is handled by the router, no need to redirect manually
      return;
    }
  }, [isAuthenticated, isLoading]);

  // Fetch suppliers
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    retry: false,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No transactions";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
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
              <h1 className="font-bold text-lg text-foreground">Suppliers</h1>
            </div>
            <button 
              className="p-2 hover:bg-muted rounded-lg touch-manipulation"
              data-testid="button-add-supplier"
            >
              <i className="fas fa-plus text-primary"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-md">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 text-center border">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-truck text-blue-500"></i>
            </div>
            <p className="text-sm text-muted-foreground">Active Suppliers</p>
            <p className="text-xl font-bold text-foreground">{suppliers.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-handshake text-green-500"></i>
            </div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-xl font-bold text-foreground">
              {suppliers.reduce((total, supplier) => total + parseInt(supplier.transactionCount || '0'), 0)}
            </p>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="bg-card rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-foreground">Your Suppliers</h3>
            <p className="text-sm text-muted-foreground">Manage your restaurant suppliers</p>
          </div>
          
          <div className="p-4">
            {suppliersLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading suppliers...
              </div>
            ) : suppliers.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-truck text-muted-foreground text-xl"></i>
                </div>
                <h4 className="font-medium text-foreground mb-2">No suppliers yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Start making transactions and we'll automatically detect your suppliers
                </p>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium touch-manipulation">
                  Add Supplier Manually
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-store text-blue-500"></i>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {supplier.phoneNumber || "No phone number"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {supplier.transactionCount} transactions
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last: {formatDate(supplier.lastTransactionDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Supplier Button */}
        {suppliers.length > 0 && (
          <button className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-medium touch-manipulation">
            <i className="fas fa-plus mr-2"></i>
            Add New Supplier
          </button>
        )}

      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
