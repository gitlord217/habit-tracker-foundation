import { useHabits } from "@/hooks/use-habits";
import HabitCard from "./HabitCard";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";

interface HabitListProps {
  onAddClick: () => void;
}

export default function HabitList({ onAddClick }: HabitListProps) {
  const { todayCompletions, isLoading } = useHabits();
  
  // Calculate completion stats
  const todayStats = todayCompletions
    ? {
        total: todayCompletions.length,
        completed: todayCompletions.filter(item => item.completion?.completed).length,
      }
    : { total: 0, completed: 0 };
  
  if (isLoading) {
    return <HabitListSkeleton />;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today's Habits</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {formatDate(new Date())}
          </span>
          {todayCompletions && todayCompletions.length > 0 && (
            <span className="text-sm font-medium">
              {todayStats.completed}/{todayStats.total}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {todayCompletions && todayCompletions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {todayCompletions.map((item) => (
              <HabitCard 
                key={item.habit.id} 
                habit={item.habit} 
                completion={item.completion}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You don't have any habits yet.</p>
            <button
              onClick={onAddClick}
              className="flex items-center mx-auto text-primary hover:text-primary/80 transition-colors"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              <span>Add your first habit</span>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HabitListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 rounded-sm mr-3" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-6 w-16 rounded-md mr-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
