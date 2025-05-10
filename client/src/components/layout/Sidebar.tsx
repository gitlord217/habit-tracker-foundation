import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/context/ThemeProvider";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { BarChart3, CheckSquare, Home, LogOut, Settings, User } from "lucide-react";

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { path: "/habits", label: "My Habits", icon: <CheckSquare className="h-5 w-5" /> },
    { path: "/analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { path: "/profile", label: "My Profile", icon: <User className="h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
            <h1 className="text-xl font-bold text-primary">HabitVault</h1>
          </div>
          
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    location === item.path
                      ? "text-primary-foreground bg-primary"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <Link href="/profile">
                <a className="relative group">
                  <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary transition-all">
                    {user?.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={user.username} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {user?.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </a>
              </Link>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.username}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
            <Switch 
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
