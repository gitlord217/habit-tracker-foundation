import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BarChartHorizontal, Calendar, Sparkles, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
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
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 space-y-6 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Build Better Habits, <br />
                  <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
                    Achieve Your Goals
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  HabitVault helps you track, maintain, and analyze your daily habits so you can focus on consistent progress.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button size="lg" onClick={onLoginClick}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={onLoginClick}>Learn More</Button>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="w-full h-[400px] bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-3/4">
                      <Card className="bg-background/90 backdrop-blur-sm border-primary/20">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <div>
                            <h3 className="font-medium">Daily Meditation</h3>
                            <p className="text-sm text-muted-foreground">Streak: 8 days</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/90 backdrop-blur-sm">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <div>
                            <h3 className="font-medium">Morning Run</h3>
                            <p className="text-sm text-muted-foreground">Streak: 5 days</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/90 backdrop-blur-sm">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <BarChartHorizontal className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3 className="font-medium">85% Completion</h3>
                            <p className="text-sm text-muted-foreground">This week</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/90 backdrop-blur-sm">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <Calendar className="h-8 w-8 text-orange-500" />
                          <div>
                            <h3 className="font-medium">All Habits</h3>
                            <p className="text-sm text-muted-foreground">Track progress</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to build and maintain positive habits in one simple application
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {/* Testimonials Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of people who have transformed their lives with HabitVault
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <blockquote className="flex-1 italic text-muted-foreground mb-4">
                      "HabitVault has completely changed how I approach my daily routine. The streak system keeps me motivated, and the analytics help me understand my patterns."
                    </blockquote>
                    <div className="mt-auto">
                      <p className="font-semibold">Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">Product Designer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <blockquote className="flex-1 italic text-muted-foreground mb-4">
                      "As someone who struggled with consistency, this app has been a game-changer. I've maintained my reading habit for over 3 months now!"
                    </blockquote>
                    <div className="mt-auto">
                      <p className="font-semibold">Michael Chen</p>
                      <p className="text-sm text-muted-foreground">Software Engineer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <blockquote className="flex-1 italic text-muted-foreground mb-4">
                      "The clean interface and motivational quotes keep me coming back. I love seeing my progress visually in the analytics dashboard."
                    </blockquote>
                    <div className="mt-auto">
                      <p className="font-semibold">Jessica Martinez</p>
                      <p className="text-sm text-muted-foreground">Fitness Coach</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Habits?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of users who have improved their lives with HabitVault. Start building better habits today.
            </p>
            <Button size="lg" onClick={onLoginClick}>
              Get Started For Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
                className="h-6 w-6 text-primary"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              <span className="text-xl font-bold">HabitVault</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HabitVault. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}