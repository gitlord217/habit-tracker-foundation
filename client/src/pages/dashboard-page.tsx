import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useHabits } from "@/hooks/use-habits";
import { useAppSettings } from "@/hooks/use-app-settings";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart3, CheckCircle, Clock, Flame, Plus, Target, Award, Book, Zap, Star } from "lucide-react";
import { formatDate, isHabitAvailableForCompletion } from "@/lib/utils";
import { getTodaysQuote } from "@/lib/quotes";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const { habits, todayCompletions, isLoading, toggleCompletion, completionRates } = useHabits();
  const [appSettings] = useAppSettings();
  const showQuotes = localStorage.getItem("show-quotes") !== "false";
  
  const [todaysQuote] = useState(getTodaysQuote());
  const todayDate = new Date();
  
  // Calculate overall completion rate
  const calculateOverallCompletionRate = (): number => {
    if (!completionRates || completionRates.length === 0) return 0;
    
    const totalRate = completionRates.reduce((sum, item) => sum + item.completionRate, 0);
    return Math.round(totalRate / completionRates.length);
  };
  
  // Calculate today's completion rate
  const calculateTodayCompletionRate = (): number => {
    if (!todayCompletions || todayCompletions.length === 0) return 0;
    
    const completedCount = todayCompletions.filter(item => item.completion?.completed).length;
    return Math.round((completedCount / todayCompletions.length) * 100);
  };
  
  // Find the achievement that has the most progress but isn't completed
  const findNextAchievement = () => {
    // List of all achievements with their current progress
    const achievements = [
      {
        title: "Habit Master",
        description: "Completed all habits for 7 consecutive days",
        progress: calculateOverallCompletionRate(),
        goal: 7,
        completed: calculateOverallCompletionRate() >= 7,
        icon: <Zap className="h-5 w-5 text-yellow-500" />
      },
      {
        title: "Consistency Champion",
        description: "Reached a 14-day streak on any habit",
        progress: habits?.reduce((max, habit) => Math.max(max, habit.currentStreak), 0) || 0,
        goal: 14,
        completed: (habits?.reduce((max, habit) => Math.max(max, habit.currentStreak), 0) || 0) >= 14,
        icon: <Award className="h-5 w-5 text-purple-500" />
      },
      {
        title: "Habit Collector",
        description: "Track 5 or more habits simultaneously",
        progress: habits?.length || 0,
        goal: 5,
        completed: (habits?.length || 0) >= 5,
        icon: <Book className="h-5 w-5 text-cyan-500" />
      },
      {
        title: "Perfect Week",
        description: "100% completion for an entire week",
        progress: calculateOverallCompletionRate(),
        goal: 100,
        completed: calculateOverallCompletionRate() === 100,
        icon: <Star className="h-5 w-5 text-orange-500" />
      }
    ];
    
    // Filter out completed achievements
    const incomplete = achievements.filter(a => !a.completed);
    if (incomplete.length === 0) return null;
    
    // Sort by progress percentage (closest to completion first)
    return incomplete.sort((a, b) => 
      (b.progress / b.goal) - (a.progress / a.goal)
    )[0];
  };
  
  return (
    <MainLayout title="Dashboard" onNavigate={onNavigate} currentPage="dashboard">
      <div className={`grid ${appSettings.compactView ? 'gap-3' : 'gap-6'}`}>
        {/* Welcome section with motivational quote */}
        <section>
          <h2 className={`${appSettings.compactView ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>
            Welcome back, {user?.username.split(' ')[0]}!
          </h2>
          <p className={`text-muted-foreground ${appSettings.compactView ? 'mb-3' : 'mb-6'}`}>
            {formatDate(todayDate)}
          </p>
          
          {showQuotes ? (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-none">
              <CardContent className={`${appSettings.compactView ? 'py-3' : 'pt-6'}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <p className="text-sm font-medium">Today's Quote</p>
                    <blockquote className="mt-1 italic">"{todaysQuote.text}"</blockquote>
                    <p className="text-xs text-muted-foreground mt-1">— {todaysQuote.author}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`${appSettings.compactView ? 'text-3xl' : 'text-4xl'} font-bold`}>
                        {calculateTodayCompletionRate()}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Daily Completion</div>
                        <div>Keep it up!</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-none">
              <CardContent className={`${appSettings.compactView ? 'py-3' : 'py-6'}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Today's Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`${appSettings.compactView ? 'text-3xl' : 'text-4xl'} font-bold`}>
                      {calculateTodayCompletionRate()}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Daily Completion</div>
                      <div>Keep it up!</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
        
        <Separator />
        
        {/* Analytics overview */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quick Stats</h2>
            <Button variant="outline" size="sm" onClick={() => onNavigate("analytics")}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Habits Created"
              value={habits?.length || 0}
              icon={<Target className="h-8 w-8 text-primary" />}
            />
            
            <StatsCard 
              title="Today's Completion"
              value={`${calculateTodayCompletionRate()}%`}
              icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            />
            
            <StatsCard 
              title="Overall Completion"
              value={`${calculateOverallCompletionRate()}%`}
              icon={<BarChart3 className="h-8 w-8 text-blue-500" />}
            />
            
            <StatsCard 
              title="Highest Streak"
              value={habits?.reduce((max, habit) => Math.max(max, habit.longestStreak), 0) || 0}
              icon={<Flame className="h-8 w-8 text-orange-500" />}
            />
          </div>
        </section>
        
        {/* Today's habits */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Habits</h2>
            <Button onClick={() => onNavigate("habits")}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Habit
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(n => (
                <Card key={n} className="h-48 animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted rounded-md w-3/4"></div>
                    <div className="h-4 bg-muted rounded-md w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded-md w-full mt-4"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-muted rounded-md w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : todayCompletions && todayCompletions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayCompletions.map(({ habit, completion }) => (
                <Card 
                  key={habit.id} 
                  className={completion?.completed ? 
                    "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{habit.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{habit.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Flame className="h-4 w-4 mr-1 text-orange-500" />
                        <span>Streak: {habit.currentStreak} days</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Started {formatDate(new Date(habit.startDate))}</span>
                      </div>
                    </div>
                    <Progress 
                      value={completion?.completed ? 100 : 0}
                      className={completion?.completed ? "bg-green-200" : ""}
                    />
                  </CardContent>
                  <CardFooter className="pt-2 flex flex-col">
                    {(() => {
                      // Check if habit is available for completion based on timing rules
                      const availabilityStatus = isHabitAvailableForCompletion(
                        habit, 
                        completion?.date
                      );
                      
                      const isDisabled = completion?.completed || !availabilityStatus.available;
                      
                      return (
                        <>
                          <Button 
                            variant={completion?.completed ? "outline" : isDisabled ? "secondary" : "default"}
                            onClick={() => availabilityStatus.available && !completion?.completed && toggleCompletion(habit.id)}
                            className="w-full"
                            disabled={isDisabled}
                          >
                            {completion?.completed ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Completed
                              </>
                            ) : availabilityStatus.available ? (
                              "Mark as Complete"
                            ) : (
                              "Not Available"
                            )}
                          </Button>
                          
                          {/* Show message explaining why completion is not available */}
                          {!completion?.completed && !availabilityStatus.available && availabilityStatus.message && (
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              {availabilityStatus.message}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No habits yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any habits yet. Start building better habits today!
                </p>
                <Button onClick={() => onNavigate("habits")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first habit
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
        
        {/* Achievement in Progress */}
        {!isLoading && habits && habits.length > 0 && (
          <section>
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Achievement in Progress</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Use custom event to navigate to profile with achievement tab parameter
                  window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { page: 'profile', params: { tab: 'achievements' } }
                  }));
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                View All Achievements
              </Button>
            </div>
            
            {findNextAchievement() ? (
              <Card className="achievement-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      {findNextAchievement()?.icon}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{findNextAchievement()?.title}</h3>
                          <p className="text-sm text-muted-foreground">{findNextAchievement()?.description}</p>
                        </div>
                        <span className="text-sm font-medium">
                          {findNextAchievement()?.progress} / {findNextAchievement()?.goal}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <Progress 
                          value={Math.min(100, Math.round((findNextAchievement()?.progress || 0) / (findNextAchievement()?.goal || 1) * 100))} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="text-xs text-right mt-1 text-muted-foreground">
                        {Math.round((findNextAchievement()?.progress || 0) / (findNextAchievement()?.goal || 1) * 100)}% completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">All Achievements Completed!</h3>
                  <p className="text-muted-foreground mb-4">
                    Congratulations! You've completed all available achievements. Keep up the great work!
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </div>
    </MainLayout>
  );
}

// Stats card component
function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}