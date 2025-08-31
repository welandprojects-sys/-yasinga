import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - for Supabase Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Supabase UUID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  businessPhoneNumber: varchar("business_phone_number"),
  personalPhoneNumber: varchar("personal_phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transaction types
export const transactionTypeEnum = pgEnum('transaction_type', ['sent', 'received']);
export const categoryTypeEnum = pgEnum('category_type', ['business', 'personal']);

// Categories for expense classification
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  type: categoryTypeEnum("type").notNull().default('business'),
  color: varchar("color").default('#059669'),
  icon: varchar("icon").default('fas fa-store'),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// M-Pesa transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").references(() => categories.id),
  transactionCode: varchar("transaction_code").unique(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  otherParty: varchar("other_party").notNull(),
  otherPartyPhone: varchar("other_party_phone"),
  description: text("description"),
  mpesaBalance: decimal("mpesa_balance", { precision: 12, scale: 2 }),
  transactionCost: decimal("transaction_cost", { precision: 12, scale: 2 }),
  isFromSMS: boolean("is_from_sms").default(true),
  smsContent: text("sms_content"),
  sourcePhoneNumber: varchar("source_phone_number"), // Track which SIM card/phone number the transaction came from
  isPending: boolean("is_pending").default(true),
  transactionDate: timestamp("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// SMS monitoring settings
export const smsSettings = pgTable("sms_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  isEnabled: boolean("is_enabled").default(true),
  autoDetectTransactions: boolean("auto_detect_transactions").default(true),
  smartSupplierRecognition: boolean("smart_supplier_recognition").default(true),
  autoCategorizeRecurring: boolean("auto_categorize_recurring").default(false),
  customKeywords: text("custom_keywords"),
  monitorAllSimCards: boolean("monitor_all_sim_cards").default(true), // Monitor SMS from all available SIM cards
  lastSyncDate: timestamp("last_sync_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supplier recognition for smart categorization
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  phoneNumber: varchar("phone_number"),
  defaultCategoryId: varchar("default_category_id").references(() => categories.id),
  transactionCount: decimal("transaction_count", { precision: 10, scale: 0 }).default('0'),
  lastTransactionDate: timestamp("last_transaction_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports for validation
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  businessPhoneNumber: true,
  personalPhoneNumber: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertSMSSettingsSchema = createInsertSchema(smsSettings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Type exports
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertSMSSettings = z.infer<typeof insertSMSSettingsSchema>;
export type SMSSettings = typeof smsSettings.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;