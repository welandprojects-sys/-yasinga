import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { 
  insertCategorySchema, 
  insertTransactionSchema, 
  insertSMSSettingsSchema,
  insertSupplierSchema 
} from "@shared/schema";
import { z } from "zod";

// Helper to get user ID from session
const getUserFromSession = (req: any) => {
  const claims = (req.user as any)?.claims;
  if (!claims?.email) {
    throw new Error('No user found in session');
  }
  return {
    id: claims.email, // Using email as user ID for Replit auth
    email: claims.email,
    firstName: claims.first_name,
    lastName: claims.last_name
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Note: Replit Auth handles signup/signin/signout via /api/login, /api/callback, /api/logout
  // These routes are set up in replitAuth.ts

  // Note: /api/auth/user is handled by replitAuth.ts

  // Dashboard and stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const stats = await storage.getDashboardStats(user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Categories routes
  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const categories = await storage.getUserCategories(user.id);
      
      // Create default categories if none exist
      if (categories.length === 0) {
        const defaultCategories = await storage.createDefaultCategories(user.id);
        return res.json(defaultCategories);
      }
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(user.id, categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:categoryId', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const { categoryId } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(user.id, categoryId, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:categoryId', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const { categoryId } = req.params;
      await storage.deleteCategory(user.id, categoryId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Transactions routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const { limit = '20', offset = '0' } = req.query;
      const transactions = await storage.getUserTransactions(user.id, parseInt(limit), parseInt(offset));
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/transactions/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const transactions = await storage.getPendingTransactions(user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Auto-categorization happens in createTransaction method
      const transaction = await storage.createTransaction(user.id, transactionData);
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put('/api/transactions/:transactionId', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const { transactionId } = req.params;
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(user.id, transactionId, transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete('/api/transactions/:transactionId', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const { transactionId } = req.params;
      await storage.deleteTransaction(user.id, transactionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Quick categorization endpoint
  app.post('/api/transactions/:transactionId/categorize', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const { transactionId } = req.params;
      const { categoryId } = req.body;
      
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }
      
      const transaction = await storage.updateTransaction(user.id, transactionId, {
        categoryId,
        isPending: false,
      });
      
      res.json(transaction);
    } catch (error) {
      console.error("Error categorizing transaction:", error);
      res.status(500).json({ message: "Failed to categorize transaction" });
    }
  });

  // SMS Settings routes
  app.get('/api/sms-settings', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      let settings = await storage.getUserSMSSettings(user.id);
      
      // Create default settings if none exist
      if (!settings) {
        settings = await storage.createSMSSettings(user.id, {
          isEnabled: true,
          autoDetectTransactions: true,
          smartSupplierRecognition: true,
          autoCategorizeRecurring: false,
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching SMS settings:", error);
      res.status(500).json({ message: "Failed to fetch SMS settings" });
    }
  });

  app.put('/api/sms-settings', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const settingsData = insertSMSSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSMSSettings(user.id, settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating SMS settings:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update SMS settings" });
    }
  });

  // Suppliers routes
  app.get('/api/suppliers', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const suppliers = await storage.getUserSuppliers(user.id);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post('/api/suppliers', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(user.id, supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  // Date range transactions for reports
  app.get('/api/transactions/range', isAuthenticated, async (req: any, res) => {
    try {
      const user = getUserFromSession(req);
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const transactions = await storage.getTransactionsByDateRange(
        user.id,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions by date range:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
