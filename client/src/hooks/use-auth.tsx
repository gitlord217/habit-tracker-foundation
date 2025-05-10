import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type UserWithoutPassword = Omit<User, "password">;

type AuthContextType = {
  user: UserWithoutPassword | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<UserWithoutPassword, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<UserWithoutPassword, Error, RegisterData>;
  // Direct API methods
  login: (credentials: LoginData) => Promise<UserWithoutPassword>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<UserWithoutPassword>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
};

// Create a default context with proper mock implementations
const mockMutationBase = {
  isPending: false,
  isSuccess: false, 
  isError: false,
  error: null,
  data: undefined,
  mutate: () => {},
  mutateAsync: async () => { throw new Error("Not implemented"); },
  reset: () => {},
  context: undefined,
  failureCount: 0,
  failureReason: null,
  status: 'idle',
  variables: undefined,
  isIdle: true,
  submittedAt: 0,
};

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {
    ...mockMutationBase,
  } as UseMutationResult<UserWithoutPassword, Error, LoginData>,
  logoutMutation: {
    ...mockMutationBase,
  } as UseMutationResult<void, Error, void>,
  registerMutation: {
    ...mockMutationBase,
  } as UseMutationResult<UserWithoutPassword, Error, RegisterData>,
  // Default implementations for direct API methods
  login: async () => { throw new Error("Not implemented"); },
  logout: async () => { throw new Error("Not implemented"); },
  register: async () => { throw new Error("Not implemented"); },
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<UserWithoutPassword | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Simple direct API call functions to avoid the complexity of React Query mutations
  const login = async (credentials: LoginData) => {
    try {
      console.log("Logging in with credentials:", credentials);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      const userData = await res.json();
      console.log("Login successful:", userData);
      
      // First invalidate the query cache, then set the data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.setQueryData(["/api/user"], userData);
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.username}!`,
      });
      return userData;
    } catch (error) {
      toast({
        title: "Login failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log("Registering with data:", userData);
      
      // Show toast for registration attempt
      toast({
        title: "Creating account...",
        description: "Please wait while we set up your account.",
      });
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      const newUser = await res.json();
      
      // Update the user data in the query cache
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.setQueryData(["/api/user"], newUser);
      
      // Show success toast
      toast({
        title: "Registration successful! 🎉",
        description: `Welcome, ${newUser.username}! Your account has been created.`,
        duration: 5000,
      });
      
      // For debugging
      console.log("Registration successful:", newUser);
      
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });
      
      // Clear user data completely and invalidate all queries
      queryClient.clear();
      queryClient.setQueryData(["/api/user"], null);
      
      // Explicitly invalidate the user query to force a refresh
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create mock mutations that use our simpler functions
  const loginMutation = {
    mutate: login,
    isPending: false,
  } as unknown as UseMutationResult<UserWithoutPassword, Error, LoginData>;

  const registerMutation = {
    mutate: register,
    isPending: false,
  } as unknown as UseMutationResult<UserWithoutPassword, Error, RegisterData>;

  const logoutMutation = {
    mutate: logout,
    isPending: false,
  } as unknown as UseMutationResult<void, Error, void>;
  
  // Ensure context always has valid mutation objects
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Only render children when the context is fully initialized
  if (!initialized && isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        // Direct API methods
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
