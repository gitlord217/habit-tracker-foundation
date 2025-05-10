import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, Clipboard, ArrowRight, BarChart3, Calendar, CheckCircle, Zap } from 'lucide-react';

export default function LandingPage() {
  // Track loading state for UI indications only
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user directly from auth hook
  const { user } = useAuth();
  
  console.log("Landing page using user from auth hook:", user);
  
  const [, navigate] = useLocation();
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/');
    } else {
      setShowAuthOptions(true);
    }
  };

  const handleLogin = () => {
    navigate('/auth?tab=login');
  };

  const handleSignup = () => {
    navigate('/auth?tab=register');
  };

  return (
    <div className="flex flex-col min-h-screen">
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
                      {user.username ? user.username.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) : "HV"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Welcome back!</span>
                  <span className="text-xs text-gray-500 font-medium">My account</span>
                </div>
              </div>
              <Button onClick={() => navigate('/')} variant="default" size="sm">
                Dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Avatar className="h-9 w-9 bg-gradient-to-br from-primary/20 to-primary/30 border-2 border-transparent">
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-medium">
                    {isLoading ? "..." : "HV"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Welcome!</span>
                  <span className="text-xs text-gray-500">Create an account</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleLogin} variant="ghost" size="sm">
                  Log in
                </Button>
                <Button onClick={handleSignup} variant="default" size="sm">
                  Sign up
                </Button>
              </div>
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