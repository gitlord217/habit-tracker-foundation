// Check if browser notifications are supported
const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Browser notifications are not supported');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check notification permission status
export const getNotificationPermission = (): NotificationPermission | null => {
  if (!isNotificationSupported()) {
    return null;
  }
  
  return Notification.permission;
};

// Send a browser notification
export const sendNotification = (title: string, options?: NotificationOptions): Notification | null => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }
  
  return new Notification(title, options);
};

// Calculate time until next reminder
export const scheduleReminder = (time: string, callback: () => void): NodeJS.Timeout | null => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time format. Expected HH:MM');
      return null;
    }
    
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // If reminder time has already passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    return setTimeout(callback, timeUntilReminder);
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return null;
  }
};

// Schedule a habit reminder
export const scheduleHabitReminder = (
  enabled: boolean,
  time: string,
  username: string = 'there'
): NodeJS.Timeout | null => {
  if (!enabled) return null;
  
  const sendHabitReminder = () => {
    sendNotification('HabitVault Reminder', {
      body: `Hey ${username}! Don't forget to complete your habits for today.`,
      icon: '/favicon.ico',
    });
    
    // Schedule the next reminder for tomorrow
    scheduleHabitReminder(enabled, time, username);
  };
  
  return scheduleReminder(time, sendHabitReminder);
};