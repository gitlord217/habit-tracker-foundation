import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface WeeklyTrendChartProps {
  data: {
    date: string;
    completionRate: number;
  }[];
  className?: string;
}

export default function WeeklyTrendChart({ data, className }: WeeklyTrendChartProps) {
  // Calculate the average completion rate
  const avgCompletionRate = data.length > 0
    ? Math.round(data.reduce((acc, item) => acc + item.completionRate, 0) / data.length)
    : 0;
  
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>Weekly Completion Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <>
            <div className="h-56 flex items-end space-x-2">
              {data.map((item) => {
                const day = item.date ? format(parseISO(item.date), "EEE") : "";
                const heightPercentage = `${item.completionRate}%`;
                
                return (
                  <div key={item.date} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-primary w-full rounded-t-md"
                      style={{ height: heightPercentage }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2" />
                    <span>This Week: {avgCompletionRate}% Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-56 flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
