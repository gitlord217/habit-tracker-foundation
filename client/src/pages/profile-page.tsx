import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import UserProfileForm from "@/components/profile/UserProfileForm";
import UserSummary from "@/components/profile/UserSummary";
import NewHeatmapComponent from "@/components/profile/NewHeatmapComponent";
import HeatmapTester from "@/components/profile/HeatmapTester";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("summary");
  
  // Check URL for tab parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === "achievements") {
      setActiveTab("summary");
    }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <MobileNav />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-16 md:pb-0">
          <div className="py-6">
            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-8">
              <div className="flex items-center mb-4">
                <button 
                  className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))}
                  aria-label="Back to dashboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  My Profile
                </h1>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                View your statistics, achievements, and manage your profile information.
              </p>
            </div>
            
            {/* Profile Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* User summary content */}
              {activeTab === "summary" && (
                <UserSummary initialTab={new URLSearchParams(window.location.search).get('tab') === "achievements" ? "achievements" : "stats"} />
              )}
              
              {/* Heatmap content */}
              {activeTab === "heatmap" && (
                <>
                  <NewHeatmapComponent userId={user.id} />
                  <HeatmapTester />
                </>
              )}
              
              {/* Settings content */}
              {activeTab === "settings" && (
                <UserProfileForm />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}