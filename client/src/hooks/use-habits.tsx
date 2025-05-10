import { createContext, ReactNode, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Habit, InsertHabit, HabitCompletion } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface HabitsContextProps {
  habits: Habit[] | undefined;
  todayCompletions: {habit: Habit, completion?: HabitCompletion}[] | undefined;
  isLoading: boolean;
  createHabit: (habit: Omit<InsertHabit, 'userId'>) => Promise<Habit>;
  updateHabit: (id: number, habit: Partial<Habit>) => Promise<Habit>;
  deleteHabit: (id: number) => Promise<void>;
  toggleCompletion: (habitId: number, date?: string, completed?: boolean) => Promise<HabitCompletion>;
  completionRates: {habitId: number, habitName: string, completionRate: number}[] | undefined;
  weeklyTrend: {date: string, completionRate: number}[] | undefined;
  isCompletionToggling: boolean;
}

const HabitsContext = createContext<HabitsContextProps | undefined>(undefined);

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // Fetch all habits
  const { data: habits, isLoading: isLoadingHabits } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });
  
  // Fetch today's completions
  const { data: todayCompletions, isLoading: isLoadingCompletions } = useQuery<{habit: Habit, completion?: HabitCompletion}[]>({
    queryKey: ['/api/completions/today'],
  });
  
  // Analytics - completion rates
  const { data: completionRates } = useQuery<{habitId: number, habitName: string, completionRate: number}[]>({
    queryKey: ['/api/analytics/completion-rate'],
  });
  
  // Analytics - weekly trend
  const { data: weeklyTrend } = useQuery<{date: string, completionRate: number}[]>({
    queryKey: ['/api/analytics/weekly-trend'],
  });
  
  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: async (habit: Omit<InsertHabit, 'userId'>) => {
      const res = await apiRequest('POST', '/api/habits', habit);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Habit created',
        description: 'Your new habit was created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating habit',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update habit mutation
  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, habit }: { id: number; habit: Partial<Habit> }) => {
      const res = await apiRequest('PUT', `/api/habits/${id}`, habit);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Habit updated',
        description: 'Your habit was updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating habit',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Habit deleted',
        description: 'The habit was deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting habit',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle habit completion
  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: number; date?: string; completed?: boolean }) => {
      const payload = {
        date: date || new Date().toISOString().split('T')[0],
        completed: completed !== undefined ? completed : true,
      };
      
      const res = await apiRequest('POST', `/api/habits/${habitId}/completions`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/completions/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/completion-rate'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/weekly-trend'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating completion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Create habit function
  const createHabit = async (habit: Omit<InsertHabit, 'userId'>) => {
    return createHabitMutation.mutateAsync(habit);
  };
  
  // Update habit function
  const updateHabit = async (id: number, habit: Partial<Habit>) => {
    return updateHabitMutation.mutateAsync({ id, habit });
  };
  
  // Delete habit function
  const deleteHabit = async (id: number) => {
    return deleteHabitMutation.mutateAsync(id);
  };
  
  // Toggle completion function
  const toggleCompletion = async (habitId: number, date?: string, completed?: boolean) => {
    return toggleCompletionMutation.mutateAsync({ habitId, date, completed });
  };
  
  return (
    <HabitsContext.Provider
      value={{
        habits,
        todayCompletions,
        isLoading: isLoadingHabits || isLoadingCompletions,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleCompletion,
        completionRates,
        weeklyTrend,
        isCompletionToggling: toggleCompletionMutation.isPending,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitsContext);
  
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  
  return context;
};
