import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BarChartHorizontal, Calendar, Sparkles, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm flex flex-col items-center text-center sm:items-start sm:text-left">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="text-xl font-bold">HabitVault</span>
          </div>
          <Button onClick={onLoginClick}>Sign In</Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Build Better Habits, <br />
                <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
                  Achieve Your Goals
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-8">
                HabitVault helps you track, maintain, and analyze your daily habits so you can focus on consistent progress.
              </p>
              <div className="flex flex-row gap-4 justify-center">
                <Button size="lg" onClick={onLoginClick}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={onLoginClick}>Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section - Regular spacing */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to build and maintain positive habits in one simple application
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <FeatureCard 
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
                title="Habit Tracking"
                description="Create and manage custom habits with flexible scheduling options. Track daily progress and build consistency."
              />
              <FeatureCard 
                icon={<BarChartHorizontal className="h-10 w-10 text-blue-500" />}
                title="Detailed Analytics"
                description="Visualize your progress with beautiful charts and insights. Understand your patterns and improve your routine."
              />
              <FeatureCard 
                icon={<Sparkles className="h-10 w-10 text-yellow-500" />}
                title="Streak System"
                description="Stay motivated with streaks that track your consistency. Build momentum and celebrate milestones."
              />
              <FeatureCard 
                icon={<Calendar className="h-10 w-10 text-green-500" />}
                title="Calendar View"
                description="See your habit completion history at a glance. Review past performance and plan for the future."
              />
              <FeatureCard 
                icon={<svg className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>}
                title="Daily Motivation"
                description="Get inspired with daily motivational quotes and encouragement tailored to your progress."
              />
              <FeatureCard 
                icon={<svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>}
                title="Reminders & Notifications"
                description="Never forget your habits with customizable reminders. Stay on track with gentle nudges."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              <span className="font-semibold">HabitVault</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} HabitVault. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}