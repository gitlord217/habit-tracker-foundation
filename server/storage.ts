import { 
  User, InsertUser, 
  Habit, InsertHabit, 
  HabitCompletion, InsertHabitCompletion,
  UserSettings, InsertUserSettings,
  users, habits, habitCompletions, userSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, between, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Habit methods
  getHabitsByUserId(userId: number): Promise<Habit[]>;
  getHabitById(id: number, userId: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, userId: number, habit: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: number, userId: number): Promise<boolean>;
  updateHabitStreak(id: number, userId: number, currentStreak: number, longestStreak: number): Promise<void>;
  
  // Habit completion methods
  getHabitCompletions(habitId: number, startDate: Date, endDate: Date): Promise<HabitCompletion[]>;
  getHabitCompletionsByDate(userId: number, date: Date): Promise<{habit: Habit, completion?: HabitCompletion}[]>;
  createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  updateHabitCompletion(habitId: number, date: Date, completed: boolean): Promise<HabitCompletion | undefined>;
  
  // User settings methods
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings | undefined>;
  
  // Analytics methods
  getCompletionRate(userId: number, startDate: Date, endDate: Date): Promise<{habitId: number, completionRate: number}[]>;
  getWeeklyCompletionTrend(userId: number, startDate: Date, endDate: Date): Promise<{date: string, completionRate: number}[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Habit methods
  async getHabitsByUserId(userId: number): Promise<Habit[]> {
    return db.select().from(habits).where(eq(habits.userId, userId)).orderBy(desc(habits.createdAt));
  }

  async getHabitById(id: number, userId: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));
    return habit;
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [createdHabit] = await db.insert(habits).values(habit).returning();
    return createdHabit;
  }

  async updateHabit(id: number, userId: number, habitData: Partial<Habit>): Promise<Habit | undefined> {
    const [updatedHabit] = await db.update(habits)
      .set(habitData)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return updatedHabit;
  }

  async deleteHabit(id: number, userId: number): Promise<boolean> {
    // First, check if the habit exists and belongs to the user
    const [habit] = await db.select().from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));
      
    if (!habit) {
      return false;
    }
    
    // Delete associated habit completions first (cascading delete)
    await db.delete(habitCompletions)
      .where(eq(habitCompletions.habitId, id));
      
    // Then delete the habit itself
    const result = await db.delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
      
    return result.length > 0;
  }

  async updateHabitStreak(id: number, userId: number, currentStreak: number, longestStreak: number): Promise<void> {
    await db.update(habits)
      .set({ currentStreak, longestStreak })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));
  }

  // Habit completion methods
  async getHabitCompletions(habitId: number, startDate: Date, endDate: Date): Promise<HabitCompletion[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return db.select().from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          gte(habitCompletions.date, startDateStr),
          lte(habitCompletions.date, endDateStr)
        )
      );
  }

  async getHabitCompletionsByDate(userId: number, date: Date): Promise<{habit: Habit, completion?: HabitCompletion}[]> {
    const dateStr = date.toISOString().split('T')[0];
    
    const userHabits = await db.select().from(habits)
      .where(eq(habits.userId, userId));
    
    const results = [];
    
    for (const habit of userHabits) {
      const [completion] = await db.select().from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, habit.id),
            eq(habitCompletions.date, dateStr)
          )
        );
      
      results.push({ habit, completion });
    }
    
    return results;
  }

  async createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    const [created] = await db.insert(habitCompletions).values(completion).returning();
    return created;
  }

  async updateHabitCompletion(habitId: number, date: Date, completed: boolean): Promise<HabitCompletion | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if a completion exists for this date
    const [existing] = await db.select().from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          eq(habitCompletions.date, dateStr)
        )
      );
    
    if (existing) {
      // Update existing completion
      const [updated] = await db.update(habitCompletions)
        .set({ completed, completedAt: new Date() })
        .where(eq(habitCompletions.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new completion
      const [created] = await db.insert(habitCompletions)
        .values({
          habitId,
          date: dateStr,
          completed,
          completedAt: new Date()
        })
        .returning();
      return created;
    }
  }

  // User settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings)
      .where(eq(userSettings.userId, userId));
    
    if (!settings) {
      // Create default settings if none exist
      return this.createUserSettings({
        userId,
        darkMode: false,
        timeRange: 'month',
        showQuotes: true
      });
    }
    
    return settings;
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [created] = await db.insert(userSettings).values(settings).returning();
    return created;
  }

  async updateUserSettings(userId: number, settingsData: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const [updated] = await db.update(userSettings)
      .set(settingsData)
      .where(eq(userSettings.userId, userId))
      .returning();
    return updated;
  }

  // Analytics methods
  async getCompletionRate(userId: number, startDate: Date, endDate: Date): Promise<{habitId: number, completionRate: number}[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const userHabits = await db.select().from(habits)
      .where(eq(habits.userId, userId));
    
    const results = [];
    
    for (const habit of userHabits) {
      const completions = await db.select().from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, habit.id),
            gte(habitCompletions.date, startDateStr),
            lte(habitCompletions.date, endDateStr)
          )
        );
      
      const completedDays = completions.filter(c => c.completed).length;
      const totalDays = this.calculateTotalHabitDays(habit, startDate, endDate);
      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
      
      results.push({
        habitId: habit.id,
        completionRate: Math.round(completionRate)
      });
    }
    
    return results;
  }

  async getWeeklyCompletionTrend(userId: number, startDate: Date, endDate: Date): Promise<{date: string, completionRate: number}[]> {
    const formattedDates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Get all habit completions for this user on this date
      const userHabits = await db.select().from(habits)
        .where(eq(habits.userId, userId));
      
      let completedCount = 0;
      let totalCount = 0;
      
      for (const habit of userHabits) {
        const targetDays = habit.targetDays as number[];
        const weekday = currentDate.getDay();
        
        // Only check habits that are targeted for this day of the week
        if (targetDays.includes(weekday)) {
          totalCount++;
          
          const [completion] = await db.select().from(habitCompletions)
            .where(
              and(
                eq(habitCompletions.habitId, habit.id),
                eq(habitCompletions.date, dateStr)
              )
            );
          
          if (completion && completion.completed) {
            completedCount++;
          }
        }
      }
      
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      
      formattedDates.push({
        date: dateStr,
        completionRate: Math.round(completionRate)
      });
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return formattedDates;
  }

  // Helper method to calculate total habit days based on target days
  private calculateTotalHabitDays(habit: Habit, startDate: Date, endDate: Date): number {
    const targetDays = habit.targetDays as number[];
    let count = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      if (targetDays.includes(currentDate.getDay())) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  }
}

export const storage = new DatabaseStorage();
