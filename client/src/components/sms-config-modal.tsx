import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface SMSSettings {
  id: string;
  isEnabled: boolean;
  autoDetectTransactions: boolean;
  smartSupplierRecognition: boolean;
  autoCategorizeRecurring: boolean;
  customKeywords?: string;
}

interface SMSConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SMSConfigModal({ isOpen, onClose }: SMSConfigModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customKeywords, setCustomKeywords] = useState("");

  // Fetch current SMS settings
  const { data: settings, isLoading } = useQuery<SMSSettings>({
    queryKey: ["/api/sms-settings"],
    enabled: isOpen,
    retry: false,
  });

  // Update SMS settings mutation
  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<SMSSettings>) => {
      await apiRequest("PUT", "/api/sms-settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-settings"] });
      toast({
        title: "Settings updated",
        description: "SMS detection settings have been saved successfully.",
      });
      onClose();
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
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      isEnabled: true,
      autoDetectTransactions: settings?.autoDetectTransactions ?? true,
      smartSupplierRecognition: settings?.smartSupplierRecognition ?? true,
      autoCategorizeRecurring: settings?.autoCategorizeRecurring ?? false,
      customKeywords: customKeywords.trim() || undefined,
    });
  };

  const handleToggle = (field: keyof SMSSettings, value: boolean) => {
    updateMutation.mutate({
      ...settings,
      [field]: value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">SMS Detection Setup</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg touch-manipulation" 
              data-testid="button-close-modal"
            >
              <i className="fas fa-times text-muted-foreground"></i>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Permission Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="fas fa-exclamation-triangle text-amber-600 mt-1"></i>
                <div>
                  <h3 className="font-medium text-amber-800">SMS Permission Required</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Allow Yasinga to read SMS messages to automatically detect M-Pesa transactions from all your SIM cards
                  </p>
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    ✓ Works with any SIM card - switch freely between different networks
                  </p>
                </div>
              </div>
            </div>
            
            {/* Multi-SIM Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="fas fa-sim-card text-blue-600 mt-1"></i>
                <div>
                  <h3 className="font-medium text-blue-800">Multi-SIM Support</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Yasinga automatically detects M-Pesa SMS from all active SIM cards. Switch between SIM cards freely - we'll track everything.
                  </p>
                </div>
              </div>
            </div>

            {/* Detection Settings */}
            {isLoading ? (
              <div className="text-center py-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading settings...</p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-3">Detection Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary" 
                      checked={settings?.autoDetectTransactions ?? true}
                      onChange={(e) => handleToggle('autoDetectTransactions', e.target.checked)}
                      data-testid="checkbox-auto-detect"
                    />
                    <span className="text-sm">Auto-detect M-Pesa transactions from all SIM cards</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary" 
                      checked={settings?.smartSupplierRecognition ?? true}
                      onChange={(e) => handleToggle('smartSupplierRecognition', e.target.checked)}
                      data-testid="checkbox-supplier-recognition"
                    />
                    <span className="text-sm">Smart supplier recognition across accounts</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary" 
                      checked={settings?.autoCategorizeRecurring ?? false}
                      onChange={(e) => handleToggle('autoCategorizeRecurring', e.target.checked)}
                      data-testid="checkbox-auto-categorize"
                    />
                    <span className="text-sm">Auto-categorize recurring transactions</span>
                  </label>
                </div>
              </div>
            )}
            
            {/* Custom Keywords */}
            <div>
              <label className="block text-sm font-medium mb-2">SMS Keywords (Optional)</label>
              <textarea 
                className="w-full p-3 border rounded-lg text-sm" 
                rows={3}
                placeholder="Add custom keywords to improve detection (e.g., restaurant, supplies, ingredients)"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                data-testid="textarea-keywords"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg touch-manipulation disabled:opacity-50"
                data-testid="button-enable-detection"
              >
                {updateMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  "Enable Detection"
                )}
              </button>
              <button 
                onClick={onClose}
                className="flex-1 border border-border font-medium py-3 px-4 rounded-lg touch-manipulation"
                data-testid="button-cancel-setup"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
