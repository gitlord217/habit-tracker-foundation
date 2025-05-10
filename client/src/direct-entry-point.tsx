import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import DirectAuth from "./direct-auth";
import DirectDashboard from "./direct-dashboard";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing-page-new";

/**
 * DirectEntryPoint - A completely self-contained application component
 * This component bypasses routing entirely by handling all navigation internally
 */
export default function DirectEntryPoint() {
  const { user, isLoading } = useAuth();
  const [view, setView] = useState<"landing" | "auth" | "dashboard">("landing");
  
  // Update view based on authentication state
  useEffect(() => {
    if (isLoading) return;
    
    if (user) {
      setView("dashboard");
    } else {
      // Check current view
      if (view !== "landing" && view !== "auth") {
        setView("landing");
      }
    }
  }, [user, isLoading]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Render appropriate view based on state
  return (
    <TooltipProvider>
      <Toaster />
      {view === "landing" && (
        <div>
          <LandingPage />
          <div className="fixed bottom-4 right-4">
            <button 
              onClick={() => setView("auth")}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md shadow-md"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}
      
      {view === "auth" && (
        <DirectAuth 
          onAuthSuccess={() => setView("dashboard")} 
        />
      )}
      
      {view === "dashboard" && (
        <DirectDashboard />
      )}
    </TooltipProvider>
  );
}