import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertHabitSchema, insertHabitCompletionSchema } from "@shared/schema";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, parseISO } from "date-fns";

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
      
      // Update or create habit completion
      const completion = await storage.updateHabitCompletion(habitId, completionDate, completed);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
