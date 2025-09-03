import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabase } from "./db";
import { 
  insertCategorySchema, 
  insertTransactionSchema, 
  insertSMSSettingsSchema,
  insertSupplierSchema 
} from "@shared/schema";
import { z } from "zod";
import fs from 'fs';
import path from 'path';

// Middleware to verify Supabase JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token verification failed' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        if (error.message.includes('User already registered')) {
          return res.status(409).json({ message: 'An account with this email already exists' });
        }
        return res.status(400).json({ message: error.message });
      }

      res.status(201).json({ 
        user: data.user, 
        session: data.session,
        message: data.user?.email_confirmed_at ? 'Account created successfully' : 'Account created. Please check your email to verify your account.'
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error during account creation' });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        // Return more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (error.message.includes('Email not confirmed')) {
          return res.status(400).json({ message: 'Please verify your email address before signing in' });
        }
        return res.status(400).json({ message: error.message });
      }

      if (!data.user || !data.session) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      res.json({ 
        user: data.user, 
        session: data.session,
        message: 'Successfully signed in'
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ message: 'Internal server error during sign in' });
    }
  });

  app.post('/api/auth/signout', async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ message: 'Signed out successfully' });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ message: 'Failed to sign out' });
    }
  });

  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let user = await storage.getUser(userId);
      
      // Create user if doesn't exist
      if (!user) {
        user = await storage.upsertUser({
          id: req.req.user.id,
          email: req.user.email,
          firstName: req.user.user_metadata?.first_name,
          lastName: req.user.user_metadata?.last_name,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard and stats
  app.get('/api/dashboard/stats', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const stats = await storage.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Categories routes
  app.get('/api/categories', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const categories = await storage.getUserCategories(req.user.id);
      
      // Create default categories if none exist
      if (categories.length === 0) {
        const defaultCategories = await storage.createDefaultCategories(req.user.id);
        return res.json(defaultCategories);
      }
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(req.user.id, categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:categoryId', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const { categoryId } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.user.id, categoryId, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:categoryId', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const { categoryId } = req.params;
      await storage.deleteCategory(req.user.id, categoryId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Transactions routes
  app.get('/api/transactions', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const { limit = '20', offset = '0' } = req.query;
      const transactions = await storage.getUserTransactions(req.user.id, parseInt(limit), parseInt(offset));
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/transactions/pending', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const transactions = await storage.getPendingTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  app.post('/api/transactions', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Auto-categorization happens in createTransaction method
      const transaction = await storage.createTransaction(req.user.id, transactionData);
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put('/api/transactions/:transactionId', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const { transactionId } = req.params;
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.user.id, transactionId, transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete('/api/transactions/:transactionId', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const { transactionId } = req.params;
      await storage.deleteTransaction(req.user.id, transactionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Quick categorization endpoint
  app.post('/api/transactions/:transactionId/categorize', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const { transactionId } = req.params;
      const { categoryId } = req.body;
      
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }
      
      const transaction = await storage.updateTransaction(req.user.id, transactionId, {
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
  app.get('/api/sms-settings', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      let settings = await storage.getUserSMSSettings(req.user.id);
      
      // Create default settings if none exist
      if (!settings) {
        settings = await storage.createSMSSettings(req.user.id, {
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

  app.put('/api/sms-settings', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const settingsData = insertSMSSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSMSSettings(req.user.id, settingsData);
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
  app.get('/api/suppliers', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const suppliers = await storage.getUserSuppliers(req.user.id);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post('/api/suppliers', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(req.user.id, supplierData);
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
  app.get('/api/transactions/range', authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const transactions = await storage.getTransactionsByDateRange(
        req.user.id,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions by date range:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Generate and download PDF reports
  app.get('/api/reports/download/pdf/:reportType', authenticateToken, async (req: any, res) => {
    try {
      const { reportType } = req.params;
      const userId = req.user.id;
      
      if (!['weekly', 'monthly'].includes(reportType)) {
        return res.status(400).json({ message: "Report type must be 'weekly' or 'monthly'" });
      }

      // Import reportGenerator dynamically to avoid import issues
      const { reportGenerator } = await import('../services/reportGenerator');
      
      let fileName: string;
      if (reportType === 'weekly') {
        fileName = await reportGenerator.generateWeeklyReport(userId);
      } else {
        fileName = await reportGenerator.generateMonthlyReport(userId);
      }
      
      const filePath = path.join(reportGenerator.getReportsDirectory(), fileName);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      // Clean up file after download
      fileStream.on('end', () => {
        setTimeout(() => {
          reportGenerator.deleteReport(fileName);
        }, 5000); // Delete after 5 seconds
      });
      
    } catch (error) {
      console.error("Error generating PDF report:", error);
      res.status(500).json({ message: "Failed to generate PDF report" });
    }
  });

  // Generate and download CSV reports
  app.get('/api/reports/download/csv/:reportType', authenticateToken, async (req: any, res) => {
    try {
      const { reportType } = req.params;
      const userId = req.user.id;
      
      if (!['weekly', 'monthly'].includes(reportType)) {
        return res.status(400).json({ message: "Report type must be 'weekly' or 'monthly'" });
      }

      // Import reportGenerator dynamically
      const { reportGenerator } = await import('../services/reportGenerator');
      
      let csvData: string;
      if (reportType === 'weekly') {
        csvData = await reportGenerator.generateWeeklyCSV(userId);
      } else {
        csvData = await reportGenerator.generateMonthlyCSV(userId);
      }
      
      const fileName = `yasinga_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      res.send(csvData);
      
    } catch (error) {
      console.error("Error generating CSV report:", error);
      res.status(500).json({ message: "Failed to generate CSV report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
