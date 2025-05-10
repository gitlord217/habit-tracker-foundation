import { useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "recharts";
import { BarChartHorizontal, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar, Loader2 } from "lucide-react";
import { calculateStreakColor } from "@/lib/utils";

interface AnalyticsPageProps {
  onNavigate: (page: string) => void;
}

export default function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const { habits, completionRates, weeklyTrend, isLoading } = useHabits();
  const [timeRange, setTimeRange] = useState("month");
  
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
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
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
                <TabsTrigger value="streaks">
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  Streaks
                </TabsTrigger>
                <TabsTrigger value="distribution">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Distribution
                </TabsTrigger>
              </TabsList>
              
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
                    {habits.map(habit => (
                      <div key={habit.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{habit.name}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Current: </span>
                              <span className={calculateStreakColor(habit.currentStreak)}>{habit.currentStreak} days</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Longest: </span>
                              <span className={calculateStreakColor(habit.longestStreak)}>{habit.longestStreak} days</span>
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={habit.currentStreak > 0 
                            ? (habit.currentStreak / Math.max(habit.longestStreak, 1)) * 100
                            : 0
                          } 
                        />
                      </div>
                    ))}
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
              
              <TabsContent value="distribution">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : habits && habits.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Habit Distribution by Day</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                              const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
                              const habitsOnDay = habits.filter(h => (h.targetDays as number[]).includes(dayIndex));
                              const percentage = habitsOnDay.length > 0 ? Math.round((habitsOnDay.length / habits.length) * 100) : 0;
                              
                              return (
                                <div key={dayIndex} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>{dayName}</span>
                                    <span>{habitsOnDay.length} habits</span>
                                  </div>
                                  <Progress value={percentage} />
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Completion Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {completionRates && completionRates.length > 0 ? (
                            <div className="space-y-4">
                              {(() => {
                                const high = completionRates.filter(c => c.completionRate >= 75).length;
                                const medium = completionRates.filter(c => c.completionRate >= 50 && c.completionRate < 75).length;
                                const low = completionRates.filter(c => c.completionRate < 50).length;
                                
                                const categories = [
                                  { name: "High (75-100%)", value: high, color: "bg-green-500" },
                                  { name: "Medium (50-74%)", value: medium, color: "bg-yellow-500" },
                                  { name: "Low (0-49%)", value: low, color: "bg-red-500" },
                                ];
                                
                                return categories.map(category => (
                                  <div key={category.name} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{category.name}</span>
                                      <span>{category.value} habits</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${category.color}`}
                                        style={{
                                          width: `${Math.round((category.value / completionRates.length) * 100)}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                              No completion data available
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <PieChartIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No distribution data</h3>
                    <p className="text-muted-foreground mb-4">
                      Add some habits to see distribution analytics.
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