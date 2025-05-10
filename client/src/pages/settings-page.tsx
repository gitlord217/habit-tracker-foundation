import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
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
    },
  });
  
  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        darkMode: settings.darkMode,
        timeRange: settings.timeRange as "week" | "month" | "year",
        showQuotes: settings.showQuotes,
      });
    }
  }, [settings, form]);
  
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
      
      // Also update localStorage values for client-side settings
      setHeatmapRange(data.timeRange);
      setQuoteSetting(data.showQuotes);
      
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
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
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
