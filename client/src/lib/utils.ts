import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, addDays, isSameDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "EEEE, MMMM d, yyyy");
  }
}

export function getShortDate(date: Date): string {
  return format(date, "MMM d");
}

export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

export const daysOfWeek = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export const everyDayValue = [0, 1, 2, 3, 4, 5, 6];
export const weekdaysValue = [1, 2, 3, 4, 5];
export const weekendsValue = [0, 6];

export function getDayTargetLabel(targetDays: number[]): string {
  if (arraysEqual(targetDays, everyDayValue)) {
    return "Every day";
  } else if (arraysEqual(targetDays, weekdaysValue)) {
    return "Weekdays";
  } else if (arraysEqual(targetDays, weekendsValue)) {
    return "Weekends";
  } else if (targetDays.length === 1) {
    const day = daysOfWeek.find(d => d.value === targetDays[0]);
    return day ? `Every ${day.label}` : "Custom";
  } else {
    return "Custom";
  }
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

export function calculateStreakColor(streak: number): string {
  if (streak >= 10) {
    return "bg-green-600 dark:bg-green-500";
  } else if (streak >= 5) {
    return "bg-green-500 dark:bg-green-600";
  } else if (streak >= 1) {
    return "bg-amber-500 dark:bg-amber-600";
  } else {
    return "bg-red-500 dark:bg-red-600";
  }
}
