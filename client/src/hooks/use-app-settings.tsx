import { useState, useEffect } from "react";

interface AppSettings {
  compactView: boolean;
  timeRange: "week" | "month" | "year";
  reminderEnabled: boolean;
  reminderTime: string;
  emailNotifications: boolean;
}

export function useAppSettings(): [AppSettings, (key: keyof AppSettings, value: any) => void] {
  const [settings, setSettings] = useState<AppSettings>({
    compactView: localStorage.getItem("app-compactView") === "true",
    timeRange: (localStorage.getItem("heatmap-range") || "month") as "week" | "month" | "year",
    reminderEnabled: localStorage.getItem("app-reminderEnabled") === "true",
    reminderTime: localStorage.getItem("app-reminderTime") || "18:00",
    emailNotifications: localStorage.getItem("app-emailNotifications") === "true",
  });

  // Listen for settings changes from other components
  useEffect(() => {
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Partial<AppSettings>>;
      
      if (customEvent.detail) {
        setSettings(prev => ({
          ...prev,
          ...customEvent.detail
        }));
      }
    };

    window.addEventListener('settings-updated', handleSettingsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate as EventListener);
    };
  }, []);
  
  // Update settings
  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Store in localStorage
    if (key === 'timeRange') {
      localStorage.setItem("heatmap-range", value);
    } else {
      localStorage.setItem(`app-${key}`, value.toString());
    }
  };
  
  return [settings, updateSetting];
}