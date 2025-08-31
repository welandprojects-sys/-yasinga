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

  async upsertUser(userData: UpsertUser): Promise<User> {
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
      { name: "Restaurant Supplies", type: "business" as const, color: "#059669", icon: "fas fa-utensils", isDefault: true },
      { name: "Kitchen Equipment", type: "business" as const, color: "#0891b2", icon: "fas fa-blender", isDefault: true },
      { name: "Food Ingredients", type: "business" as const, color: "#16a34a", icon: "fas fa-apple-alt", isDefault: true },
      { name: "Staff Payments", type: "business" as const, color: "#ea580c", icon: "fas fa-users", isDefault: true },
      { name: "Utilities", type: "business" as const, color: "#dc2626", icon: "fas fa-bolt", isDefault: true },
      { name: "Personal Expenses", type: "personal" as const, color: "#7c3aed", icon: "fas fa-user", isDefault: true },
      { name: "Fuel", type: "personal" as const, color: "#be123c", icon: "fas fa-gas-pump", isDefault: true },
    ];

    const createdCategories = [];
    for (const category of defaultCategories) {
      const [created] = await db
        .insert(categories)
        .values({ ...category, userId })
        .returning();
      createdCategories.push(created);
    }
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

  async createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values({ ...transaction, userId })
      .returning();
    return newTransaction;
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
