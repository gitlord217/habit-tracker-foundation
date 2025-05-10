import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useHabits } from '@/hooks/use-habits';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import { getTodaysQuote } from '@/lib/quotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, Plus, Calendar, BarChart2 } from 'lucide-react';

export default function DashboardDirect() {
  const { user, isLoading: authLoading } = useAuth();
  const { habits, todayCompletions, isLoading: habitsLoading, toggleCompletion } = useHabits();
  
  // If user isn't loaded yet, show loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If user isn't logged in, redirect to auth page
  if (!user) {
    // Use direct redirection to auth page without router - force a hard redirect
    window.location.replace('/auth');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="ml-2">Redirecting to login...</p>
      </div>
    );
  }
  
  // Get today's quote
  const quote = getTodaysQuote();
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Welcome, {user.username.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Track your habits and build consistency.</p>
          </div>
          
          {/* Quote Card */}
          <Card className="border-none bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <blockquote className="italic text-lg">"{quote.text}"</blockquote>
              <p className="mt-2 text-sm text-right font-medium">— {quote.author}</p>
            </CardContent>
          </Card>
          
          {/* Today's Habits */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Today's Habits</h2>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/habits'}>
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </div>
            
            {habitsLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : todayCompletions?.length === 0 ? (
              <Card className="bg-muted/40">
                <CardContent className="pt-6 px-6 text-center">
                  <div className="py-6 text-center space-y-3">
                    <h3 className="text-lg font-medium">No habits to track yet</h3>
                    <p className="text-muted-foreground">Start by creating your first habit to track!</p>
                    <Button className="mt-2" onClick={() => window.location.href = '/habits'}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Habit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {todayCompletions?.map(({ habit, completion }) => (
                  <Card key={habit.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{habit.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Current streak: {habit.currentStreak} days</p>
                          <p className="text-sm text-muted-foreground">Best streak: {habit.longestStreak} days</p>
                        </div>
                        <Button 
                          size="icon" 
                          variant={completion?.completed ? "default" : "outline"}
                          onClick={() => toggleCompletion(habit.id)}
                          className={completion?.completed ? "bg-primary hover:bg-primary" : ""}
                        >
                          <Check className={`h-5 w-5 ${completion?.completed ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Links */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-auto flex-col items-start p-4 gap-3" 
              onClick={() => window.location.href = '/habits'}
            >
              <Calendar className="h-8 w-8 text-primary" />
              <div className="text-left">
                <div className="font-medium">View All Habits</div>
                <p className="text-sm text-muted-foreground">Manage your habit tracking</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col items-start p-4 gap-3"
              onClick={() => window.location.href = '/analytics'}
            >
              <BarChart2 className="h-8 w-8 text-primary" />
              <div className="text-left">
                <div className="font-medium">Analytics</div>
                <p className="text-sm text-muted-foreground">Track your progress over time</p>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}