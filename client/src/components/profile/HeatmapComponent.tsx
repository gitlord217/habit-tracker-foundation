import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, eachDayOfInterval, startOfWeek, endOfWeek, subMonths, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/hooks/use-app-settings";

interface HeatmapProps {
  userId: number;
}

interface HeatmapData {
  date: string;
  count: number;
  rate: number;
  timeframe?: 'daily' | 'weekly' | 'monthly'; // Add timeframe to know the type of task
}

interface DayData {
  date: Date;
  data: (HeatmapData & {
    hasDaily?: boolean;
    dailyRate?: number;
    hasWeekly?: boolean;
    weeklyRate?: number;
    hasMonthly?: boolean;
    monthlyRate?: number;
  }) | null;
}

interface WeekData {
  weekStart: Date;
  weekEnd: Date;
  data: HeatmapData | null;
}

interface MonthData {
  monthStart: Date;
  monthName: string;
  data: HeatmapData | null;
}

export default function HeatmapComponent({ userId }: HeatmapProps) {
  const { toast } = useToast();
  const [appSettings] = useAppSettings();
  
  // Convert timeRange from settings to period for heatmap
  const getDefaultPeriod = () => {
    // Map time range from settings to heatmap period options
    switch(appSettings.timeRange) {
      case "week": return "3months"; // For weekly view, 3 months of data is appropriate
      case "month": return "6months"; // For monthly view, show 6 months
      case "year": return "1year"; // For yearly view, show full year
      default: return "6months"; // Default to 6 months
    }
  };
  
  // Always use the "all" timeframe to show a unified heatmap
  const getTimeframeFromSettings = (): string => {
    return "all"; // Always use "all" for a unified view of all timeframes
  };

  const [timeframe, setTimeframe] = useState<string>(getTimeframeFromSettings());
  const [period, setPeriod] = useState<string>(getDefaultPeriod());
  
  // Update period and timeframe when time range setting changes
  useEffect(() => {
    setPeriod(getDefaultPeriod());
    setTimeframe(getTimeframeFromSettings());
  }, [appSettings.timeRange]);
  
  const { data, isLoading, error, refetch } = useQuery<HeatmapData[]>({
    queryKey: ['/api/analytics/heatmap', timeframe, period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/heatmap?timeframe=${timeframe}&period=${period}`);
      if (!res.ok) {
        throw new Error('Failed to fetch heatmap data');
      }
      const responseData = await res.json();
      console.log("DEBUG - Heatmap data received:", responseData);
      return responseData;
    },
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 5000, // Refetch every 5 seconds while the component is mounted
  });
  
  // Set up an event listener for completion updates
  useEffect(() => {
    const handleCompletionUpdate = () => {
      console.log("Habit completion updated - refreshing heatmap data");
      refetch().then(result => {
        console.log("Heatmap data refreshed:", result.data);
      }).catch(err => {
        console.error("Error refreshing heatmap data:", err);
      });
    };
    
    window.addEventListener('habit-completion-updated', handleCompletionUpdate);
    
    return () => {
      window.removeEventListener('habit-completion-updated', handleCompletionUpdate);
    };
  }, [refetch]);
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading heatmap",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Generate a unified grid of days for ALL timeframes (daily, weekly, monthly)
  const generateUnifiedHeatmapGrid = (): Array<Array<DayData>> => {
    if (!data || data.length === 0) {
      console.log("DEBUG - No heatmap data available to generate grid");
      return []; // Return empty grid if no data
    }
    
    // Create a more visible alert message for the May 11 data specifically
    const may11Data = data.find(d => d.date === '2025-05-11');
    if (may11Data) {
      console.log('%c MAY 11TH DATA CHECK', 'background: red; color: white; padding: 2px 5px; font-size: 16px;');
      // Just log the raw data to avoid type errors
      console.log('Raw May 11th data:', may11Data);
    }
    
    console.log("DEBUG - Generating heatmap grid with data:", data);
    
    // Calculate date range
    const dates = data.map(d => parseISO(d.date));
    const minDate = dates.reduce((min, date) => (date < min ? date : min), dates[0]);
    const maxDate = new Date(); // Today
    
    // Generate all days in the interval
    const allDays = eachDayOfInterval({ start: minDate, end: maxDate });
    
    // Group by week for rendering
    const weeks: Array<Array<DayData>> = [];
    let currentWeek: Array<DayData> = [];
    
    // Initialize with empty days until the first day of the week
    const firstWeekStart = startOfWeek(minDate, { weekStartsOn: 0 });
    for (let i = 0; i < minDate.getDay(); i++) {
      const emptyDate = new Date(firstWeekStart);
      emptyDate.setDate(emptyDate.getDate() + i);
      if (emptyDate < minDate) {
        currentWeek.push({ date: emptyDate, data: null });
      }
    }
    
    // Fill with actual days and data
    allDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      
      // Group all timeframe data for this specific day
      // Always find all data types regardless of current timeframe 
      // to enable colored borders for weekly/monthly tasks
      const dailyData = data.find(d => d.date === formattedDate && (d.timeframe === 'daily' || !d.timeframe));
      const weeklyData = data.find(d => d.date === formattedDate && d.timeframe === 'weekly');
      const monthlyData = data.find(d => d.date === formattedDate && d.timeframe === 'monthly');
      
      // Create a combined data object that includes all timeframes
      // Filter data for display based on the selected timeframe
      let shouldDisplayCell = false;
      
      // Determine if the cell should be displayed based on timeframe selection
      if (timeframe === 'daily' && dailyData) {
        shouldDisplayCell = true;
      } else if (timeframe === 'weekly' && weeklyData) {
        shouldDisplayCell = true;
      } else if (timeframe === 'monthly' && monthlyData) {
        shouldDisplayCell = true;
      } else if (timeframe === 'all' && (dailyData || weeklyData || monthlyData)) {
        shouldDisplayCell = true;
      }
      
      // Set the primary rate based on the timeframe selection
      let primaryRate = 0;
      if (timeframe === 'daily') {
        primaryRate = dailyData?.rate || 0;
      } else if (timeframe === 'weekly') {
        primaryRate = weeklyData?.rate || 0;
      } else if (timeframe === 'monthly') {
        primaryRate = monthlyData?.rate || 0;
      } else {
        // For 'all', use the maximum rate of any timeframe
        primaryRate = Math.max(
          dailyData?.rate || 0,
          weeklyData?.rate || 0,
          monthlyData?.rate || 0
        );
      }
      
      const combinedData = shouldDisplayCell
        ? {
            date: formattedDate,
            count: (dailyData?.count || 0) + (weeklyData?.count || 0) + (monthlyData?.count || 0),
            rate: primaryRate,
            hasDaily: !!dailyData,
            dailyRate: dailyData?.rate || 0,
            hasWeekly: !!weeklyData,
            weeklyRate: weeklyData?.rate || 0,
            hasMonthly: !!monthlyData,
            monthlyRate: monthlyData?.rate || 0
          }
        : null;
      
      if (day.getDay() === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      currentWeek.push({ date: day, data: combinedData });
      
      if (day.getTime() === maxDate.getTime()) {
        if (currentWeek.length > 0) {
          weeks.push([...currentWeek]);
        }
      }
    });
    
    return weeks;
  };
  
  // Keep the original function as a fallback (renamed)
  const generateDailyHeatmapGrid = (): Array<Array<DayData>> => generateUnifiedHeatmapGrid();
  
  // Generate a grid of weeks for the weekly tasks heatmap
  const generateWeeklyHeatmapGrid = (): Array<WeekData> => {
    if (!data || data.length === 0) {
      return []; // Return empty array for empty state handling in UI
    }
    
    // Calculate date range
    const dates = data.map(d => parseISO(d.date));
    const minDate = dates.reduce((min, date) => (date < min ? date : min), dates[0]);
    const maxDate = new Date(); // Today
    
    // Generate data grouped by week
    const weeks: Array<WeekData> = [];
    
    // Start from the first day of the first week
    let currentDate = startOfWeek(minDate, { weekStartsOn: 0 });
    const endDate = maxDate;
    
    while (currentDate <= endDate) {
      const weekStart = currentDate;
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      
      // Find data for this week
      const weekData = data.filter(d => {
        const date = parseISO(d.date);
        return isWithinInterval(date, { start: weekStart, end: weekEnd });
      });
      
      const weekRates = weekData.map(d => d.rate);
      const avgRate = weekRates.length > 0 
        ? Math.round(weekRates.reduce((sum, rate) => sum + rate, 0) / weekRates.length) 
        : 0;
      
      const aggregatedData = weekData.length > 0 
        ? { 
            date: format(weekStart, 'yyyy-MM-dd'), 
            count: weekData.reduce((sum, d) => sum + d.count, 0),
            rate: avgRate
          } 
        : null;
      
      weeks.push({
        weekStart,
        weekEnd,
        data: aggregatedData
      });
      
      // Move to next week
      currentDate = new Date(weekEnd);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weeks;
  };
  
  // Generate a grid of months for the monthly tasks heatmap
  const generateMonthlyHeatmapGrid = (): Array<MonthData> => {
    if (!data || data.length === 0) {
      return []; // Return empty array for empty state handling in UI
    }
    
    // Calculate date range
    const dates = data.map(d => parseISO(d.date));
    const minDate = dates.reduce((min, date) => (date < min ? date : min), dates[0]);
    const maxDate = new Date(); // Today
    
    // Generate data grouped by month
    const months: Array<MonthData> = [];
    
    // Start from the first day of the first month
    let currentDate = new Date(minDate);
    currentDate.setDate(1); // First day of month
    const endDate = maxDate;
    
    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate);
      const monthName = format(currentDate, 'MMM yyyy');
      
      // Find data for this month
      const monthData = data.filter(d => {
        const date = parseISO(d.date);
        return date.getMonth() === monthStart.getMonth() && 
               date.getFullYear() === monthStart.getFullYear();
      });
      
      const monthRates = monthData.map(d => d.rate);
      const avgRate = monthRates.length > 0 
        ? Math.round(monthRates.reduce((sum, rate) => sum + rate, 0) / monthRates.length) 
        : 0;
      
      const aggregatedData = monthData.length > 0 
        ? { 
            date: format(monthStart, 'yyyy-MM-dd'), 
            count: monthData.reduce((sum, d) => sum + d.count, 0),
            rate: avgRate
          } 
        : null;
      
      months.push({
        monthStart,
        monthName,
        data: aggregatedData
      });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  };
  
  // Format dates for month labels
  const getMonthLabels = () => {
    if (!data || data.length === 0) return [];
    
    const dates = data.map(d => parseISO(d.date));
    const minDate = dates.reduce((min, date) => (date < min ? date : min), dates[0]);
    const maxDate = new Date();
    
    const months: { month: string; index: number }[] = [];
    let currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      const monthName = format(currentDate, 'MMM');
      const weekIndex = Math.floor((currentDate.getTime() - minDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      // Only add a month label if it's a new month
      if (months.length === 0 || months[months.length - 1].month !== monthName) {
        months.push({ month: monthName, index: weekIndex });
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  };
  
  // Convert completion rate to color
  const getColorForRate = (rate: number | null): string => {
    if (rate === null) {
      return "bg-gray-100 dark:bg-gray-800";
    } else if (rate === 0) {
      return "bg-gray-200 dark:bg-gray-700";
    } else if (rate <= 50) {
      return "bg-green-300 dark:bg-green-700";
    } else {
      return "bg-green-500 dark:bg-green-600";
    }
  };
  
  // Since we're now handling the border styles directly in the rendering code,
  // we don't need these helper functions anymore
  
  const monthLabels = getMonthLabels();
  
  // Stats summary
  const calculateStats = () => {
    if (!data || data.length === 0) return { total: 0, average: 0, streak: 0 };
    
    const completedDays = data.filter(d => d.rate > 0).length;
    const averageRate = data.reduce((sum, d) => sum + d.rate, 0) / data.length;
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedDates = [...data].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = parseISO(sortedDates[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      // Only count streak if the date matches what we expect in sequence
      if (format(date, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd') && sortedDates[i].rate > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return {
      total: completedDays,
      average: Math.round(averageRate),
      streak: currentStreak
    };
  };
  
  const stats = calculateStats();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Habit Completion Heatmap</CardTitle>
        <CardDescription>
          Visualize your habit completion patterns over time
        </CardDescription>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="w-full sm:w-1/2">
            <label className="text-sm font-medium mb-1 block">
              Unified Heatmap
              <span className="text-xs text-muted-foreground ml-2">
                (Shows all habit types together)
              </span>
            </label>
            
            <div className="text-xs text-muted-foreground mt-1">
              <ul className="list-disc pl-4 space-y-1">
                <li>Daily tasks: green background</li>
                <li>Weekly tasks only: full purple border</li>
                <li>Monthly tasks only: full orange border</li>
                <li>Both weekly and monthly tasks: split border (top & right = orange, bottom & left = purple)</li>
              </ul>
            </div>
          </div>
          
          <div className="w-full sm:w-1/2">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">
                  Time period
                  <span className="text-xs text-muted-foreground ml-2">
                    (Based on your time range setting)
                  </span>
                </label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                disabled={isLoading}
                className="mb-0.5 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? "animate-spin" : ""}>
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Habit Stats Summary */}
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
      
        {/* Heatmap Legend */}
        <div className="flex items-center justify-between mb-2 gap-2 text-xs">
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
              <div className="w-3 h-3 p-0 overflow-hidden">
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <rect width="6" height="12" fill="#22c55e" />
                  <rect x="6" width="6" height="12" fill="#a855f7" />
                </svg>
              </div>
              <span>Combined</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <div>Less</div>
            <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
            <div>More</div>
          </div>
        </div>
        
        {/* Unified Heatmap View for all timeframes */}
        <>
            {/* Month Labels */}
            <div className="flex ml-8 mb-1">
              {isLoading ? (
                <div className="flex gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-10" />
                  ))}
                </div>
              ) : (
                monthLabels.map((month, i) => (
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
                ))
              )}
            </div>
            
            {/* Day Labels */}
            <div className="flex">
              <div className="w-8 flex flex-col justify-around text-xs text-gray-500">
                <div className="h-3.5">Sun</div>
                <div className="h-3.5">Mon</div>
                <div className="h-3.5">Tue</div>
                <div className="h-3.5">Wed</div>
                <div className="h-3.5">Thu</div>
                <div className="h-3.5">Fri</div>
                <div className="h-3.5">Sat</div>
              </div>
              
              {isLoading ? (
                <div className="flex-grow flex gap-2 flex-wrap">
                  {[...Array(30)].map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
              ) : (
                <div className="flex-grow overflow-x-auto">
                  <div className="flex gap-[2px]">
                    {generateUnifiedHeatmapGrid().map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-[2px]">
                        {week.map((day, dayIndex) => {
                          // Get the date string for this day
                          const dateStr = format(day.date, 'yyyy-MM-dd');
                          
                          // Extract task type flags directly from data
                          // These are booleans indicating if this date has completions of each type
                          const hasDaily = day.data?.hasDaily || false;
                          const hasWeekly = day.data?.hasWeekly || false;
                          const hasMonthly = day.data?.hasMonthly || false;
                          
                          // Count how many different task types are completed for this day
                          const taskCount = [hasDaily, hasWeekly, hasMonthly].filter(Boolean).length;
                          
                          // Create tooltip text
                          let tooltip = format(day.date, 'MMM d, yyyy');
                          if (day.data) {
                            tooltip += `: ${day.data.rate}% completed`;
                            if (hasWeekly) tooltip += `\nWeekly task: ${day.data.weeklyRate}% completed`;
                            if (hasMonthly) tooltip += `\nMonthly task: ${day.data.monthlyRate}% completed`;
                          }
                          
                          // Click handler - log detailed info for debugging
                          const handleClick = () => {
                            console.log(`DEBUG - Day clicked: ${dateStr}`, {
                              hasDaily,
                              hasWeekly, 
                              hasMonthly,
                              taskCount,
                              data: day.data
                            });
                          };
                          
                          // UNIFIED DYNAMIC APPROACH:
                          // Directly render appropriate cell based on combination of task types
                          
                          // No tasks at all - gray box
                          if (taskCount === 0) {
                            return (
                              <div
                                key={`${weekIndex}-${dayIndex}`}
                                onClick={handleClick}
                                className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-gray-100 dark:bg-gray-800"
                                title={tooltip}
                              />
                            );
                          }
                          
                          // Just one task type - solid color
                          if (taskCount === 1) {
                            if (hasDaily) {
                              return (
                                <div
                                  key={`${weekIndex}-${dayIndex}`}
                                  onClick={handleClick}
                                  className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-green-500 dark:bg-green-600"
                                  title={tooltip}
                                />
                              );
                            }
                            if (hasWeekly) {
                              return (
                                <div
                                  key={`${weekIndex}-${dayIndex}`}
                                  onClick={handleClick}
                                  className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-purple-500 dark:bg-purple-600"
                                  title={tooltip}
                                />
                              );
                            }
                            if (hasMonthly) {
                              return (
                                <div
                                  key={`${weekIndex}-${dayIndex}`}
                                  onClick={handleClick}
                                  className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-orange-500 dark:bg-orange-600"
                                  title={tooltip}
                                />
                              );
                            }
                          }
                          
                          // Two task types - render a split SVG with two colors
                          if (taskCount === 2) {
                            if (hasDaily && hasWeekly) {
                              return (
                                <div
                                  key={`${weekIndex}-${dayIndex}`}
                                  onClick={handleClick}
                                  className="w-3.5 h-3.5 rounded-sm cursor-pointer p-0 overflow-hidden"
                                  title={tooltip}
                                >
                                  <svg viewBox="0 0 14 14" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="7" height="14" fill="#22c55e" /> {/* Left half - green for daily */}
                                    <rect x="7" width="7" height="14" fill="#a855f7" /> {/* Right half - purple for weekly */}
                                  </svg>
                                </div>
                              );
                            }
                            if (hasDaily && hasMonthly) {
                              return (
                                <div
                                  key={`${weekIndex}-${dayIndex}`}
                                  onClick={handleClick}
                                  className="w-3.5 h-3.5 rounded-sm cursor-pointer p-0 overflow-hidden"
                                  title={tooltip}
                                >
                                  <svg viewBox="0 0 14 14" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="7" height="14" fill="#22c55e" /> {/* Left half - green for daily */}
                                    <rect x="7" width="7" height="14" fill="#f97316" /> {/* Right half - orange for monthly */}
                                  </svg>
                                </div>
                              );
                            }
                            if (hasWeekly && hasMonthly) {
                              return (
                                <div
                                  key={`${weekIndex}-${dayIndex}`}
                                  onClick={handleClick}
                                  className="w-3.5 h-3.5 rounded-sm cursor-pointer p-0 overflow-hidden"
                                  title={tooltip}
                                >
                                  <svg viewBox="0 0 14 14" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="7" height="14" fill="#a855f7" /> {/* Left half - purple for weekly */}
                                    <rect x="7" width="7" height="14" fill="#f97316" /> {/* Right half - orange for monthly */}
                                  </svg>
                                </div>
                              );
                            }
                          }
                          
                          // Three task types - render a split SVG with three colors
                          if (taskCount === 3) {
                            return (
                              <div
                                key={`${weekIndex}-${dayIndex}`}
                                onClick={handleClick}
                                className="w-3.5 h-3.5 rounded-sm cursor-pointer p-0 overflow-hidden"
                                title={tooltip}
                              >
                                <svg viewBox="0 0 14 14" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="4.67" height="14" fill="#22c55e" /> {/* Left third - green for daily */}
                                  <rect x="4.67" width="4.67" height="14" fill="#a855f7" /> {/* Middle third - purple for weekly */}
                                  <rect x="9.34" width="4.67" height="14" fill="#f97316" /> {/* Right third - orange for monthly */}
                                </svg>
                              </div>
                            );
                          }
                          
                          // Fallback - empty gray box (should never reach here with correct data)
                          console.log('WARNING: Fallback render for day', dateStr);
                          return (
                            <div
                              key={`${weekIndex}-${dayIndex}`}
                              onClick={handleClick}
                              className="w-3.5 h-3.5 rounded-sm cursor-pointer bg-gray-100 dark:bg-gray-800 border border-red-500"
                              title={`${tooltip} - ERROR: Unable to determine cell type`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        
        {/* Color Legend Explanation */}
        <div className="mt-4 text-xs text-muted-foreground border-t pt-2 dark:border-gray-800">
          <p className="mb-1">Heatmap Color Guide:</p>
          
          {/* Background colors - completion rate */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
              <span>No habits completed (0%)</span>
            </span>
            <span className="flex items-center gap-1 ml-3">
              <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
              <span>Some habits completed (1-50%)</span>
            </span>
            <span className="flex items-center gap-1 ml-3">
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
              <span>Most or all habits completed (51-100%)</span>
            </span>
          </div>
          
          {/* Task colors - task frequency */}
          <p className="mb-1">Task Color Guide:</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
              <span>Daily tasks completed</span>
            </span>
            <span className="flex items-center gap-1 ml-3">
              <div className="w-3 h-3 rounded-sm bg-purple-500 dark:bg-purple-600"></div>
              <span>Weekly tasks completed</span>
            </span>
            <span className="flex items-center gap-1 ml-3">
              <div className="w-3 h-3 rounded-sm bg-orange-500 dark:bg-orange-600"></div>
              <span>Monthly tasks completed</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <p className="font-medium w-full mb-1">When multiple task types are completed:</p>
            <span className="flex items-center gap-1 mr-3">
              <div className="w-3 h-3 rounded-sm p-0 overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 14 14">
                  <rect width="7" height="14" fill="#22c55e" />
                  <rect x="7" width="7" height="14" fill="#a855f7" />
                </svg>
              </div>
              <span>Daily + Weekly</span>
            </span>
            <span className="flex items-center gap-1 mr-3">
              <div className="w-3 h-3 rounded-sm p-0 overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 14 14">
                  <rect width="7" height="14" fill="#22c55e" />
                  <rect x="7" width="7" height="14" fill="#f97316" />
                </svg>
              </div>
              <span>Daily + Monthly</span>
            </span>
            <span className="flex items-center gap-1 mr-3">
              <div className="w-3 h-3 rounded-sm p-0 overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 14 14">
                  <rect width="7" height="14" fill="#a855f7" />
                  <rect x="7" width="7" height="14" fill="#f97316" />
                </svg>
              </div>
              <span>Weekly + Monthly</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm p-0 overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 14 14">
                  <rect width="4.67" height="14" fill="#22c55e" />
                  <rect x="4.67" width="4.67" height="14" fill="#a855f7" />
                  <rect x="9.34" width="4.67" height="14" fill="#f97316" />
                </svg>
              </div>
              <span>Daily + Weekly + Monthly</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}