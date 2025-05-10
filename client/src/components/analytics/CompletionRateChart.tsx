import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CompletionRateChartProps {
  data: {
    habitId: number;
    habitName: string;
    completionRate: number;
  }[];
  className?: string;
}

export default function CompletionRateChart({ data, className }: CompletionRateChartProps) {
  // Sort data by completion rate (highest first)
  const sortedData = [...data].sort((a, b) => b.completionRate - a.completionRate);
  
  // Function to get color based on completion rate
  const getColorClass = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-green-500";
    if (rate >= 40) return "bg-amber-500";
    if (rate >= 20) return "bg-amber-500";
    return "bg-red-500";
  };
  
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>Completion Rate by Habit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.length > 0 ? (
            sortedData.map((item) => (
              <div key={item.habitId}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.habitName}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${getColorClass(item.completionRate)} h-2 rounded-full`}
                    style={{ width: `${item.completionRate}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Complete some habits to see your progress</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
