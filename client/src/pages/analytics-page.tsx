import { useState, useEffect } from "react";
import { useHabits } from "@/hooks/use-habits";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  PieChart
} from "recharts";
import { BarChartHorizontal, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar, Loader2 } from "lucide-react";
import { calculateStreakColor } from "@/lib/utils";

interface AnalyticsPageProps {
  onNavigate: (page: string) => void;
}

interface TimeframeCompletionData {
  date: string;
  daily: number;
  weekly: number;
  monthly: number;
}

export default function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const { habits, completionRates, weeklyTrend, isLoading } = useHabits();
  const [timeRange, setTimeRange] = useState("week");
  const [timeframeCompletionData, setTimeframeCompletionData] = useState<TimeframeCompletionData[]>([]);
  const [isTimeframeDataLoading, setIsTimeframeDataLoading] = useState(false);
  
  // Fetch timeframe-specific completion data
  useEffect(() => {
    const fetchTimeframeCompletionData = async () => {
      setIsTimeframeDataLoading(true);
      try {
        let period = '1week'; // Default to 1 week (7 days)
        
        // Map time range to period
        if (timeRange === 'week') {
          period = '1week';
        } else if (timeRange === 'month') {
          period = '1month';
        }
        
        const response = await fetch(`/api/analytics/timeframe-completion?period=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch timeframe completion data');
        }
        
        const data = await response.json();
        console.log('Timeframe completion data:', data);
        setTimeframeCompletionData(data);
      } catch (error) {
        console.error('Error fetching timeframe completion data:', error);
      } finally {
        setIsTimeframeDataLoading(false);
      }
    };
    
    fetchTimeframeCompletionData();
  }, [timeRange]);
  
  // Generate data for charts
  const generateCompletionRateData = () => {
    if (!completionRates || completionRates.length === 0) return [];
    
    return completionRates.map(item => {
      const habit = habits?.find(h => h.id === item.habitId);
      return {
        name: habit?.name || `Habit ${item.habitId}`,
        value: item.completionRate,
        color: item.completionRate > 75 ? "text-green-500" : item.completionRate > 50 ? "text-yellow-500" : "text-red-500",
      };
    });
  };
  
  // Calculate overall completion rate
  const calculateOverallCompletionRate = (): number => {
    if (!completionRates || completionRates.length === 0) return 0;
    
    const totalRate = completionRates.reduce((sum, item) => sum + item.completionRate, 0);
    return Math.round(totalRate / completionRates.length);
  };
  
  return (
    <MainLayout title="Analytics" onNavigate={onNavigate} currentPage="analytics">
      <div className="grid gap-6">
        {/* Time range selector */}
        <div className="flex justify-end">
          <Select defaultValue="week" onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Analytics overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overall Completion</CardTitle>
              <CardDescription>Average across all habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold mb-2">{calculateOverallCompletionRate()}%</div>
                <Progress value={calculateOverallCompletionRate()} className="w-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Habits</CardTitle>
              <CardDescription>Number of habits you're tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">{habits?.length || 0}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Longest Streak</CardTitle>
              <CardDescription>Your best consistent habit</CardDescription>
            </CardHeader>
            <CardContent>
              {habits && habits.length > 0 ? (
                <div className="flex flex-col items-center justify-center">
                  {(() => {
                    const maxStreak = Math.max(...habits.map(h => h.longestStreak));
                    const habitWithMaxStreak = habits.find(h => h.longestStreak === maxStreak);
                    
                    return (
                      <>
                        <div className="text-5xl font-bold">{maxStreak} days</div>
                        <div className="text-sm text-muted-foreground mt-2">
                          {habitWithMaxStreak?.name || "No habit"}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">0 days</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    No habits yet
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed analytics tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analytics</CardTitle>
            <CardDescription>
              A deeper look at your habit performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="completion">
              <TabsList className="mb-4">
                <TabsTrigger value="completion">
                  <BarChartHorizontal className="h-4 w-4 mr-2" />
                  Completion Rates
                </TabsTrigger>
                <TabsTrigger value="timeframe">
                  <BarChartHorizontal className="h-4 w-4 mr-2" />
                  By Timeframe
                </TabsTrigger>
                <TabsTrigger value="streaks">
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  Streaks
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeframe">
                <div className="mb-4">
                  <Select
                    value={timeRange}
                    onValueChange={setTimeRange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="2weeks">Last 14 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {isTimeframeDataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : timeframeCompletionData.length > 0 ? (
                  <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={timeframeCompletionData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => {
                            const d = new Date(date);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, '']}
                          labelFormatter={(date) => {
                            const d = new Date(date);
                            return new Intl.DateTimeFormat('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            }).format(d);
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="daily" 
                          name="Daily Tasks" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="weekly" 
                          name="Weekly Tasks" 
                          fill="#8b5cf6" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="monthly" 
                          name="Monthly Tasks" 
                          fill="#f97316" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    
                    <div className="mt-4 text-sm text-muted-foreground text-center">
                      <p>Shows completion percentages by habit timeframe type</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <BarChartHorizontal className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No timeframe data available</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete habits of different timeframes (daily, weekly, monthly) to see this chart.
                    </p>
                    <Button onClick={() => onNavigate("habits")}>
                      Go to Habits
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completion">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : completionRates && completionRates.length > 0 ? (
                  <div className="space-y-4">
                    {completionRates.map(item => {
                      const habit = habits?.find(h => h.id === item.habitId);
                      
                      return (
                        <div key={item.habitId} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{habit?.name}</span>
                            </div>
                            <span 
                              className={`font-bold ${
                                item.completionRate >= 75 
                                  ? "text-green-500"
                                  : item.completionRate >= 50
                                  ? "text-yellow-500"
                                  : "text-red-500"
                              }`}
                            >
                              {item.completionRate}%
                            </span>
                          </div>
                          <Progress 
                            value={item.completionRate} 
                            className={
                              item.completionRate >= 75 
                                ? "bg-green-100" 
                                : item.completionRate >= 50 
                                ? "bg-yellow-100" 
                                : "bg-red-100"
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <BarChartHorizontal className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No completion data</h3>
                    <p className="text-muted-foreground mb-4">
                      You need to complete some habits to see analytics data.
                    </p>
                    <Button onClick={() => onNavigate("habits")}>
                      Go to Habits
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="streaks">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : habits && habits.length > 0 ? (
                  <div className="space-y-4">
                    {habits.map(habit => {
                      // Determine the timeframe (daily, weekly, monthly)
                      const habitTimeframe = habit.description?.includes('daily') ? 'Daily'
                        : habit.description?.includes('weekly') ? 'Weekly'
                        : habit.description?.includes('monthly') ? 'Monthly'
                        : 'Regular';
                        
                      return (
                        <Card key={habit.id} className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{habit.name}</h3>
                              <p className="text-sm text-muted-foreground">{habitTimeframe} habit</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col items-center">
                              <span className="text-sm text-muted-foreground mb-2">Current Streak</span>
                              <div className={`w-24 h-24 rounded-lg flex items-center justify-center shadow-md
                                ${habit.currentStreak > 30 ? 'bg-gradient-to-br from-emerald-400 to-green-600' :
                                  habit.currentStreak > 15 ? 'bg-gradient-to-br from-blue-400 to-purple-600' :
                                  habit.currentStreak > 7 ? 'bg-gradient-to-br from-yellow-300 to-orange-500' :
                                  'bg-gradient-to-br from-gray-300 to-slate-400'}`}>
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-white">{habit.currentStreak}</span>
                                  <div className="text-xs text-white/90">days</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <span className="text-sm text-muted-foreground mb-2">Highest Streak</span>
                              <div className={`w-24 h-24 rounded-lg flex items-center justify-center shadow-md
                                ${habit.longestStreak > 30 ? 'bg-gradient-to-br from-emerald-400 to-green-600' :
                                  habit.longestStreak > 15 ? 'bg-gradient-to-br from-blue-400 to-purple-600' :
                                  habit.longestStreak > 7 ? 'bg-gradient-to-br from-yellow-300 to-orange-500' :
                                  'bg-gradient-to-br from-gray-300 to-slate-400'}`}>
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-white">{habit.longestStreak}</span>
                                  <div className="text-xs text-white/90">days</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <LineChartIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No streak data</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building habits to see your streaks here.
                    </p>
                    <Button onClick={() => onNavigate("habits")}>
                      Go to Habits
                    </Button>
                  </div>
                )}
              </TabsContent>
              

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}