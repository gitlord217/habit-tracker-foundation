// Get the timeframe from a habit description
export function getHabitTimeframe(description: string): "daily" | "weekly" | "monthly" {
  const lowerCaseDesc = description?.toLowerCase() || "";
  if (lowerCaseDesc.includes("weekly")) return "weekly";
  if (lowerCaseDesc.includes("monthly")) return "monthly";
  return "daily"; // Default to daily if not specified
}