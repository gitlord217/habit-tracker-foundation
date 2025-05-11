import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { useHabits } from "@/hooks/use-habits";

/**
 * HeatmapTester - A component to test the functionality of heatmap data
 * This helps verify that completion data is correctly reflected in the heatmap
 */
export default function HeatmapTester() {
  const { toast } = useToast();
  const { habits, toggleCompletion, isCompletionToggling } = useHabits();
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");
  
  // Get habits filtered by timeframe
  const filteredHabits = habits?.filter(habit => {
    const description = habit.description?.toLowerCase() || "";
    if (timeframe === "daily") {
      return !description.includes("weekly") && !description.includes("monthly");
    } else if (timeframe === "weekly") {
      return description.includes("weekly");
    } else if (timeframe === "monthly") {
      return description.includes("monthly");
    }
    return true;
  }) || [];

  // Create date offsets for testing different dates
  const getOffsetDates = () => {
    const today = new Date();
    
    if (timeframe === "daily") {
      return [
        { label: "Today", date: format(today, "yyyy-MM-dd") },
        { label: "Yesterday", date: format(addDays(today, -1), "yyyy-MM-dd") },
        { label: "2 days ago", date: format(addDays(today, -2), "yyyy-MM-dd") },
      ];
    } else if (timeframe === "weekly") {
      return [
        { label: "This week", date: format(today, "yyyy-MM-dd") },
        { label: "Last week", date: format(addWeeks(today, -1), "yyyy-MM-dd") },
        { label: "2 weeks ago", date: format(addWeeks(today, -2), "yyyy-MM-dd") },
      ];
    } else {
      return [
        { label: "This month", date: format(today, "yyyy-MM-dd") },
        { label: "Last month", date: format(addMonths(today, -1), "yyyy-MM-dd") },
        { label: "2 months ago", date: format(addMonths(today, -2), "yyyy-MM-dd") },
      ];
    }
  };

  // Handle toggling habit completion for testing
  const handleToggleCompletion = async (habitId: number, date: string) => {
    try {
      await toggleCompletion(habitId, date);
      
      // Dispatch a custom event to notify that a habit completion was updated
      window.dispatchEvent(new CustomEvent('habit-completion-updated', { 
        detail: { habitId, date } 
      }));
      
      toast({
        title: "Success",
        description: `Task completion updated for ${date}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task completion",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Heatmap Testing Tool</CardTitle>
        <CardDescription>
          Test completion of different tasks to verify heatmap updates
        </CardDescription>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="daily">Daily Tasks</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Tasks</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Tasks</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {filteredHabits.length > 0 ? (
          filteredHabits.map(habit => (
            <div key={habit.id} className="mb-4 border-b pb-3">
              <h3 className="text-lg font-medium mb-2">{habit.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {getOffsetDates().map((dateObj) => (
                  <Button 
                    key={`${habit.id}-${dateObj.date}`}
                    variant="outline"
                    disabled={isCompletionToggling}
                    onClick={() => handleToggleCompletion(habit.id, dateObj.date)}
                    className="justify-between"
                  >
                    <span>{dateObj.label}</span>
                    <span className="ml-2 text-xs opacity-70">
                      Mark {timeframe} completion
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No {timeframe} tasks found. Add tasks with "{timeframe}" in the description to test.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          After marking a task completion, check the heatmap to see if the color updates.
        </p>
      </CardFooter>
    </Card>
  );
}