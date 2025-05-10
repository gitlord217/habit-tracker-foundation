import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * DirectAuth - A completely self-contained authentication component
 * This component handles login and registration directly without routing
 */
export default function DirectAuth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();
  const { login, register } = useAuth();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    setIsLoggingIn(true);
    
    login(values)
      .then(userData => {
        console.log("Login successful:", userData);
        
        // Update the user data in the cache
        queryClient.setQueryData(["/api/user"], userData);
        
        // Show success toast
        toast({
          title: "Welcome back!",
          description: `Good to see you again, ${userData.username.split(' ')[0]}!`,
        });
        
        // Call the success handler
        onAuthSuccess();
      })
      .catch(error => {
        console.error("Login error:", error);
        
        // Show error toast with the error message
        toast({
          title: "Login failed",
          description: error.message || "Invalid username or password. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  };
  
  // Handle registration form submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    setIsRegistering(true);
    
    register(values)
      .then(userData => {
        console.log("Registration successful:", userData);
        
        // Update user data in cache
        queryClient.setQueryData(["/api/user"], userData);
        
        // Show success toast
        toast({
          title: "Account created successfully! 🎉",
          description: `Welcome to HabitVault, ${userData.username.split(' ')[0]}!`,
        });
        
        // Call the success handler
        onAuthSuccess();
      })
      .catch(err => {
        console.error("Registration error:", err);
        setIsRegistering(false);
        
        // Show error toast
        toast({
          title: "Registration failed",
          description: err.message || "Could not create account. Please try again.",
          variant: "destructive",
        });
      });
  };
  
  return (
    <>
      <Toaster />
      <div className="flex min-h-screen items-center justify-center">
        <div className="container flex flex-col items-center justify-center px-4 py-8 md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
            <div className="absolute inset-0 bg-primary/80" />
            <div className="relative z-20 flex items-center text-lg font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-6 w-6"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              HabitVault
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  "HabitVault has transformed how I build and maintain positive habits. The analytics and tracking features have made all the difference in my daily routine."
                </p>
                <footer className="text-sm">Sarah Johnson</footer>
              </blockquote>
            </div>
          </div>
          <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {activeTab === "login" ? "Welcome back" : "Create an account"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "login" 
                    ? "Enter your credentials to sign in to your account"
                    : "Enter your information to create a new account"
                  }
                </p>
              </div>
              
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Card>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-2xl">Sign in</CardTitle>
                      <CardDescription>
                        Enter your credentials to access your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="your username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full" disabled={isLoggingIn}>
                            {isLoggingIn ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                              </>
                            ) : (
                              "Sign in"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <div className="text-sm text-muted-foreground text-center mt-2">
                        Don't have an account?{" "}
                        <a
                          href="#"
                          className="text-primary underline-offset-4 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab("register");
                          }}
                        >
                          Create an account
                        </a>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Registration Form */}
                <TabsContent value="register">
                  <Card>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-2xl">Create an account</CardTitle>
                      <CardDescription>
                        Enter your information to create a new account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="your username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your.email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full" disabled={isRegistering}>
                            {isRegistering ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                              </>
                            ) : (
                              "Create account"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <div className="text-sm text-muted-foreground text-center mt-2">
                        Already have an account?{" "}
                        <a
                          href="#"
                          className="text-primary underline-offset-4 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab("login");
                          }}
                        >
                          Sign in
                        </a>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}