import * as cron from 'node-cron';
import { reportGenerator } from './reportGenerator';
import { db } from '../db';
import { users } from '@shared/schema';

interface BackupSettings {
  weeklyBackup: boolean;
  monthlyBackup: boolean;
  lastWeeklyBackup?: Date;
  lastMonthlyBackup?: Date;
}

class BackupScheduler {
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;

    console.log('🕒 Initializing backup scheduler...');
    
    // Schedule weekly backups - Every Sunday at 9:00 AM
    cron.schedule('0 9 * * 0', async () => {
      console.log('📅 Running weekly backup job...');
      await this.runWeeklyBackup();
    });

    // Schedule monthly backups - 1st of every month at 10:00 AM
    cron.schedule('0 10 1 * *', async () => {
      console.log('📅 Running monthly backup job...');
      await this.runMonthlyBackup();
    });

    this.isInitialized = true;
    console.log('✅ Backup scheduler initialized successfully');
  }

  private async runWeeklyBackup() {
    try {
      const activeUsers = await db.select({ id: users.id, email: users.email }).from(users);
      
      console.log(`📊 Generating weekly reports for ${activeUsers.length} users`);

      for (const user of activeUsers) {
        try {
          const fileName = await reportGenerator.generateWeeklyReport(user.id);
          console.log(`✅ Weekly report generated for ${user.email}: ${fileName}`);
        } catch (error) {
          console.error(`❌ Failed to generate weekly report for ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Weekly backup job failed:', error);
    }
  }

  private async runMonthlyBackup() {
    try {
      const activeUsers = await db.select({ id: users.id, email: users.email }).from(users);
      
      console.log(`📊 Generating monthly reports for ${activeUsers.length} users`);

      for (const user of activeUsers) {
        try {
          const fileName = await reportGenerator.generateMonthlyReport(user.id);
          console.log(`✅ Monthly report generated for ${user.email}: ${fileName}`);
        } catch (error) {
          console.error(`❌ Failed to generate monthly report for ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Monthly backup job failed:', error);
    }
  }

  // Manual backup triggers for testing
  async generateWeeklyBackupNow(userId: string): Promise<string> {
    console.log(`🔧 Manual weekly backup for user: ${userId}`);
    return await reportGenerator.generateWeeklyReport(userId);
  }

  async generateMonthlyBackupNow(userId: string): Promise<string> {
    console.log(`🔧 Manual monthly backup for user: ${userId}`);
    return await reportGenerator.generateMonthlyReport(userId);
  }

  // Get backup status
  getBackupStatus() {
    return {
      isSchedulerRunning: this.isInitialized,
      nextWeeklyBackup: 'Every Sunday at 9:00 AM',
      nextMonthlyBackup: '1st of every month at 10:00 AM',
      reportsGenerated: reportGenerator.listReports().length
    };
  }
}

export const backupScheduler = new BackupScheduler();