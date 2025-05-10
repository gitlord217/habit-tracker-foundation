import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, CheckSquare, BarChart3, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/habits", label: "My Habits", icon: CheckSquare },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/profile", label: "My Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const footerItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/habits", icon: CheckSquare, label: "Habits" },
    { path: "/analytics", icon: BarChart3, label: "Stats" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-lg font-bold text-primary cursor-pointer">HabitVault</h1>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold text-primary">HabitVault</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <a 
                      className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                        location === item.path 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Mobile Footer Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
        <div className="flex justify-around py-3">
          {footerItems.map((item, index) => {
            const Icon = item.icon;
            // Check if this is the profile tab
            const isProfileTab = item.path === "/profile";
            
            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex flex-col items-center ${
                  location === item.path ? "text-primary" : "text-gray-500 dark:text-gray-400"
                }`}>
                  {isProfileTab && user ? (
                    <div className={`relative rounded-full ${location === item.path ? "ring-2 ring-primary" : ""}`}>
                      <Avatar className="h-6 w-6">
                        {user.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={user.username} />
                        ) : (
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                  <span className="text-xs mt-1">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
