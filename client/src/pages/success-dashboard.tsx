import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

/**
 * This is a special dashboard page that's ONLY purpose is to 
 * successfully redirect after login.
 * It loads immediately when the user tries to access /success-dashboard
 * and then immediately redirects them to the actual dashboard
 */
export default function SuccessDashboard() {
  const { user } = useAuth();
  
  useEffect(() => {
    // Add a small delay to make sure everything is loaded
    const timeoutId = setTimeout(() => {
      // Navigate directly to dashboard, bypassing any router shenanigans
      document.location.href = "/dashboard";
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Login Successful!</h1>
      <p className="mb-8">Redirecting you to your dashboard...</p>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {user && (
        <p className="mt-4 text-muted-foreground">
          Welcome back, {user.username.split(' ')[0]}!
        </p>
      )}
    </div>
  );
}