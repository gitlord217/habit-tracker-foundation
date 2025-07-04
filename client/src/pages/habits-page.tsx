import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHabits } from "@/hooks/use-habits";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Calendar as CalendarIcon, CheckCircle, Edit, Flame, Trash2, Plus } from "lucide-react";
import { cn, daysOfWeek, everyDayValue, weekdaysValue, weekendsValue, getDayTargetLabel, formatDate, isHabitAvailableForCompletion } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface HabitsPageProps {
  onNavigate: (page: string) => void;
}

// Form schema for creating/editing habits
const habitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  targetDays: z.array(z.number().min(0).max(6)).min(1, "Select at least one day"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
});

type HabitFormValues = z.infer<typeof habitSchema>;

export default function HabitsPage({ onNavigate }: HabitsPageProps) {
  const { habits, isLoading, createHabit, updateHabit, deleteHabit } = useHabits();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  
  // Selected timeframe for habit creation
  const [timeframe, setTimeframe] = useState<string>("daily");
  
  // Form for creating new habits
  const createForm = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      description: "",
      targetDays: everyDayValue,
      startDate: new Date(),
    },
    mode: "onChange",
  });
  
  // Form for editing habits
  const editForm = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    // Default values will be set when a habit is selected for editing
    mode: "onChange",
  });
  
  // Handle creating a new habit
  const onCreateSubmit = (data: HabitFormValues) => {
    // Add timeframe information to the description
    const timeframeText = timeframe === "daily" 
      ? "Daily habit" 
      : timeframe === "weekly" 
        ? "Weekly habit" 
        : "Monthly habit";
    
    const description = data.description 
      ? `${data.description}\n\n${timeframeText}` 
      : timeframeText;
    
    createHabit({
      name: data.name,
      description: description,
      targetDays: data.targetDays,
      startDate: data.startDate.toISOString().split('T')[0],
    })
      .then(() => {
        toast({
          title: "Habit created",
          description: "Your new habit has been created.",
        });
        setIsCreateDialogOpen(false);
        createForm.reset();
      })
      .catch((error) => {
        toast({
          title: "Failed to create habit",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      });
  };
  
  // Handle editing an existing habit
  const onEditSubmit = (data: HabitFormValues) => {
    if (!selectedHabit) return;
    
    updateHabit(selectedHabit.id, {
      name: data.name,
      description: data.description || "",
      targetDays: data.targetDays,
      startDate: data.startDate.toISOString().split('T')[0],
    })
      .then(() => {
        toast({
          title: "Habit updated",
          description: "Your habit has been updated.",
        });
        setIsEditDialogOpen(false);
        setSelectedHabit(null);
      })
      .catch((error) => {
        toast({
          title: "Failed to update habit",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      });
  };
  
  // Handle deleting a habit
  const handleDeleteHabit = (habitId: number) => {
    deleteHabit(habitId)
      .then(() => {
        toast({
          title: "Habit deleted",
          description: "Your habit has been deleted.",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to delete habit",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      });
  };
  
  // Open edit dialog and populate form with habit data
  const openEditDialog = (habit: any) => {
    setSelectedHabit(habit);
    editForm.reset({
      name: habit.name,
      description: habit.description || "",
      targetDays: habit.targetDays as number[],
      startDate: new Date(habit.startDate),
    });
    setIsEditDialogOpen(true);
  };
  
  // Helper to set predefined target days
  const setPredefinedTargetDays = (
    form: any,
    daysValue: number[]
  ) => {
    form.setValue("targetDays", daysValue);
  };
  
  return (
    <MainLayout title="Manage Habits" onNavigate={onNavigate} currentPage="habits">
      <div className="grid gap-6">
        {/* Habits header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Create, edit, and manage your habits
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-hidden">
              <DialogHeader className="py-2">
                <DialogTitle>Create New Habit</DialogTitle>
                <DialogDescription>
                  Create a new habit to track in your daily routine
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-3 pt-1 pb-2 max-h-[65vh] overflow-y-auto px-2">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Habit Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Morning Meditation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add details about your habit"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Timeframe selection */}
                  <div>
                    <FormLabel>Timeframe</FormLabel>
                    <FormDescription>
                      How often do you want to perform this habit?
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        type="button"
                        variant={timeframe === "daily" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeframe("daily")}
                      >
                        Daily
                      </Button>
                      <Button
                        type="button"
                        variant={timeframe === "weekly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeframe("weekly")}
                      >
                        Weekly
                      </Button>
                      <Button
                        type="button"
                        variant={timeframe === "monthly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeframe("monthly")}
                      >
                        Monthly
                      </Button>
                    </div>
                  </div>
                  
                  <FormField
                    control={createForm.control}
                    name="targetDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Days</FormLabel>
                        <FormDescription>
                          Select the days you want to perform this habit
                        </FormDescription>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPredefinedTargetDays(createForm, everyDayValue)}
                          >
                            Every Day
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPredefinedTargetDays(createForm, weekdaysValue)}
                          >
                            Weekdays
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPredefinedTargetDays(createForm, weekendsValue)}
                          >
                            Weekends
                          </Button>
                        </div>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map((day) => (
                              <FormItem
                                key={`day-${day.value}`}
                                className="flex flex-row items-start space-x-1 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value.includes(day.value)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...field.value, day.value]
                                        : field.value.filter((value) => value !== day.value);
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {day.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="mt-2 sticky bottom-0 bg-background py-2 mb-6 relative">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!createForm.formState.isValid}
                      variant={createForm.formState.isValid ? "default" : "secondary"}
                      className={!createForm.formState.isValid ? "opacity-60" : ""}
                    >
                      Create Habit
                    </Button>
                    {!createForm.formState.isValid && createForm.formState.isDirty && (
                      <p className="text-xs text-destructive mt-1 absolute -bottom-5 left-0 font-medium">Please fill all required fields</p>
                    )}
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Separator />
        
        {/* Habits list */}
        <div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : habits && habits.length > 0 ? (
            <div className="grid gap-4">
              {habits.map((habit) => (
                <Card key={habit.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-muted-foreground">{habit.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>
                              {getDayTargetLabel(habit.targetDays as number[])}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Flame className="h-4 w-4 mr-1 text-orange-500" />
                            <span>Streak: {habit.currentStreak} days</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openEditDialog(habit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{habit.name}"? This action cannot be undone and all associated tracking data will be lost.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteHabit(habit.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Habits Yet</CardTitle>
                <CardDescription>
                  You haven't created any habits yet. Create your first habit to start tracking.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first habit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Edit Habit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-hidden">
          <DialogHeader className="py-2">
            <DialogTitle>Edit Habit</DialogTitle>
            <DialogDescription>
              Update your habit details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3 pt-1 pb-2 max-h-[65vh] overflow-y-auto px-2">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Morning Meditation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add details about your habit"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value)
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="targetDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Days</FormLabel>
                    <FormDescription>
                      Select the days you want to perform this habit
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPredefinedTargetDays(editForm, everyDayValue)}
                      >
                        Every Day
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPredefinedTargetDays(editForm, weekdaysValue)}
                      >
                        Weekdays
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPredefinedTargetDays(editForm, weekendsValue)}
                      >
                        Weekends
                      </Button>
                    </div>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <FormItem
                            key={`edit-day-${day.value}`}
                            className="flex flex-row items-start space-x-1 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...field.value, day.value]
                                    : field.value.filter((value) => value !== day.value);
                                  field.onChange(updatedValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {day.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-2 sticky bottom-0 bg-background py-2 mb-6 relative">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!editForm.formState.isValid}
                  variant={editForm.formState.isValid ? "default" : "secondary"}
                  className={!editForm.formState.isValid ? "opacity-60" : ""}
                >
                  Update Habit
                </Button>
                {!editForm.formState.isValid && editForm.formState.isDirty && (
                  <p className="text-xs text-destructive mt-1 absolute -bottom-5 left-0 font-medium">Please fill all required fields</p>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}