import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import UserProfileForm from "@/components/profile/UserProfileForm";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

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
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                My Profile
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your personal information and customize your profile.
              </p>
            </div>
            
            {/* Profile Form */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <UserProfileForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}