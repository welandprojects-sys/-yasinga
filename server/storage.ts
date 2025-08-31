import {
  users,
  categories,
  transactions,
  smsSettings,
  suppliers,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type SMSSettings,
  type InsertSMSSettings,
  type Supplier,
  type InsertSupplier,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getUserCategories(userId: string): Promise<Category[]>;
  createCategory(userId: string, category: InsertCategory): Promise<Category>;
  updateCategory(userId: string, categoryId: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(userId: string, categoryId: string): Promise<void>;
  createDefaultCategories(userId: string): Promise<Category[]>;

  // Transaction operations
  getUserTransactions(userId: string, limit?: number, offset?: number): Promise<Transaction[]>;
  getPendingTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(userId: string, transactionId: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(userId: string, transactionId: string): Promise<void>;
  getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;

  // SMS Settings operations
  getUserSMSSettings(userId: string): Promise<SMSSettings | undefined>;
  createSMSSettings(userId: string, settings: InsertSMSSettings): Promise<SMSSettings>;
  updateSMSSettings(userId: string, settings: Partial<InsertSMSSettings>): Promise<SMSSettings>;

  // Supplier operations
  getUserSuppliers(userId: string): Promise<Supplier[]>;
  createSupplier(userId: string, supplier: InsertSupplier): Promise<Supplier>;
  findSupplierByName(userId: string, name: string): Promise<Supplier | undefined>;
  updateSupplier(userId: string, supplierId: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;

  // Analytics operations
  getDashboardStats(userId: string): Promise<{
    todayBusiness: string;
    todayPersonal: string;
    pendingCount: number;
    totalTransactions: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser & { id?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getUserCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.name);
  }

  async createCategory(userId: string, category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values({ ...category, userId })
      .returning();
    return newCategory;
  }

  async updateCategory(userId: string, categoryId: string, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
  }

  async createDefaultCategories(userId: string): Promise<Category[]> {
    const defaultCategories = [
      // Business categories - Restaurant specific
      { name: 'Supplier Payments', type: 'business' as const, color: '#059669', icon: 'fas fa-truck' },
      { name: 'Food & Beverage Stock', type: 'business' as const, color: '#16a34a', icon: 'fas fa-utensils' },
      { name: 'Equipment & Maintenance', type: 'business' as const, color: '#dc2626', icon: 'fas fa-tools' },
      { name: 'Operating Expenses', type: 'business' as const, color: '#ea580c', icon: 'fas fa-receipt' },
      { name: 'Staff Payments', type: 'business' as const, color: '#7c2d12', icon: 'fas fa-users' },
      { name: 'Utilities & Rent', type: 'business' as const, color: '#1e40af', icon: 'fas fa-home' },
      { name: 'Marketing & Advertising', type: 'business' as const, color: '#7c3aed', icon: 'fas fa-megaphone' },
      { name: 'Licenses & Permits', type: 'business' as const, color: '#374151', icon: 'fas fa-certificate' },
      { name: 'Business Income', type: 'business' as const, color: '#059669', icon: 'fas fa-money-bill-wave' },

      // Personal categories
      { name: 'Personal Food & Dining', type: 'personal' as const, color: '#65a30d', icon: 'fas fa-hamburger' },
      { name: 'Personal Transportation', type: 'personal' as const, color: '#ca8a04', icon: 'fas fa-car' },
      { name: 'Healthcare & Medical', type: 'personal' as const, color: '#dc2626', icon: 'fas fa-heartbeat' },
      { name: 'Shopping & Groceries', type: 'personal' as const, color: '#0891b2', icon: 'fas fa-shopping-cart' },
      { name: 'Entertainment & Leisure', type: 'personal' as const, color: '#7c3aed', icon: 'fas fa-gamepad' },
      { name: 'Personal Miscellaneous', type: 'personal' as const, color: '#6b7280', icon: 'fas fa-user' },
    ];

    const createdCategories = await db
      .insert(categories)
      .values(
        defaultCategories.map(cat => ({
          ...cat,
          userId,
          isDefault: true,
        }))
      )
      .returning();

    return createdCategories;
  }

  // Transaction operations
  async getUserTransactions(userId: string, limit = 20, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset);
  }

  async getPendingTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.isPending, true)))
      .orderBy(desc(transactions.transactionDate));
  }

  async createTransaction(userId: string, transactionData: any) {
    // Auto-categorize the transaction if no category is provided
    let categoryId = transactionData.categoryId;

    if (!categoryId) {
      categoryId = await this.autoCategorizeTrransaction(userId, transactionData);
    }

    const [transaction] = await db
      .insert(transactions)
      .values({
        ...transactionData,
        userId,
        categoryId,
        isPending: false, // Auto-categorized transactions are not pending
      })
      .returning();
    return transaction;
  }

  private async autoCategorizeTrransaction(userId: string, transactionData: any): Promise<string | null> {
    try {
      // Get user categories
      const userCategories = await this.getUserCategories(userId);
      const businessCategories = userCategories.filter(cat => cat.type === 'business');
      const personalCategories = userCategories.filter(cat => cat.type === 'personal');

      // Create default categories if none exist
      if (userCategories.length === 0) {
        await this.createDefaultCategories(userId);
        const newCategories = await this.getUserCategories(userId);
        return this.categorizeBySmartAnalysis(transactionData, newCategories);
      }

      // Smart categorization based on transaction details
      return this.categorizeBySmartAnalysis(transactionData, userCategories);
    } catch (error) {
      console.error('Error auto-categorizing transaction:', error);
      return null;
    }
  }

  private async categorizeBySmartAnalysis(transactionData: any, categories: any[]): Promise<string | null> {
    const { otherParty, description, amount, type } = transactionData;
    const otherPartyLower = otherParty?.toLowerCase() || '';
    const descriptionLower = description?.toLowerCase() || '';
    const transactionAmount = parseFloat(amount);

    // Business categories
    const businessCategories = categories.filter(cat => cat.type === 'business');
    const personalCategories = categories.filter(cat => cat.type === 'personal');

    // Only categorize 'sent' transactions as expenses
    if (type !== 'sent') {
      // For received transactions, try to categorize as business income
      const incomeCategory = businessCategories.find(cat => 
        cat.name.toLowerCase().includes('income') || 
        cat.name.toLowerCase().includes('sales') ||
        cat.name.toLowerCase().includes('revenue')
      );
      return incomeCategory?.id || businessCategories[0]?.id || null;
    }

    // Keywords for business expenses (restaurant context)
    const businessKeywords = {
      suppliers: ['supplier', 'stock', 'inventory', 'wholesale', 'distributor', 'vendor'],
      utilities: ['electricity', 'power', 'kplc', 'water', 'utilities', 'rent'],
      equipment: ['equipment', 'maintenance', 'repair', 'machine', 'appliance'],
      marketing: ['marketing', 'advertising', 'promotion', 'social media'],
      staff: ['salary', 'wage', 'staff', 'employee', 'payroll'],
      transport: ['delivery', 'transport', 'fuel', 'vehicle', 'logistics'],
      licenses: ['license', 'permit', 'registration', 'government', 'tax']
    };

    // Keywords for personal expenses
    const personalKeywords = {
      food: ['food', 'lunch', 'dinner', 'restaurant', 'cafe', 'meal'],
      transport: ['matatu', 'uber', 'taxi', 'bus', 'travel'],
      shopping: ['shopping', 'clothes', 'personal', 'grocery', 'supermarket'],
      healthcare: ['hospital', 'clinic', 'medical', 'pharmacy', 'doctor'],
      entertainment: ['entertainment', 'movie', 'fun', 'leisure', 'sport']
    };

    // Check for business patterns first (for restaurant context)
    for (const [categoryType, keywords] of Object.entries(businessKeywords)) {
      if (keywords.some(keyword => 
        otherPartyLower.includes(keyword) || descriptionLower.includes(keyword)
      )) {
        // Find matching business category
        const matchingCategory = businessCategories.find(cat => {
          const catName = cat.name.toLowerCase();
          if (categoryType === 'suppliers') return catName.includes('supplier') || catName.includes('stock') || catName.includes('inventory');
          if (categoryType === 'utilities') return catName.includes('operating') || catName.includes('utilities') || catName.includes('expense');
          if (categoryType === 'equipment') return catName.includes('equipment') || catName.includes('maintenance');
          if (categoryType === 'marketing') return catName.includes('marketing');
          if (categoryType === 'staff') return catName.includes('staff') || catName.includes('payroll');
          if (categoryType === 'transport') return catName.includes('transport') || catName.includes('delivery');
          if (categoryType === 'licenses') return catName.includes('license') || catName.includes('regulatory');
          return false;
        });

        if (matchingCategory) return matchingCategory.id;
      }
    }

    // Check for personal patterns
    for (const [categoryType, keywords] of Object.entries(personalKeywords)) {
      if (keywords.some(keyword => 
        otherPartyLower.includes(keyword) || descriptionLower.includes(keyword)
      )) {
        const matchingCategory = personalCategories.find(cat => {
          const catName = cat.name.toLowerCase();
          if (categoryType === 'food') return catName.includes('food') || catName.includes('dining');
          if (categoryType === 'transport') return catName.includes('transport');
          if (categoryType === 'shopping') return catName.includes('shopping') || catName.includes('groceries');
          if (categoryType === 'healthcare') return catName.includes('health') || catName.includes('medical');
          if (categoryType === 'entertainment') return catName.includes('entertainment');
          return false;
        });

        if (matchingCategory) return matchingCategory.id;
      }
    }

    // Amount-based heuristics for restaurant business
    if (transactionAmount >= 5000) {
      // Large amounts likely business expenses
      const supplierCategory = businessCategories.find(cat => 
        cat.name.toLowerCase().includes('supplier') || 
        cat.name.toLowerCase().includes('stock')
      );
      if (supplierCategory) return supplierCategory.id;
    } else if (transactionAmount <= 500) {
      // Small amounts likely personal
      const personalExpenseCategory = personalCategories.find(cat => 
        cat.name.toLowerCase().includes('personal') ||
        cat.name.toLowerCase().includes('miscellaneous')
      );
      if (personalExpenseCategory) return personalExpenseCategory.id;
    }

    // Default fallback: assign to general business category for medium amounts
    const defaultBusinessCategory = businessCategories.find(cat => 
      cat.name.toLowerCase().includes('general') || 
      cat.name.toLowerCase().includes('operating') ||
      cat.name.toLowerCase().includes('expense')
    );

    if (defaultBusinessCategory) return defaultBusinessCategory.id;

    // Final fallback
    return businessCategories[0]?.id || personalCategories[0]?.id || null;
  }

  async updateTransaction(userId: string, transactionId: string, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));
  }

  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )
      .orderBy(desc(transactions.transactionDate));
  }

  // SMS Settings operations
  async getUserSMSSettings(userId: string): Promise<SMSSettings | undefined> {
    const [settings] = await db
      .select()
      .from(smsSettings)
      .where(eq(smsSettings.userId, userId));
    return settings;
  }

  async createSMSSettings(userId: string, settings: InsertSMSSettings): Promise<SMSSettings> {
    const [newSettings] = await db
      .insert(smsSettings)
      .values({ ...settings, userId })
      .returning();
    return newSettings;
  }

  async updateSMSSettings(userId: string, settings: Partial<InsertSMSSettings>): Promise<SMSSettings> {
    const [updatedSettings] = await db
      .update(smsSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(smsSettings.userId, userId))
      .returning();
    return updatedSettings;
  }

  // Supplier operations
  async getUserSuppliers(userId: string): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, userId))
      .orderBy(desc(suppliers.lastTransactionDate));
  }

  async createSupplier(userId: string, supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db
      .insert(suppliers)
      .values({ ...supplier, userId })
      .returning();
    return newSupplier;
  }

  async findSupplierByName(userId: string, name: string): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.userId, userId), ilike(suppliers.name, `%${name}%`)));
    return supplier;
  }

  async updateSupplier(userId: string, supplierId: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set(supplier)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)))
      .returning();
    return updatedSupplier;
  }

  // Analytics operations
  async getDashboardStats(userId: string): Promise<{
    todayBusiness: string;
    todayPersonal: string;
    pendingCount: number;
    totalTransactions: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's business transactions
    const todayBusinessResult = await db
      .select({ sum: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(categories.type, 'business'),
          gte(transactions.transactionDate, today),
          lte(transactions.transactionDate, tomorrow),
          eq(transactions.isPending, false)
        )
      );

    // Get today's personal transactions
    const todayPersonalResult = await db
      .select({ sum: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(categories.type, 'personal'),
          gte(transactions.transactionDate, today),
          lte(transactions.transactionDate, tomorrow),
          eq(transactions.isPending, false)
        )
      );

    // Get pending count
    const pendingResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.isPending, true)));

    // Get total transactions
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    return {
      todayBusiness: todayBusinessResult[0]?.sum || '0',
      todayPersonal: todayPersonalResult[0]?.sum || '0',
      pendingCount: pendingResult[0]?.count || 0,
      totalTransactions: totalResult[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();