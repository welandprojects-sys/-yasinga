import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import { db } from '../db';
import { transactions, categories, users } from '@shared/schema';
import { eq, gte, lte, and, sql } from 'drizzle-orm';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  otherParty: string;
  description?: string;
  transactionDate: string;
  categoryId?: string;
  category?: {
    name: string;
    type: 'business' | 'personal';
  };
}

interface ReportData {
  userId: string;
  userEmail: string;
  reportType: 'weekly' | 'monthly';
  dateRange: {
    from: string;
    to: string;
  };
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    totalSent: number;
    totalReceived: number;
    businessExpenses: number;
    personalExpenses: number;
    topCategories: Array<{
      name: string;
      amount: number;
      count: number;
    }>;
  };
}

export class ReportGenerator {
  private reportsDir = path.join(process.cwd(), 'reports');

  constructor() {
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateWeeklyReport(userId: string): Promise<string> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const reportData = await this.getReportData(userId, startDate, endDate, 'weekly');
    return this.createPDFReport(reportData);
  }

  async generateMonthlyReport(userId: string): Promise<string> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    startDate.setDate(1); // Start of the month

    const reportData = await this.getReportData(userId, startDate, endDate, 'monthly');
    return this.createPDFReport(reportData);
  }

  private async getReportData(
    userId: string, 
    startDate: Date, 
    endDate: Date, 
    reportType: 'weekly' | 'monthly'
  ): Promise<ReportData> {
    // Get user info
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    // Get transactions with categories
    const userTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        otherParty: transactions.otherParty,
        description: transactions.description,
        transactionDate: transactions.transactionDate,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryType: categories.type,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )
      .orderBy(transactions.transactionDate);

    // Process transactions
    const processedTransactions: Transaction[] = userTransactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      otherParty: tx.otherParty,
      description: tx.description,
      transactionDate: tx.transactionDate.toISOString(),
      categoryId: tx.categoryId,
      category: tx.categoryName ? {
        name: tx.categoryName,
        type: tx.categoryType as 'business' | 'personal'
      } : undefined
    }));

    // Calculate summary
    const summary = this.calculateSummary(processedTransactions);

    return {
      userId,
      userEmail: user[0]?.email || 'user@example.com',
      reportType,
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString()
      },
      transactions: processedTransactions,
      summary
    };
  }

  private calculateSummary(transactions: Transaction[]) {
    const summary = {
      totalTransactions: transactions.length,
      totalSent: 0,
      totalReceived: 0,
      businessExpenses: 0,
      personalExpenses: 0,
      topCategories: [] as Array<{ name: string; amount: number; count: number; }>
    };

    const categoryStats: Record<string, { amount: number; count: number; }> = {};

    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      
      if (tx.type === 'sent') {
        summary.totalSent += amount;
      } else {
        summary.totalReceived += amount;
      }

      if (tx.category) {
        if (tx.category.type === 'business') {
          summary.businessExpenses += amount;
        } else {
          summary.personalExpenses += amount;
        }

        // Track category stats
        const categoryName = tx.category.name;
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = { amount: 0, count: 0 };
        }
        categoryStats[categoryName].amount += amount;
        categoryStats[categoryName].count += 1;
      }
    });

    // Get top 5 categories
    summary.topCategories = Object.entries(categoryStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return summary;
  }

  private createPDFReport(reportData: ReportData): string {
    const doc = new jsPDF();
    const fileName = `yasinga_${reportData.reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    // Title
    doc.setFontSize(20);
    doc.text('Yasinga Expense Report', 20, 30);
    
    // Report info
    doc.setFontSize(12);
    const reportTitle = reportData.reportType === 'weekly' ? 'Weekly Report' : 'Monthly Report';
    doc.text(reportTitle, 20, 45);
    doc.text(`User: ${reportData.userEmail}`, 20, 55);
    doc.text(`Period: ${new Date(reportData.dateRange.from).toLocaleDateString()} - ${new Date(reportData.dateRange.to).toLocaleDateString()}`, 20, 65);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 75);

    // Summary section
    doc.setFontSize(14);
    doc.text('Summary', 20, 95);
    doc.setFontSize(10);
    
    const summary = reportData.summary;
    doc.text(`Total Transactions: ${summary.totalTransactions}`, 25, 105);
    doc.text(`Total Sent: KSh ${summary.totalSent.toLocaleString()}`, 25, 115);
    doc.text(`Total Received: KSh ${summary.totalReceived.toLocaleString()}`, 25, 125);
    doc.text(`Business Expenses: KSh ${summary.businessExpenses.toLocaleString()}`, 25, 135);
    doc.text(`Personal Expenses: KSh ${summary.personalExpenses.toLocaleString()}`, 25, 145);

    // Top categories
    if (summary.topCategories.length > 0) {
      doc.setFontSize(14);
      doc.text('Top Categories', 20, 165);
      doc.setFontSize(10);
      
      let yPos = 175;
      summary.topCategories.forEach((category, index) => {
        doc.text(`${index + 1}. ${category.name}: KSh ${category.amount.toLocaleString()} (${category.count} transactions)`, 25, yPos);
        yPos += 10;
      });
    }

    // Transactions list (limited to first 20 for space)
    if (reportData.transactions.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Recent Transactions', 20, 30);
      doc.setFontSize(8);
      
      let yPos = 40;
      const maxTransactions = Math.min(reportData.transactions.length, 25);
      
      for (let i = 0; i < maxTransactions; i++) {
        const tx = reportData.transactions[i];
        const date = new Date(tx.transactionDate).toLocaleDateString();
        const amount = parseFloat(tx.amount).toLocaleString();
        const type = tx.type === 'sent' ? 'Sent' : 'Received';
        const category = tx.category?.name || 'Uncategorized';
        
        doc.text(`${date} | ${type} | KSh ${amount} | ${tx.otherParty} | ${category}`, 20, yPos);
        yPos += 8;
        
        if (yPos > 280) { // Near bottom of page
          doc.addPage();
          yPos = 30;
        }
      }

      if (reportData.transactions.length > maxTransactions) {
        doc.text(`... and ${reportData.transactions.length - maxTransactions} more transactions`, 20, yPos + 10);
      }
    }

    // Save PDF
    doc.save(filePath);
    return fileName;
  }

  getReportsDirectory(): string {
    return this.reportsDir;
  }

  listReports(): string[] {
    try {
      return fs.readdirSync(this.reportsDir).filter(file => file.endsWith('.pdf'));
    } catch (error) {
      return [];
    }
  }

  deleteReport(fileName: string): boolean {
    try {
      const filePath = path.join(this.reportsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async generateWeeklyCSV(userId: string): Promise<string> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const reportData = await this.getReportData(userId, startDate, endDate, 'weekly');
    return this.createCSVReport(reportData);
  }

  async generateMonthlyCSV(userId: string): Promise<string> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    startDate.setDate(1); // Start of the month

    const reportData = await this.getReportData(userId, startDate, endDate, 'monthly');
    return this.createCSVReport(reportData);
  }

  private createCSVReport(reportData: ReportData): string {
    const { summary, transactions, reportType, dateRange, userEmail } = reportData;
    
    let csvContent = '';
    
    // Header information
    csvContent += `Yasinga ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Expense Report\n`;
    csvContent += `User,${userEmail}\n`;
    csvContent += `Period,${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}\n`;
    csvContent += `Generated,${new Date().toLocaleString()}\n`;
    csvContent += '\n';
    
    // Summary section
    csvContent += 'SUMMARY\n';
    csvContent += `Total Transactions,${summary.totalTransactions}\n`;
    csvContent += `Total Sent,KSh ${summary.totalSent.toLocaleString()}\n`;
    csvContent += `Total Received,KSh ${summary.totalReceived.toLocaleString()}\n`;
    csvContent += `Business Expenses,KSh ${summary.businessExpenses.toLocaleString()}\n`;
    csvContent += `Personal Expenses,KSh ${summary.personalExpenses.toLocaleString()}\n`;
    csvContent += '\n';
    
    // Top categories
    if (summary.topCategories.length > 0) {
      csvContent += 'TOP CATEGORIES\n';
      csvContent += 'Rank,Category,Amount,Transactions\n';
      summary.topCategories.forEach((category, index) => {
        csvContent += `${index + 1},${category.name},KSh ${category.amount.toLocaleString()},${category.count}\n`;
      });
      csvContent += '\n';
    }
    
    // Transactions
    csvContent += 'TRANSACTIONS\n';
    csvContent += 'Date,Type,Amount,Other Party,Category,Description\n';
    
    transactions.forEach(tx => {
      const date = new Date(tx.transactionDate).toLocaleDateString();
      const amount = `KSh ${parseFloat(tx.amount).toLocaleString()}`;
      const type = tx.type === 'sent' ? 'Sent' : 'Received';
      const category = tx.category?.name || 'Uncategorized';
      const description = tx.description || '';
      const otherParty = tx.otherParty.replace(/,/g, ';'); // Replace commas to avoid CSV issues
      const descriptionClean = description.replace(/,/g, ';'); // Replace commas to avoid CSV issues
      
      csvContent += `${date},${type},${amount},${otherParty},${category},${descriptionClean}\n`;
    });
    
    return csvContent;
  }
}

export const reportGenerator = new ReportGenerator();