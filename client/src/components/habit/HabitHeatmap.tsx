import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Habit, HabitCompletion } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, eachDayOfInterval, isSameMonth, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface HabitHeatmapProps {
  habitId: number;
}

const timeRanges = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export default function HabitHeatmap({ habitId }: HabitHeatmapProps) {
  const [storedTimeRange, setStoredTimeRange] = useLocalStorage("heatmap-range", "month");
  const [timeRange, setTimeRange] = useState(storedTimeRange);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date()
  });
  
  useEffect(() => {
    // Update date range when time range changes
    const now = new Date();
    
    switch (timeRange) {
      case "week":
        setDateRange({
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        });
        break;
      case "month":
        setDateRange({
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
        break;
      case "year":
        setDateRange({
          start: startOfYear(now),
          end: endOfYear(now)
        });
        break;
    }
    
    // Save to localStorage
    setStoredTimeRange(timeRange);
  }, [timeRange, setStoredTimeRange]);
  
  // Fetch habit completions
  const { data: completions, isLoading } = useQuery<HabitCompletion[]>({
    queryKey: [
      `/api/habits/${habitId}/completions`, 
      {
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      }
    ],
  });
  
  // Get day cells based on current time range
  const getDayCells = () => {
    if (timeRange === "week") {
      // For week view, just show the 7 days
      return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    } else if (timeRange === "month") {
      // For month view, create a grid with weeks as rows
      const firstDay = startOfMonth(dateRange.start);
      const lastDay = endOfMonth(dateRange.start);
      
      // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
      const firstDayOfWeek = getDay(firstDay);
      
      // Create an array with the days of the month
      const days = eachDayOfInterval({ start: firstDay, end: lastDay });
      
      // Add empty cells for days before the first day of the month
      const emptyCellsBefore = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);
      
      return [...emptyCellsBefore, ...days];
    } else {
      // For year view, we'll use a simplified view of months
      return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(dateRange.start.getFullYear(), i, 1);
        return {
          month: format(date, 'MMM'),
          completionRate: calculateMonthCompletionRate(date)
        };
      });
    }
  };
  
  // Calculate completion rate for a specific month
  const calculateMonthCompletionRate = (monthDate: Date) => {
    if (!completions) return 0;
    
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthCompletions = completions.filter(c => {
      const date = new Date(c.date);
      return date >= monthStart && date <= monthEnd;
    });
    
    if (monthCompletions.length === 0) return 0;
    
    const completed = monthCompletions.filter(c => c.completed).length;
    return Math.round((completed / monthCompletions.length) * 100);
  };
  
  // Get completion status for a specific day
  const getDayCompletionStatus = (day: Date | null) => {
    if (!day || !completions) return null;
    
    const dayStr = format(day, 'yyyy-MM-dd');
    const completion = completions.find(c => format(new Date(c.date), 'yyyy-MM-dd') === dayStr);
    
    if (!completion) return "empty";
    return completion.completed ? "completed" : "missed";
  };
  
  // Generate color class based on completion status
  const getCompletionColorClass = (status: string | null) => {
    if (!status) return "bg-gray-100 dark:bg-gray-800";
    
    switch (status) {
      case "completed":
        return "bg-green-500 dark:bg-green-600";
      case "missed":
        return "bg-red-300 dark:bg-red-900";
      case "empty":
      default:
        return "bg-gray-200 dark:bg-gray-700";
    }
  };
  
  // Generate color class based on completion rate
  const getCompletionRateColorClass = (rate: number) => {
    if (rate >= 80) return "bg-green-600 dark:bg-green-500";
    if (rate >= 60) return "bg-green-500 dark:bg-green-600";
    if (rate >= 40) return "bg-green-400 dark:bg-green-700";
    if (rate >= 20) return "bg-green-300 dark:bg-green-800";
    return "bg-gray-200 dark:bg-gray-700";
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Habit Heatmap</CardTitle>
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                timeRange === range.id && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              onClick={() => setTimeRange(range.id)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <HeatmapSkeleton timeRange={timeRange} />
        ) : (
          <>
            {/* Week or Month View */}
            {(timeRange === "week" || timeRange === "month") && (
              <div className="space-y-6">
                {timeRange === "month" && (
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div
                        key={day}
                        className="text-xs text-center font-medium text-gray-500 dark:text-gray-400"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={`grid ${timeRange === "week" ? "grid-cols-7" : "grid-cols-7"} gap-2`}>
                  {getDayCells().map((day, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-full aspect-square rounded-md",
                              day ? getCompletionColorClass(getDayCompletionStatus(day)) : "bg-transparent"
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {day ? (
                            <p>
                              {format(day, 'PPP')}: {" "}
                              {getDayCompletionStatus(day) === "completed"
                                ? "Completed"
                                : getDayCompletionStatus(day) === "missed"
                                ? "Missed"
                                : "No data"}
                            </p>
                          ) : null}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}
            
            {/* Year View */}
            {timeRange === "year" && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {getDayCells().map((monthData: any, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-md",
                        getCompletionRateColorClass(monthData.completionRate)
                      )}
                    />
                    <span className="text-xs font-medium mt-1 text-gray-500 dark:text-gray-400">
                      {monthData.month}
                    </span>
                    <span className="text-xs font-bold">
                      {monthData.completionRate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <div className="flex items-center">
                <span className="mr-2 text-xs text-gray-500 dark:text-gray-400">Less</span>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="w-4 h-4 rounded bg-green-300 dark:bg-green-800"></div>
                  <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700"></div>
                  <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-600"></div>
                  <div className="w-4 h-4 rounded bg-green-600 dark:bg-green-500"></div>
                </div>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">More</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-red-300 dark:bg-red-900 mr-1"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Missed Day</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function HeatmapSkeleton({ timeRange }: { timeRange: string }) {
  return (
    <div className="space-y-6">
      {timeRange === "month" && (
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div
              key={day}
              className="text-xs text-center font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>
      )}
      
      {(timeRange === "week" || timeRange === "month") && (
        <div className={`grid ${timeRange === "week" ? "grid-cols-7" : "grid-cols-7"} gap-2`}>
          {Array.from({ length: timeRange === "week" ? 7 : 35 }).map((_, index) => (
            <Skeleton key={index} className="w-full aspect-square rounded-md" />
          ))}
        </div>
      )}
      
      {timeRange === "year" && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <Skeleton className="w-16 h-16 rounded-md" />
              <Skeleton className="w-8 h-4 mt-1" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
