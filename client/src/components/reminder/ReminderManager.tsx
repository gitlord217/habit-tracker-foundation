import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAppSettings } from '@/hooks/use-app-settings';
import { 
  scheduleHabitReminder, 
  requestNotificationPermission, 
  getNotificationPermission 
} from '@/lib/notification-service';

/**
 * ReminderManager - A component that manages habit reminders based on user settings
 * This doesn't render any visible UI but handles reminder scheduling in the background
 */
export default function ReminderManager() {
  const { user } = useAuth();
  const [appSettings] = useAppSettings();
  const reminderTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up reminders based on user settings
  useEffect(() => {
    if (!user) return;
    
    const setupReminders = async () => {
      // Clear existing reminder
      if (reminderTimerRef.current) {
        clearTimeout(reminderTimerRef.current);
        reminderTimerRef.current = null;
      }
      
      // If reminders are enabled, request permission and schedule
      if (appSettings.reminderEnabled) {
        // Only request permission if it's not already granted
        if (getNotificationPermission() !== 'granted') {
          const permissionGranted = await requestNotificationPermission();
          
          if (!permissionGranted) {
            console.warn('Notification permission denied');
            return;
          }
        }
        
        // Schedule the reminder with the user's preferred time
        reminderTimerRef.current = scheduleHabitReminder(
          true,
          appSettings.reminderTime,
          user.username
        );
      }
    };
    
    setupReminders();
    
    // Clean up timer on unmount
    return () => {
      if (reminderTimerRef.current) {
        clearTimeout(reminderTimerRef.current);
      }
    };
  }, [user, appSettings.reminderEnabled, appSettings.reminderTime]);
  
  // No visible UI
  return null;
}