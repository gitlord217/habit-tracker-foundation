import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { HabitsProvider } from "@/hooks/use-habits";
import ReminderManager from "@/components/reminder/ReminderManager";

// Import page components
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import HabitsPage from "@/pages/habits-page";
import AnalyticsPage from "@/pages/analytics-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import NotFound from "@/pages/not-found";

/**
 * Main application component with a simple, non-routing approach
 * This approach bypasses routing to avoid 404 errors
 */
function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("landing");
  
  // Handle navigation events from sidebar/mobile nav
  useEffect(() => {
    const handleNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<string | { page: string, params?: Record<string, string> }>;
      
      // Check if the detail is an object with page and params
      if (typeof customEvent.detail === 'object' && customEvent.detail !== null) {
        setCurrentPage(customEvent.detail.page);
        
        // If there are URL parameters, add them to the URL
        if (customEvent.detail.params) {
          const queryParams = new URLSearchParams();
          Object.entries(customEvent.detail.params).forEach(([key, value]) => {
            queryParams.append(key, value);
          });
          
          // Update URL without reloading the page
          const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
        }
      } else {
        // Legacy behavior for string values
        setCurrentPage(customEvent.detail as string);
      }
    };
    
    window.addEventListener('navigate', handleNavigation as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, []);
  
  // Handle page switching when auth state changes
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setCurrentPage(currentPage === "landing" || currentPage === "auth" ? "dashboard" : currentPage);
      } else if (currentPage !== "auth" && currentPage !== "landing") {
        setCurrentPage("landing");
      }
    }
  }, [user, isLoading, currentPage]);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    );
  }
  
  // Handle page rendering
  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onLoginClick={() => setCurrentPage("auth")} />;
      case "auth":
        return <AuthPage onLoginSuccess={() => setCurrentPage("dashboard")} />;
      case "dashboard":
        return user ? <DashboardPage onNavigate={setCurrentPage} /> : <LandingPage onLoginClick={() => setCurrentPage("auth")} />;
      case "habits":
        return user ? <HabitsPage onNavigate={setCurrentPage} /> : <LandingPage onLoginClick={() => setCurrentPage("auth")} />;
      case "analytics":
        return user ? <AnalyticsPage onNavigate={setCurrentPage} /> : <LandingPage onLoginClick={() => setCurrentPage("auth")} />;
      case "profile":
        return user ? <ProfilePage /> : <LandingPage onLoginClick={() => setCurrentPage("auth")} />;
      case "settings":
        return user ? <SettingsPage /> : <LandingPage onLoginClick={() => setCurrentPage("auth")} />;
      case "notfound":
        return <NotFound />;
      default:
        return <NotFound />;
    }
  };
  
  return (
    <ThemeProvider>
      <Toaster />
      {/* Include the ReminderManager (invisible component) to handle notifications */}
      {user && <ReminderManager />}
      {renderPage()}
    </ThemeProvider>
  );
}

/**
 * App component that provides all the necessary providers
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HabitsProvider>
          <MainApp />
        </HabitsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
