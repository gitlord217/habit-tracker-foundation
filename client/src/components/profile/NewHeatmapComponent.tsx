import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, eachDayOfInterval, startOfWeek, addDays, subMonths, subYears } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/hooks/use-app-settings";

// Define simple interfaces
interface HeatmapProps {
  userId: number;
}

interface HabitCompletion {
  date: string;
  count: number;
  rate: number;
  dailyCount: number;
  weeklyCount: number;
  monthlyCount: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  hasDaily: boolean;
  hasWeekly: boolean;
  hasMonthly: boolean;
}

export default function NewHeatmapComponent({ userId }: HeatmapProps) {
  const { toast } = useToast();
  const [appSettings] = useAppSettings();
  const [period, setPeriod] = useState<string>(getPeriodFromSettings());
  
  // Convert app settings to API period format
  function getPeriodFromSettings(): string {
    switch(appSettings.timeRange) {
      case "week": return "3months";
      case "month": return "6months";
      case "year": return "1year";
      default: return "6months";
    }
  }
  
  // Update period when app settings change
  useEffect(() => {
    setPeriod(getPeriodFromSettings());
  }, [appSettings.timeRange]);
  
  // Fetch heatmap data
  const { data: completions, isLoading, error } = useQuery<HabitCompletion[]>({
    queryKey: ['/api/analytics/heatmap', period],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/analytics/heatmap?timeframe=all&period=${period}`);
        if (!response.ok) throw new Error("Failed to fetch heatmap data");
        const data = await response.json();
        
        // Special debug for May 11th data (our problem date)
        const may11 = data.find((d: HabitCompletion) => d.date === "2025-05-11");
        if (may11) {
          console.log("🚨 MAY 11TH DATA:", may11);
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        throw error;
      }
    },
    refetchInterval: 5000 // Refresh data every 5 seconds
  });
  
  // Show errors in toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading heatmap",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Calculate stats from the data
  const stats = {
    total: completions ? completions.filter((d: HabitCompletion) => d.count > 0).length : 0,
    average: completions && completions.length > 0 
      ? Math.round(completions.reduce((sum: number, d: HabitCompletion) => sum + d.rate, 0) / completions.length) 
      : 0,
    streak: calculateStreak(completions || [])
  };
  
  // Calculate current streak
  function calculateStreak(data: HabitCompletion[]): number {
    if (!data.length) return 0;
    
    // Sort by date (newest first)
    const sortedData = [...data].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    for (let i = 0; i < sortedData.length; i++) {
      const date = parseISO(sortedData[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (format(date, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd') && sortedData[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Generate calendar grid for heatmap visualization
  function generateCalendarGrid() {
    if (!completions || completions.length === 0) return [];
    
    // Find date range
    const dates = completions.map(d => parseISO(d.date));
    const minDate = dates.reduce((min, date) => (date < min ? date : min), dates[0]);
    const maxDate = new Date(); // Today
    
    // Generate weeks starting from first day of week containing minDate
    const weeks = [];
    const firstDayOfWeek = startOfWeek(minDate, { weekStartsOn: 0 });
    
    let currentWeek = [];
    let currentDate = firstDayOfWeek;
    
    // Create a lookup map for fast data access
    const dataMap = new Map<string, HabitCompletion>();
    completions.forEach(completion => {
      dataMap.set(completion.date, completion);
    });
    
    // Generate all days in calendar grid
    while (currentDate <= maxDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayData = dataMap.get(dateKey);
      
      currentWeek.push({
        date: currentDate,
        key: dateKey,
        data: dayData
      });
      
      // Start a new week when we reach the end of the current one
      if (currentDate.getDay() === 6) { // Saturday
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      // Move to next day
      currentDate = addDays(currentDate, 1);
    }
    
    // Add any remaining days in the last week
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }
  
  // Generate month labels for the chart
  function generateMonthLabels() {
    const weeks = generateCalendarGrid();
    if (!weeks.length) return [];
    
    const labels: Array<{month: string, index: number}> = [];
    let currentMonth = -1;
    
    // Flatten all days to check for month changes
    const allDays = weeks.flat();
    allDays.forEach((day: {date: Date, key: string, data?: HabitCompletion}, index: number) => {
      const month = day.date.getMonth();
      if (month !== currentMonth) {
        currentMonth = month;
        // Calculate label position based on week
        const weekIndex = Math.floor(index / 7);
        labels.push({
          month: format(day.date, 'MMM'),
          index: weekIndex
        });
      }
    });
    
    return labels;
  }

  // Render the component
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Habit Completion Heatmap</CardTitle>
        <CardDescription>
          Visualize your habit completion patterns over time
        </CardDescription>
        
        <div className="flex justify-end">
          <div className="w-32">
            <Select 
              value={period} 
              onValueChange={setPeriod}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Days with habits completed</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.average}%</div>
                <div className="text-sm text-muted-foreground">Average completion rate</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.streak}</div>
                <div className="text-sm text-muted-foreground">Current streak</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Color Legends */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500"></div>
              <span>Daily</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500"></div>
              <span>Weekly</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500"></div>
              <span>Monthly</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 overflow-hidden">
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <rect width="6" height="12" fill="#22c55e" />
                  <rect x="6" width="6" height="12" fill="#a855f7" />
                </svg>
              </div>
              <span>Combined</span>
            </div>
          </div>
        </div>
        
        {/* Heatmap Calendar */}
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div>
            {/* Month Labels */}
            <div className="flex ml-8 mb-1">
              {generateMonthLabels().map((month, i) => (
                <div 
                  key={i} 
                  className="text-xs text-gray-500" 
                  style={{ 
                    position: 'relative',
                    left: `${month.index * 14}px`, 
                    width: 'fit-content',
                    marginRight: '40px'
                  }}
                >
                  {month.month}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="flex">
              {/* Day Labels */}
              <div className="w-8 flex flex-col justify-around text-xs text-gray-500">
                <div className="h-3.5">Sun</div>
                <div className="h-3.5">Mon</div>
                <div className="h-3.5">Tue</div>
                <div className="h-3.5">Wed</div>
                <div className="h-3.5">Thu</div>
                <div className="h-3.5">Fri</div>
                <div className="h-3.5">Sat</div>
              </div>
              
              {/* Calendar Cells */}
              <div className="flex-grow overflow-x-auto">
                <div className="flex gap-[2px]">
                  {generateCalendarGrid().map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[2px]">
                      {week.map(day => {
                        // Return a properly colored cell based on the completion data
                        return renderHeatmapCell(day.key, day.data, weekIndex);
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Renders an individual heatmap cell with appropriate coloring based on habits completed
 */
function renderHeatmapCell(
  dateKey: string, 
  data: HabitCompletion | undefined, 
  weekIndex: number
) {
  // No data for this day - empty gray cell
  if (!data) {
    return (
      <div
        key={`${weekIndex}-${dateKey}-empty`}
        className="w-3.5 h-3.5 rounded-sm bg-gray-100 dark:bg-gray-800"
        title={format(parseISO(dateKey), 'MMM d, yyyy')}
      />
    );
  }
  
  // Extract habit types from data
  const { hasDaily, hasWeekly, hasMonthly, dailyRate, weeklyRate, monthlyRate } = data;
  
  // Build tooltip text
  let tooltip = format(parseISO(dateKey), 'MMM d, yyyy');
  if (hasDaily) tooltip += `\nDaily tasks: ${dailyRate}% completed`;
  if (hasWeekly) tooltip += `\nWeekly tasks: ${weeklyRate}% completed`;
  if (hasMonthly) tooltip += `\nMonthly tasks: ${monthlyRate}% completed`;
  
  // Create a click handler for debugging
  const handleClick = () => {
    console.log(`Cell clicked: ${dateKey}`, data);
  };
  
  // CASE 1: No habits completed
  if (!hasDaily && !hasWeekly && !hasMonthly) {
    return (
      <div
        key={`${weekIndex}-${dateKey}-none`}
        onClick={handleClick}
        className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-gray-100 dark:bg-gray-800"
        title={tooltip}
      />
    );
  }
  
  // CASE 2: Only daily habits
  if (hasDaily && !hasWeekly && !hasMonthly) {
    return (
      <div
        key={`${weekIndex}-${dateKey}-daily`}
        onClick={handleClick}
        className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-green-500"
        title={tooltip}
      />
    );
  }
  
  // CASE 3: Only weekly habits
  if (!hasDaily && hasWeekly && !hasMonthly) {
    return (
      <div
        key={`${weekIndex}-${dateKey}-weekly`}
        onClick={handleClick}
        className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-purple-500"
        title={tooltip}
      />
    );
  }
  
  // CASE 4: Only monthly habits
  if (!hasDaily && !hasWeekly && hasMonthly) {
    return (
      <div
        key={`${weekIndex}-${dateKey}-monthly`}
        onClick={handleClick}
        className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-orange-500"
        title={tooltip}
      />
    );
  }
  
  // CASE 5: Daily + Weekly
  if (hasDaily && hasWeekly && !hasMonthly) {
    return (
      <div
        key={`${weekIndex}-${dateKey}-daily-weekly`}
        onClick={handleClick}
        className="w-3.5 h-3.5 rounded-sm cursor-pointer overflow-hidden"
        title={tooltip}
        style={{ padding: 0 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <rect width="7" height="14" fill="#22c55e" /> {/* Left half - green for daily */}
          <rect x="7" width="7" height="14" fill="#a855f7" /> {/* Right half - purple for weekly */}
        </svg>
      </div>
    );
  }
  
  // CASE 6: Daily + Monthly
  if (hasDaily && !hasWeekly && hasMonthly) {
    return (
      <div
        key={`${weekIndex}-${dateKey}-daily-monthly`}
        onClick={handleClick}
        className="w-3.5 h-3.5 rounded-sm cursor-pointer overflow-hidden"
        title={tooltip}
        style={{ padding: 0 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <rect width="7" height="14" fill="#22c55e" /> {/* Left half - green for daily */}
          <rect x="7" width="7" height="14" fill="#f97316" /> {/* Right half - orange for monthly */}
        </svg>
      </div>
    );
  }
  
  // CASE 7: Weekly + Monthly
  if (!hasDaily && hasWeekly && hasMonthly) {
    return (
      <div
        key={`${weekIndex}-${dateKey}-weekly-monthly`}
        onClick={handleClick}
        className="w-3.5 h-3.5 rounded-sm cursor-pointer overflow-hidden"
        title={tooltip}
        style={{ padding: 0 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <rect width="7" height="14" fill="#a855f7" /> {/* Left half - purple for weekly */}
          <rect x="7" width="7" height="14" fill="#f97316" /> {/* Right half - orange for monthly */}
        </svg>
      </div>
    );
  }
  
  // CASE 8: All three types (daily + weekly + monthly)
  if (hasDaily && hasWeekly && hasMonthly) {
    return (
      <div
        key={`${weekIndex}-${dateKey}-all`}
        onClick={handleClick}
        className="w-3.5 h-3.5 rounded-sm cursor-pointer overflow-hidden"
        title={tooltip}
        style={{ padding: 0 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <rect width="4.67" height="14" fill="#22c55e" /> {/* Left third - green for daily */}
          <rect x="4.67" width="4.67" height="14" fill="#a855f7" /> {/* Middle third - purple for weekly */}
          <rect x="9.34" width="4.67" height="14" fill="#f97316" /> {/* Right third - orange for monthly */}
        </svg>
      </div>
    );
  }
  
  // FALLBACK: This should never happen, but just in case
  console.error("Unexpected habit combination for date", dateKey, data);
  return (
    <div
      key={`${weekIndex}-${dateKey}-error`}
      onClick={handleClick}
      className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-red-500"
      title={`Error: Unexpected data for ${dateKey}`}
    />
  );
}