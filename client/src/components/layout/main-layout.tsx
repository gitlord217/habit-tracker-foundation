import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  CheckSquare,
  BarChart2,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function MainLayout({
  children,
  title,
  onNavigate,
  currentPage,
}: MainLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Navigation items
  const navigationItems = [
    { name: "Dashboard", icon: <Home className="h-5 w-5" />, id: "dashboard" },
    { name: "Habits", icon: <CheckSquare className="h-5 w-5" />, id: "habits" },
    { name: "Analytics", icon: <BarChart2 className="h-5 w-5" />, id: "analytics" },
    { name: "Profile", icon: <User className="h-5 w-5" />, id: "profile" },
    { name: "Settings", icon: <Settings className="h-5 w-5" />, id: "settings" },
  ];
  
  const handleNavigation = (page: string) => {
    setIsSheetOpen(false);
    onNavigate(page);
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px] pr-0">
                <div className="px-2 py-6 flex flex-col h-full">
                  <div className="flex items-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-6 w-6 text-primary"
                    >
                      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    <span className="text-xl font-bold">HabitVault</span>
                  </div>
                  
                  <nav className="flex-1 space-y-2">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={currentPage === item.id ? "default" : "ghost"}
                        size="lg"
                        className={`w-full justify-start ${
                          currentPage === item.id
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                        onClick={() => handleNavigation(item.id)}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </Button>
                    ))}
                  </nav>
                  
                  <div className="border-t pt-6 mt-6">
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="ml-3">Logout</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Logo */}
            <div className="flex items-center gap-2">
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
              <span className="font-bold text-xl hidden md:inline-block">HabitVault</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:items-center lg:space-x-1 ml-6">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className={currentPage === item.id ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => onNavigate(item.id)}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-0 h-9 w-9 overflow-hidden rounded-full">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 bg-muted/40">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HabitVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}