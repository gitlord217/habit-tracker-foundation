import { useState } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronRight, 
  Clipboard, 
  LogOut, 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [, navigate] = useLocation();
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Get user directly from auth context
  const { user } = useAuth();
  
  // If user is logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const handleGetStarted = () => {
    // For non-logged in users, show auth options
    setShowAuthOptions(true);
  };

  const handleLogin = () => {
    navigate('/auth?tab=login');
  };

  const handleSignup = () => {
    navigate('/auth?tab=register');
  };
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setUser(null);
        setShowLogoutDialog(false);
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (user && user.username) {
      return user.username
        .split(' ')
        .map((part: string) => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return "HV";
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Navigation overlay to prevent flicker */}
      {isNavigating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-t-2 border-primary rounded-full"></div>
        </div>
      )}
      
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <Clipboard className="h-6 w-6 mr-2 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            HabitVault
          </span>
        </div>
        <nav className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Avatar className="h-9 w-9 border-2 border-transparent hover:border-primary transition-all">
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.username || 'User'} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Welcome back!</span>
                  <span className="text-xs text-gray-500 font-medium">My account</span>
                </div>
              </div>
              
              {/* Logout button */}
              <Button 
                onClick={() => setShowLogoutDialog(true)} 
                variant="outline" 
                size="sm"
                className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
              
              {/* Logout confirmation dialog */}
              <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-center">
                      Are you sure you want to log out?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                      You will be redirected to the login page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-center gap-2 mt-2">
                    <AlertDialogCancel className="sm:mt-0">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging out...
                        </span>
                      ) : "Logout"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            // When not logged in, just show login/signup buttons
            <div className="flex space-x-2">
              <Button onClick={handleLogin} variant="ghost" size="sm">
                Log in
              </Button>
              <Button onClick={handleSignup} variant="default" size="sm">
                Sign up
              </Button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-10 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Track Your Habits, Build Better Routines
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                HabitVault helps you develop positive habits, track your progress, and achieve your goals with powerful analytics and reminders.
              </p>
              
              {showAuthOptions ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleLogin} variant="outline" size="lg">
                    Log in
                  </Button>
                  <Button onClick={handleSignup} size="lg">
                    Create Account
                  </Button>
                </div>
              ) : (
                <Button onClick={handleGetStarted} size="lg" className="mb-4">
                  Get Started <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              
              <div className="flex items-center mt-4 text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>Free to use • No credit card required</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Why Choose HabitVault?</h3>
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">HV</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 bg-primary/10 p-2 rounded-md">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Detailed Analytics</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress with beautiful charts and statistics.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 bg-primary/10 p-2 rounded-md">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Daily Reminders</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Never forget your habits with smart notification system.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 bg-primary/10 p-2 rounded-md">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Streak Tracking</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Build consistent streaks and never break the chain.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Three simple steps to transform your daily routine and build lasting habits.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create Your Habits</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Add the habits you want to build, set frequency and reminders.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Track Daily Progress</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check off completed habits and build your daily streak.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Analyze & Improve</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Review your analytics to see progress and make improvements.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Better Habits?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of users who are transforming their lives one habit at a time.
            </p>
            <Button onClick={handleSignup} size="lg">Get Started for Free</Button>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800/50 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Clipboard className="h-5 w-5 mr-2 text-primary" />
            <span className="font-bold text-gray-800 dark:text-white">HabitVault</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} HabitVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}