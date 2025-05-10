import { useAuth } from '@/hooks/use-auth';
import { Redirect, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Clipboard, Calendar, ChevronRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  
  const handleLogin = () => {
    navigate('/auth?tab=login');
  };
  
  const handleSignup = () => {
    navigate('/auth?tab=register');
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Clipboard className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 text-transparent bg-clip-text">HabitVault</span>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleLogin} variant="ghost" size="sm">
            Log in
          </Button>
          <Button onClick={handleSignup} variant="default" size="sm">
            Sign up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Build Better Habits, <span className="bg-gradient-to-r from-primary to-indigo-500 text-transparent bg-clip-text">One Day at a Time</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Track, visualize, and build consistency with a habit tracking system 
            designed to help you achieve your goals.
          </p>
          <div>
            <Button size="lg" onClick={handleSignup} className="text-lg px-8 py-6">
              Get Started <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center mt-4 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Free to use • No credit card required</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Today's Habits</h3>
                <span className="text-sm text-gray-500">May 10, 2025</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Morning Meditation</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">15 minutes • Daily</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">21 day streak</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4">
                      <div className="h-5 w-5 rounded-sm border-2 border-gray-400 dark:border-gray-500"></div>
                    </div>
                    <div>
                      <h4 className="font-medium">Read a Book</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">30 minutes • Weekdays</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">7 day streak</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Drink Water</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">2 liters • Daily</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">30 day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features to Build Lasting Habits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Daily Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simple check-in system to mark habits as complete each day, with support for different schedules.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="text-primary font-bold">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Streak Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Build momentum with visual streak counters that show your current and longest streaks.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="text-primary font-bold">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Insightful Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualize your progress with heatmaps, charts, and statistics that highlight your consistency.
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

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Clipboard className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">HabitVault</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} HabitVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}