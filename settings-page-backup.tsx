import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { 
  requestNotificationPermission, 
  sendNotification, 
  getNotificationPermission 
} from "@/lib/notification-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserSettings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTheme } from "@/context/ThemeProvider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const settingsFormSchema = z.object({
  darkMode: z.boolean(),
  timeRange: z.enum(["week", "month", "year"]),
  showQuotes: z.boolean(),
  reminderTime: z.string(),
  reminderEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  compactView: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [, setHeatmapRange] = useLocalStorage("heatmap-range", "month");
  const [, setQuoteSetting] = useLocalStorage("show-quotes", true);
  
  // Fetch user settings
  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });
  
  // Form setup
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      darkMode: false,
      timeRange: "month",
      showQuotes: true,
      reminderTime: "18:00",
      reminderEnabled: false,
      emailNotifications: false,
      compactView: false,
    },
  });
  
  // Initialize settings from localStorage if not logged in
  useEffect(() => {
    const storedTheme = localStorage.getItem("ui-theme") || "light";
    const storedTimeRange = localStorage.getItem("heatmap-range") || "month";
    const storedShowQuotes = localStorage.getItem("show-quotes") !== "false";
    
    // Apply existing settings to the UI immediately for better UX
    setTheme(storedTheme === "dark" ? "dark" : "light");
    
    // Update form with either database settings or localStorage fallbacks
    if (settings) {
      form.reset({
        darkMode: settings.darkMode,
        timeRange: settings.timeRange as "week" | "month" | "year",
        showQuotes: settings.showQuotes,
        reminderTime: settings.reminderTime,
        reminderEnabled: settings.reminderEnabled,
        emailNotifications: settings.emailNotifications,
        compactView: settings.compactView,
      });
    } else {
      // If no settings from database yet, use localStorage values
      form.reset({
        darkMode: storedTheme === "dark",
        timeRange: storedTimeRange as "week" | "month" | "year",
        showQuotes: storedShowQuotes,
        reminderTime: localStorage.getItem("app-reminderTime") || "18:00",
        reminderEnabled: localStorage.getItem("app-reminderEnabled") === "true",
        emailNotifications: localStorage.getItem("app-emailNotifications") === "true",
        compactView: localStorage.getItem("app-compactView") === "true",
      });
    }
  }, [settings, form, setTheme]);
  
  // Save settings mutation
  const saveSettings = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      const res = await apiRequest('PUT', '/api/settings', values);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      // Update theme in ThemeContext
      setTheme(data.darkMode ? "dark" : "light");
      
      // Update localStorage values for client-side settings
      setHeatmapRange(data.timeRange);
      setQuoteSetting(data.showQuotes);
      
      // Store additional settings in localStorage for app-wide usage
      localStorage.setItem("app-compactView", data.compactView.toString());
      localStorage.setItem("app-emailNotifications", data.emailNotifications.toString());
      localStorage.setItem("app-reminderEnabled", data.reminderEnabled.toString());
      localStorage.setItem("app-reminderTime", data.reminderTime);
      
      // Dispatch a custom event to notify other components of settings changes
      window.dispatchEvent(new CustomEvent('settings-updated', { 
        detail: { 
          compactView: data.compactView,
          timeRange: data.timeRange,
          reminderEnabled: data.reminderEnabled,
          reminderTime: data.reminderTime,
          emailNotifications: data.emailNotifications
        } 
      }));
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission
  function onSubmit(values: SettingsFormValues) {
    saveSettings.mutate(values);
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <MobileNav />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-16 md:pb-0">
          <div className="py-6">
            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-8">
              <div className="flex items-center mb-4">
                <button 
                  className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))}
                  aria-label="Back to dashboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Customize your experience with HabitVault.</p>
            </div>
            
            {/* Settings Form */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Manage your personal preferences for the application.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                          control={form.control}
                          name="darkMode"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Dark Mode</FormLabel>
                                <FormDescription>
                                  Enable dark mode for a more comfortable viewing experience in low light.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="timeRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Time Range</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select default time range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="week">Week</SelectItem>
                                  <SelectItem value="month">Month</SelectItem>
                                  <SelectItem value="year">Year</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                This sets the default time range for analytics and heatmaps.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="showQuotes"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Motivational Quotes</FormLabel>
                                <FormDescription>
                                  Show daily motivational quotes on your dashboard.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="mt-8 mb-4">
                          <h3 className="text-lg font-medium">Notifications</h3>
                          <p className="text-sm text-muted-foreground">Customize when and how you receive reminders.</p>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="reminderEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Daily Reminders</FormLabel>
                                <FormDescription>
                                  Enable daily habit completion reminders.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="reminderTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reminder Time</FormLabel>
                              <div className="flex max-w-[200px]">
                                <FormControl>
                                  <input
                                    type="time"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={!form.watch("reminderEnabled")}
                                  />
                                </FormControl>
                              </div>
                              <FormDescription>
                                Set the time to receive daily reminders.
                              </FormDescription>
                              <FormMessage />
                              
                              {/* Permission status and Test button */}
                              {form.watch("reminderEnabled") && (
                                <div className="mt-2 flex flex-col space-y-2">
                                  <div className="text-sm text-muted-foreground">
                                    Notification permission: 
                                    <span className={
                                      getNotificationPermission() === 'granted' 
                                        ? 'text-green-600 dark:text-green-400 ml-1 font-medium' 
                                        : 'text-yellow-600 dark:text-yellow-400 ml-1 font-medium'
                                    }>
                                      {getNotificationPermission() === 'granted' 
                                        ? 'Granted' 
                                        : 'Not granted - click test button to request'}
                                    </span>
                                  </div>
                                  
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={async () => {
                                      // If permission not granted, request it
                                      if (getNotificationPermission() !== 'granted') {
                                        const permission = await requestNotificationPermission();
                                        if (!permission) {
                                          return;
                                        }
                                      }
                                      
                                      // Send a test notification
                                      sendNotification('HabitVault Test Notification', {
                                        body: 'Your reminders are working! You will receive habit reminders at your set time.',
                                        icon: '/favicon.ico',
                                      });
                                    }}
                                  >
                                    Test Notifications
                                  </Button>
                                </div>
                              )}
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-6">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive habit streak updates and weekly summaries via email.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        {/* Add test email button when email notifications are enabled */}
                        {form.watch("emailNotifications") && (
                          <div className="mt-2 ml-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={async () => {
                                try {
                                  const res = await apiRequest("POST", "/api/email/test");
                                  
                                  if (!res.ok) {
                                    const data = await res.json();
                                    
                                    // Check if we need to ask for SendGrid API Key
                                    if (data.needsApiKey) {
                                      toast({
                                        title: "API Key Required",
                                        description: "SendGrid API Key is required for email notifications. Please contact your administrator.",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    
                                    throw new Error(data.message || "Failed to send test email");
                                  }
                                  
                                  toast({
                                    title: "Test Email Sent",
                                    description: "A test email has been sent to your email address.",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Failed to Send Test Email",
                                    description: (error as Error).message,
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Send Test Email
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">
                              Click to verify email notifications are working
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-8 mb-4">
                          <h3 className="text-lg font-medium">Display Settings</h3>
                          <p className="text-sm text-muted-foreground">Customize the application appearance.</p>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="compactView"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Compact View</FormLabel>
                                <FormDescription>
                                  Use a more condensed layout for habits and dashboard information.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <CardFooter className="px-0">
                          <Button 
                            type="submit" 
                            disabled={saveSettings.isPending}
                            className="w-full md:w-auto"
                          >
                            {saveSettings.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Settings"
                            )}
                          </Button>
                        </CardFooter>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
