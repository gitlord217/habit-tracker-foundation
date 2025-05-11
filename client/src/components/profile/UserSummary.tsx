import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useHabits } from "@/hooks/use-habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarIcon, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  Clock, 
  Zap, 
  BookOpen, 
  Star,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Trophy
} from "lucide-react";
import { format } from "date-fns";

interface UserSummaryProps {
  initialTab?: 'stats' | 'achievements';
}

export default function UserSummary({ initialTab = 'stats' }: UserSummaryProps) {
  const { user } = useAuth();
  const { habits, completionRates, todayCompletions, isLoading } = useHabits();
  const [showAchievementHistory, setShowAchievementHistory] = useState(false);
  
  // Calculate overall completion rate
  const calculateOverallCompletionRate = () => {
    if (!completionRates || completionRates.length === 0) return 0;
    const total = completionRates.reduce((sum, item) => sum + item.completionRate, 0);
    return Math.round(total / completionRates.length);
  };
  
  // Calculate today's completion rate
  const calculateTodayCompletionRate = () => {
    if (!todayCompletions || todayCompletions.length === 0) return 0;
    const completed = todayCompletions.filter(tc => tc.completion?.completed).length;
    return Math.round((completed / todayCompletions.length) * 100);
  };
  
  // Find highest streak
  const findHighestStreak = () => {
    if (!habits || habits.length === 0) return 0;
    return Math.max(...habits.map(habit => habit.longestStreak));
  };
  
  // Define achievement type
  interface Achievement {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    completedDate?: Date | null;
    icon: React.ReactNode;
  }
  
  // Get completed achievements
  const getCompletedAchievements = (): Achievement[] => {
    // Define all achievements
    const isHabitMasterComplete = calculateOverallCompletionRate() >= 7;
    const isConsistencyChampionComplete = findHighestStreak() >= 14;
    const isHabitCollectorComplete = (habits?.length || 0) >= 5;
    const isPerfectWeekComplete = calculateOverallCompletionRate() === 100;
    
    const allAchievements: Achievement[] = [
      {
        id: 1,
        title: "Habit Master",
        description: "Completed all habits for 7 consecutive days",
        completed: isHabitMasterComplete,
        completedDate: isHabitMasterComplete ? new Date() : null,
        icon: <Zap className="h-5 w-5 text-yellow-500" />
      },
      {
        id: 2,
        title: "Consistency Champion",
        description: "Reached a 14-day streak on any habit",
        completed: isConsistencyChampionComplete,
        completedDate: isConsistencyChampionComplete ? new Date() : null,
        icon: <Award className="h-5 w-5 text-purple-500" />
      },
      {
        id: 3,
        title: "Habit Collector",
        description: "Track 5 or more habits simultaneously",
        completed: isHabitCollectorComplete,
        completedDate: isHabitCollectorComplete ? new Date() : null,
        icon: <BookOpen className="h-5 w-5 text-cyan-500" />
      },
      {
        id: 4,
        title: "Perfect Week",
        description: "100% completion for an entire week",
        completed: isPerfectWeekComplete,
        completedDate: isPerfectWeekComplete ? new Date() : null,
        icon: <Star className="h-5 w-5 text-orange-500" />
      }
    ];
    
    // Filter to get only completed achievements
    return allAchievements.filter(a => a.completed);
  };
  
  // Count completed achievements
  const countCompletedAchievements = () => {
    return getCompletedAchievements().length;
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return "U";
    
    const words = user.username.split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
  };
  
  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.profileImage || ""} />
            <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col flex-grow">
            <CardTitle className="text-2xl">{user?.username || "User"}</CardTitle>
            <div className="text-sm text-muted-foreground mt-1">{user?.email}</div>
            <div className="text-sm text-muted-foreground">Member since {format(new Date(user?.createdAt || new Date()), "MMMM yyyy")}</div>
            {user?.bio && <div className="mt-2 text-sm">{user.bio}</div>}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="stats" className="flex-1">Stats Summary</TabsTrigger>
            <TabsTrigger value="achievements" className="flex-1">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                title="Today"
                value={`${calculateTodayCompletionRate()}%`}
                description="Daily completion"
                isLoading={isLoading}
              />
              
              <StatCard 
                icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
                title="Overall"
                value={`${calculateOverallCompletionRate()}%`}
                description="Average completion"
                isLoading={isLoading}
              />
              
              <StatCard 
                icon={<Award className="h-5 w-5 text-amber-500" />}
                title="Streak"
                value={findHighestStreak().toString()}
                description="Highest streak"
                isLoading={isLoading}
              />
              
              <StatCard 
                icon={<CalendarIcon className="h-5 w-5 text-indigo-500" />}
                title="Tracking"
                value={habits?.length?.toString() || "0"}
                description="Active habits"
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="achievements">
            {showAchievementHistory ? (
              <div className="space-y-4">
                <div className="flex items-center mb-2">
                  <button 
                    className="flex items-center text-primary hover:text-primary/80"
                    onClick={() => setShowAchievementHistory(false)}
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    <span>Back to Achievements</span>
                  </button>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Achievement History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getCompletedAchievements().length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6">
                        <Trophy className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-center">Empty History</h3>
                        <p className="text-sm text-muted-foreground text-center mt-2">
                          You haven't completed any achievements yet. Keep going!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getCompletedAchievements().map((achievement) => (
                          <div key={achievement.id} className="flex items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="bg-primary/10 p-2 rounded-md mr-3">
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{achievement.title}</h4>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {achievement.completedDate ? format(achievement.completedDate, 'MMM d, yyyy') : 'Completed'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                <Card className="mb-4">
                  <CardContent className="py-3 px-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">History of Completed Achievements</h3>
                        <span className="text-sm font-medium text-emerald-500">{countCompletedAchievements()}</span>
                      </div>
                      <button
                        className="flex items-center text-primary hover:text-primary/80 achievement-history-toggle"
                        onClick={() => setShowAchievementHistory(true)}
                      >
                        <span className="mr-1">View History</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AchievementCard 
                    title="Habit Master"
                    description="Completed all habits for 7 consecutive days"
                    completed={calculateOverallCompletionRate() >= 7}
                    progress={calculateOverallCompletionRate()}
                    goal={7}
                    icon={<Zap className="h-5 w-5 text-yellow-500" />}
                  />
                  
                  <AchievementCard 
                    title="Consistency Champion"
                    description="Reached a 14-day streak on any habit"
                    completed={findHighestStreak() >= 14}
                    progress={findHighestStreak()}
                    goal={14}
                    icon={<Award className="h-5 w-5 text-purple-500" />}
                  />
                  
                  <AchievementCard 
                    title="Habit Collector"
                    description="Track 5 or more habits simultaneously"
                    completed={(habits?.length || 0) >= 5}
                    progress={habits?.length || 0}
                    goal={5}
                    icon={<BookOpen className="h-5 w-5 text-cyan-500" />}
                  />
                  
                  <AchievementCard 
                    title="Perfect Week"
                    description="100% completion for an entire week"
                    completed={calculateOverallCompletionRate() === 100}
                    progress={calculateOverallCompletionRate()}
                    goal={100}
                    icon={<Star className="h-5 w-5 text-orange-500" />}
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  isLoading: boolean;
}

function StatCard({ icon, title, value, description, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="text-sm font-medium">{title}</div>
            {isLoading ? (
              <Skeleton className="h-7 w-14 mt-1" />
            ) : (
              <div className="text-2xl font-bold">{value}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AchievementCardProps {
  title: string;
  description: string;
  completed: boolean;
  progress: number;
  goal: number;
  icon?: React.ReactNode; // Optional icon prop
}

function AchievementCard({ title, description, completed, progress, goal, icon }: AchievementCardProps) {
  const progressPercent = Math.min(100, Math.round((progress / goal) * 100));
  
  // Default icon if none provided
  const defaultIcon = completed ? <Award className="h-5 w-5" /> : <Clock className="h-5 w-5" />;
  
  return (
    <Card className={`achievement-card ${completed ? "border-amber-500 dark:border-amber-700" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            completed 
              ? "bg-amber-100 dark:bg-amber-900" 
              : "bg-gray-100 dark:bg-gray-800"
          }`}>
            {icon || defaultIcon}
          </div>
          
          <div className="flex-grow">
            <div className="text-sm font-medium flex items-center gap-2">
              {title}
              {completed && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
            <div className="text-xs text-muted-foreground">{description}</div>
            
            <div className="mt-2 bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full">
              <div 
                className={`h-full rounded-full ${
                  completed 
                    ? "bg-amber-500 dark:bg-amber-600" 
                    : "bg-blue-500 dark:bg-blue-600"
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {progress} / {goal}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}