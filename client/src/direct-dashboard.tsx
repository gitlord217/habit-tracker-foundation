import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useHabits } from "@/hooks/use-habits";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HabitsProvider } from "@/hooks/use-habits";
import { getTodaysQuote } from "@/lib/quotes";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle, LogOut, Settings, User, BarChart, List } from "lucide-react";

/**
 * DirectDashboard - A completely self-contained dashboard component
 * This component renders the dashboard directly without any routing
 */
export default function DirectDashboard() {
  const { user, isLoading, logoutMutation } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>User not authenticated. Redirecting...</div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <Toaster />
      <HabitsProvider>
        <DashboardContent user={user} onLogout={() => logoutMutation.mutate()} />
      </HabitsProvider>
    </TooltipProvider>
  );
}

function DashboardContent({ user, onLogout }: { user: any, onLogout: () => void }) {
  const { todayCompletions, isLoading, toggleCompletion } = useHabits();
  const [todaysQuote] = useState(getTodaysQuote());
  const todayDate = new Date();
  
  function calculateCompletionRate(): number {
    if (!todayCompletions || todayCompletions.length === 0) return 0;
    
    const completed = todayCompletions.filter(item => item.completion?.completed).length;
    return Math.round((completed / todayCompletions.length) * 100);
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="font-bold text-xl text-primary">HabitVault</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{user.username}</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImage || ""} alt={user.username} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Welcome Section */}
          <section>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">{formatDate(todayDate)}</p>
            
            <Card className="mt-4 bg-gradient-to-br from-primary/10 to-primary/5 border-none">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium">Today's Quote</p>
                    <blockquote className="mt-1 italic">"{todaysQuote.text}"</blockquote>
                    <p className="text-xs text-muted-foreground mt-1">— {todaysQuote.author}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center space-x-2">
                      <div className="text-4xl font-bold">{calculateCompletionRate()}%</div>
                      <div className="text-sm text-muted-foreground">
                        <div>Daily Completion</div>
                        <div>Keep it up!</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          
          <Separator />
          
          {/* Today's Habits */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Today's Habits</h2>
              <Button variant="outline" size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Add New Habit
              </Button>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(n => (
                  <Card key={n} className="h-40 animate-pulse bg-muted/50">
                    <CardContent className="p-6">
                      <div className="h-4 w-3/4 bg-muted rounded mt-2"></div>
                      <div className="h-4 w-1/2 bg-muted rounded mt-4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : todayCompletions && todayCompletions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayCompletions.map(({ habit, completion }) => (
                  <Card key={habit.id} className={completion?.completed ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle>{habit.name}</CardTitle>
                      <CardDescription>{habit.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button 
                        variant={completion?.completed ? "default" : "outline"}
                        onClick={() => toggleCompletion(habit.id)}
                        className="w-full"
                      >
                        {completion?.completed ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completed
                          </>
                        ) : (
                          "Mark as Complete"
                        )}
                      </Button>
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
                  <h3 className="font-semibold text-lg mb-2">No habits for today</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any habits yet. Start building better habits today!
                  </p>
                  <Button>
                    Create your first habit
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}