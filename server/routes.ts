import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertHabitSchema, insertHabitCompletionSchema } from "@shared/schema";
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, parseISO, addDays } from "date-fns";
import { getHabitTimeframe } from "@shared/utils";
import { 
  initializeEmailService, 
  sendEmail, 
  sendStreakMilestone, 
  sendWeeklySummary 
} from "./email-service";

// Middleware to check if user is authenticated
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);
  
  // User profile endpoints
  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const { username, email, bio, profileImage } = req.body;
      const userId = req.user!.id;
      
      // Validate input
      if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
      }
      
      // Check if email is already taken by another user
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email already in use by another account" });
      }
      
      // Update user in database
      const updatedUser = await storage.updateUser(userId, { 
        username, 
        email,
        bio,
        profileImage
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // User profile image upload endpoint
  app.post("/api/user/profile-image", isAuthenticated, async (req, res) => {
    try {
      const { imageData } = req.body;
      const userId = req.user!.id;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Store the image data as a base64 string
      const updatedUser = await storage.updateUser(userId, { 
        profileImage: imageData 
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  });

  // Habits routes
  app.get("/api/habits", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const habits = await storage.getHabitsByUserId(userId);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits", error: (error as Error).message });
    }
  });

  app.get("/api/habits/:id", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const habit = await storage.getHabitById(habitId, userId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(habit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit", error: (error as Error).message });
    }
  });

  app.post("/api/habits", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const habitData = { ...req.body, userId };
      
      // Validate habit data
      const validatedData = insertHabitSchema.parse(habitData);
      
      const habit = await storage.createHabit(validatedData);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create habit", error: (error as Error).message });
    }
  });

  app.put("/api/habits/:id", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if habit exists and belongs to user
      const existingHabit = await storage.getHabitById(habitId, userId);
      
      if (!existingHabit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      const updatedHabit = await storage.updateHabit(habitId, userId, req.body);
      res.json(updatedHabit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update habit", error: (error as Error).message });
    }
  });

  app.delete("/api/habits/:id", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const deleted = await storage.deleteHabit(habitId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit", error: (error as Error).message });
    }
  });

  // Habit completions routes
  app.get("/api/habits/:id/completions", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if habit exists and belongs to user
      const habit = await storage.getHabitById(habitId, userId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Parse date range from query params
      const startDateParam = req.query.startDate as string || format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const endDateParam = req.query.endDate as string || format(new Date(), 'yyyy-MM-dd');
      
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);
      
      const completions = await storage.getHabitCompletions(habitId, startDate, endDate);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit completions", error: (error as Error).message });
    }
  });

  app.get("/api/completions/today", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCompletions = await storage.getHabitCompletionsByDate(userId, today);
      res.json(todayCompletions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's completions", error: (error as Error).message });
    }
  });

  app.post("/api/habits/:id/completions", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if habit exists and belongs to user
      const habit = await storage.getHabitById(habitId, userId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Extract date from request body or use today's date
      const completionDate = req.body.date ? new Date(req.body.date) : new Date();
      completionDate.setHours(0, 0, 0, 0);
      
      const completed = req.body.completed !== undefined ? req.body.completed : true;
      
      console.log(`Toggling completion for habit ${habitId} (${habit.name}) on ${format(completionDate, 'yyyy-MM-dd')} to ${completed}`);
      
      // Update or create habit completion
      const completion = await storage.updateHabitCompletion(habitId, completionDate, completed);
      
      console.log(`Completion recorded: ${JSON.stringify(completion)}`);
      
      // Update streak information
      await updateStreaks(habitId, userId);
      
      res.status(201).json(completion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid completion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to complete habit", error: (error as Error).message });
    }
  });

  // User settings routes
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings", error: (error as Error).message });
    }
  });

  app.put("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const settings = await storage.updateUserSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings", error: (error as Error).message });
    }
  });

  // Analytics routes
  app.get("/api/analytics/completion-rate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Determine date range based on timeRange parameter
      const timeRange = (req.query.timeRange as string) || 'month';
      const currentDate = new Date();
      let startDate, endDate;
      
      switch (timeRange) {
        case 'week':
          startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
          endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
          break;
        case 'month':
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
          break;
        case 'year':
          startDate = startOfYear(currentDate);
          endDate = endOfYear(currentDate);
          break;
        default:
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
      }
      
      const completionRates = await storage.getCompletionRate(userId, startDate, endDate);
      
      // Get habit details to include in response
      const habits = await storage.getHabitsByUserId(userId);
      
      const result = completionRates.map(rate => {
        const habit = habits.find(h => h.id === rate.habitId);
        return {
          habitId: rate.habitId,
          habitName: habit?.name || 'Unknown Habit',
          completionRate: rate.completionRate
        };
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completion rates", error: (error as Error).message });
    }
  });

  app.get("/api/analytics/weekly-trend", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get data for last 7 days
      const endDate = new Date();
      const startDate = subDays(endDate, 6); // 7 days including today
      
      const weeklyTrend = await storage.getWeeklyCompletionTrend(userId, startDate, endDate);
      
      res.json(weeklyTrend);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly trend", error: (error as Error).message });
    }
  });
  
  // API endpoint for timeframe-specific completion rates for the bar chart
  app.get("/api/analytics/timeframe-completion", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const period = req.query.period as string || '2weeks';
      
      // Determine date range based on period parameter
      let startDate: Date;
      const endDate = new Date();
      
      switch (period) {
        case '1week':
          startDate = subDays(endDate, 7);
          break;
        case '2weeks':
          startDate = subDays(endDate, 14);
          break;
        case '1month':
          startDate = subMonths(endDate, 1);
          break;
        default:
          startDate = subDays(endDate, 14); // Default to 2 weeks
      }
      
      // Get all habits for the user
      const userHabits = await storage.getHabitsByUserId(userId);
      
      // Group habits by timeframe
      const dailyHabits = userHabits.filter(habit => {
        const habitTimeframe = getHabitTimeframe(habit.description || '');
        return habitTimeframe === 'daily';
      });
      
      const weeklyHabits = userHabits.filter(habit => {
        const habitTimeframe = getHabitTimeframe(habit.description || '');
        return habitTimeframe === 'weekly';
      });
      
      const monthlyHabits = userHabits.filter(habit => {
        const habitTimeframe = getHabitTimeframe(habit.description || '');
        return habitTimeframe === 'monthly';
      });
      
      // Generate date range for the period
      const dateRange: string[] = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dateRange.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate = addDays(currentDate, 1);
      }
      
      const result: {
        date: string;
        daily: number;
        weekly: number;
        monthly: number;
      }[] = [];
      
      // For each date in the range, calculate completion rates for each timeframe
      for (const dateStr of dateRange) {
        const date = new Date(dateStr);
        
        // Initialize result entry
        const entry = {
          date: dateStr,
          daily: 0,
          weekly: 0,
          monthly: 0
        };
        
        // Process daily habits
        if (dailyHabits.length > 0) {
          let completed = 0;
          for (const habit of dailyHabits) {
            // Get completions for this day
            const completions = await storage.getHabitCompletions(
              habit.id,
              date,
              date
            );
            
            // Check if habit was completed on this day
            if (completions.length > 0 && completions[0].completed) {
              completed++;
            }
          }
          
          // Calculate completion rate
          entry.daily = dailyHabits.length > 0 ? Math.round((completed / dailyHabits.length) * 100) : 0;
        }
        
        // Process weekly habits
        if (weeklyHabits.length > 0) {
          let completed = 0;
          for (const habit of weeklyHabits) {
            // Get completions for this day
            const completions = await storage.getHabitCompletions(
              habit.id,
              date,
              date
            );
            
            // Check if habit was completed on this day
            if (completions.length > 0 && completions[0].completed) {
              completed++;
            }
          }
          
          // Calculate completion rate
          entry.weekly = weeklyHabits.length > 0 ? Math.round((completed / weeklyHabits.length) * 100) : 0;
        }
        
        // Process monthly habits
        if (monthlyHabits.length > 0) {
          let completed = 0;
          for (const habit of monthlyHabits) {
            // Get completions for this day
            const completions = await storage.getHabitCompletions(
              habit.id,
              date,
              date
            );
            
            // Check if habit was completed on this day
            if (completions.length > 0 && completions[0].completed) {
              completed++;
            }
          }
          
          // Calculate completion rate
          entry.monthly = monthlyHabits.length > 0 ? Math.round((completed / monthlyHabits.length) * 100) : 0;
        }
        
        result.push(entry);
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeframe completion data", error: (error as Error).message });
    }
  });

  app.get("/api/analytics/heatmap", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const timeframe = req.query.timeframe as string || 'daily';
      const period = req.query.period as string || '6months';
      
      let startDate: Date;
      const endDate = new Date();
      
      // Determine timeframe based on period parameter
      switch (period) {
        case '3months':
          startDate = subMonths(endDate, 3);
          break;
        case '6months':
          startDate = subMonths(endDate, 6);
          break;
        case '1year':
          startDate = subYears(endDate, 1);
          break;
        default:
          startDate = subMonths(endDate, 6); // Default to 6 months
      }
      
      // Get all habits for the user
      const userHabits = await storage.getHabitsByUserId(userId);
      
      // Prepare result structure - include timeframe in the data
      interface HeatmapData {
        date: string;
        count: number;
        rate: number;
        timeframe?: 'daily' | 'weekly' | 'monthly';
        dailyCount?: number;
        weeklyCount?: number;
        monthlyCount?: number;
        dailyRate?: number;
        weeklyRate?: number;
        monthlyRate?: number;
        hasDaily?: boolean;
        hasWeekly?: boolean;
        hasMonthly?: boolean;
      }
      
      const result: Record<string, HeatmapData> = {};
      
      for (const habit of userHabits) {
        // Get completions for this habit
        const completions = await storage.getHabitCompletions(
          habit.id, 
          startDate,
          endDate
        );
        
        // Get habit timeframe
        const habitTimeframe = getHabitTimeframe(habit.description || '');
        
        // Process completions by date
        for (const completion of completions) {
          const dateStr = completion.date;
          
          if (!result[dateStr]) {
            result[dateStr] = { 
              date: dateStr, 
              count: 0, 
              rate: 0,
              dailyCount: 0,
              weeklyCount: 0,
              monthlyCount: 0,
              dailyRate: 0,
              weeklyRate: 0,
              monthlyRate: 0,
              hasDaily: false,
              hasWeekly: false,
              hasMonthly: false
            };
          }
          
          if (completion.completed) {
            console.log(`Debug - Habit completion marked for ${habit.name} on ${dateStr} (${habitTimeframe} habit)`);
            
            // Increment the total count
            result[dateStr].count += 1;
            
            // Also track counts by timeframe
            if (habitTimeframe === 'daily') {
              result[dateStr].dailyCount! += 1;
              result[dateStr].timeframe = 'daily';
            } else if (habitTimeframe === 'weekly') {
              result[dateStr].weeklyCount! += 1;
              result[dateStr].timeframe = 'weekly';
            } else if (habitTimeframe === 'monthly') {
              result[dateStr].monthlyCount! += 1;
              result[dateStr].timeframe = 'monthly';
            }
          }
        }
      }
      
      // Convert results to array format
      const heatmapData = Object.values(result);
      
      // Calculate completion rates
      for (const data of heatmapData) {
        const dailyHabitsForDate = userHabits.filter(habit => {
          const habitTimeframe = getHabitTimeframe(habit.description || '');
          const habitStartDate = new Date(habit.startDate);
          const currentDate = new Date(data.date);
          return habitTimeframe === 'daily' && habitStartDate <= currentDate;
        });
        
        const weeklyHabitsForDate = userHabits.filter(habit => {
          const habitTimeframe = getHabitTimeframe(habit.description || '');
          const habitStartDate = new Date(habit.startDate);
          const currentDate = new Date(data.date);
          return habitTimeframe === 'weekly' && habitStartDate <= currentDate;
        });
        
        const monthlyHabitsForDate = userHabits.filter(habit => {
          const habitTimeframe = getHabitTimeframe(habit.description || '');
          const habitStartDate = new Date(habit.startDate);
          const currentDate = new Date(data.date);
          return habitTimeframe === 'monthly' && habitStartDate <= currentDate;
        });
        
        // Calculate rate for each timeframe
        const totalHabits = dailyHabitsForDate.length + weeklyHabitsForDate.length + monthlyHabitsForDate.length;
        if (totalHabits > 0) {
          data.rate = Math.round((data.count / totalHabits) * 100);
        }
        
        // Add timeframe-specific data to help with rendering the heatmap
        if (weeklyHabitsForDate.length > 0) {
          // Calculate weekly habit completion rate (for border color)
          data.weeklyRate = weeklyHabitsForDate.length > 0 ? 
            Math.round((data.weeklyCount! / weeklyHabitsForDate.length) * 100) : 0;
          
          // Mark that this date has weekly habits
          if (data.weeklyCount! > 0) {
            data.hasWeekly = true;
          }
        }
        
        if (monthlyHabitsForDate.length > 0) {
          // Calculate monthly habit completion rate (for border color)
          data.monthlyRate = monthlyHabitsForDate.length > 0 ? 
            Math.round((data.monthlyCount! / monthlyHabitsForDate.length) * 100) : 0;
          
          // Mark that this date has monthly habits
          if (data.monthlyCount! > 0) {
            data.hasMonthly = true;
          }
        }
        
        if (dailyHabitsForDate.length > 0) {
          // Calculate daily habit completion rate (for background color)
          data.dailyRate = dailyHabitsForDate.length > 0 ? 
            Math.round((data.dailyCount! / dailyHabitsForDate.length) * 100) : 0;
          
          // Mark that this date has daily habits
          if (data.dailyCount! > 0) {
            data.hasDaily = true;
          }
        }
      }
      
      res.json(heatmapData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch heatmap data", error: (error as Error).message });
    }
  });

  // Helper function to update streak information for a habit
  async function updateStreaks(habitId: number, userId: number): Promise<void> {
    try {
      const habit = await storage.getHabitById(habitId, userId);
      
      if (!habit) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Get recent completions
      const recentCompletions = await storage.getHabitCompletions(
        habitId,
        subDays(today, 30), // Look back 30 days
        today
      );
      
      // Sort completions by date (newest first)
      recentCompletions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Check if the most recent completion is from today
      const todayCompletion = recentCompletions.find(c => 
        format(new Date(c.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      );
      
      if (!todayCompletion || !todayCompletion.completed) {
        // Today's habit is not completed or marked as incomplete, don't update streak
        return;
      }
      
      // Calculate current streak
      let currentStreak = 1; // Start with today
      let checkDate = yesterday;
      let streakBroken = false;
      
      while (!streakBroken) {
        const targetDays = habit.targetDays as number[];
        const dayOfWeek = checkDate.getDay();
        
        // If this day is a target day for the habit
        if (targetDays.includes(dayOfWeek)) {
          const completion = recentCompletions.find(c => 
            format(new Date(c.date), 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
          );
          
          if (completion && completion.completed) {
            currentStreak++;
          } else {
            streakBroken = true;
          }
        }
        
        // Move to previous day
        checkDate.setDate(checkDate.getDate() - 1);
        
        // Limit how far back we check to avoid infinite loops
        if (checkDate < subDays(today, 365)) {
          break;
        }
      }
      
      // Calculate longest streak
      const longestStreak = Math.max(currentStreak, habit.longestStreak);
      
      // Update habit streak information
      await storage.updateHabitStreak(habitId, userId, currentStreak, longestStreak);
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  }
  
  // User settings endpoints
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user settings from database or create default if not exists
      let settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Create default settings
        settings = await storage.createUserSettings({
          userId,
          darkMode: false,
          timeRange: "month",
          showQuotes: true,
          reminderTime: "18:00",
          reminderEnabled: false,
          emailNotifications: false,
          compactView: false
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error getting settings:", error);
      res.status(500).json({ message: "Failed to get settings", error: (error as Error).message });
    }
  });
  
  app.put("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { 
        darkMode, 
        timeRange, 
        showQuotes,
        reminderTime,
        reminderEnabled,
        emailNotifications,
        compactView
      } = req.body;
      
      // Get existing settings
      let settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Create settings if not exists
        settings = await storage.createUserSettings({
          userId,
          darkMode: darkMode ?? false,
          timeRange: timeRange ?? "month",
          showQuotes: showQuotes ?? true,
          reminderTime: reminderTime ?? "18:00",
          reminderEnabled: reminderEnabled ?? false,
          emailNotifications: emailNotifications ?? false,
          compactView: compactView ?? false
        });
      } else {
        // Update existing settings
        settings = await storage.updateUserSettings(userId, {
          darkMode: darkMode !== undefined ? darkMode : settings.darkMode,
          timeRange: timeRange || settings.timeRange,
          showQuotes: showQuotes !== undefined ? showQuotes : settings.showQuotes,
          reminderTime: reminderTime || settings.reminderTime,
          reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : settings.reminderEnabled,
          emailNotifications: emailNotifications !== undefined ? emailNotifications : settings.emailNotifications,
          compactView: compactView !== undefined ? compactView : settings.compactView
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings", error: (error as Error).message });
    }
  });
  
  // Email notification test endpoint
  app.post("/api/email/test", isAuthenticated, async (req, res) => {
    try {
      // Check if SendGrid API key is configured
      const sendgridApiKey = process.env.SENDGRID_API_KEY;
      if (!sendgridApiKey) {
        return res.status(503).json({ 
          message: "Email service not configured. Please provide a SendGrid API key.",
          needsApiKey: true
        });
      }
      
      const user = req.user!;
      
      // Initialize the email service if needed
      initializeEmailService(sendgridApiKey);
      
      // Send a test email
      const emailSent = await sendEmail({
        to: user.email,
        subject: "HabitVault Email Notification Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #5a67d8;">HabitVault Email Test</h2>
            <p>Hello ${user.username},</p>
            <p>This is a test email to confirm your email notifications are working correctly.</p>
            <p>You will receive email notifications based on your settings in the app.</p>
            <p style="color: #718096; font-size: 0.9em;">- The HabitVault Team</p>
          </div>
        `,
        text: `Hello ${user.username},\n\nThis is a test email to confirm your email notifications are working correctly.\n\nYou will receive email notifications based on your settings in the app.\n\n- The HabitVault Team`
      });
      
      if (emailSent) {
        res.json({ success: true, message: "Test email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send test email", 
        error: (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
