import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Habit } from "@shared/schema";
import { useHabits } from "@/hooks/use-habits";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn, daysOfWeek, everyDayValue, weekdaysValue, weekendsValue } from "@/lib/utils";

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit;
  mode: "create" | "edit";
}

// Simple function to check if a date is in the past
const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Original schema that was working before
const habitFormSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(100, "Habit name is too long"),
  description: z.string().max(255, "Description is too long").optional(),
  targetDays: z.array(z.number().min(0).max(6)).min(1, "Select at least one day"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

export default function HabitDialog({ open, onOpenChange, habit, mode }: HabitDialogProps) {
  const { createHabit, updateHabit } = useHabits();
  const [targetDaysPreset, setTargetDaysPreset] = useState<'everyday' | 'weekdays' | 'weekends' | 'custom'>(
    habit && JSON.stringify(habit.targetDays) === JSON.stringify(everyDayValue) ? 'everyday' :
    habit && JSON.stringify(habit.targetDays) === JSON.stringify(weekdaysValue) ? 'weekdays' :
    habit && JSON.stringify(habit.targetDays) === JSON.stringify(weekendsValue) ? 'weekends' :
    'custom'
  );
  
  // These functions are no longer needed as we're using inline functions

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: habit?.name || "",
      description: habit?.description || "",
      targetDays: habit?.targetDays as number[] || everyDayValue,
      // For edit mode, keep the existing date, for create mode, don't set any default
      startDate: mode === "edit" && habit?.startDate ? new Date(habit.startDate) : undefined,
    },
    mode: "onChange", // Validate as user interacts with form
  });

  async function onSubmit(values: HabitFormValues) {
    try {
      // Use the date from the form
      if (mode === "create") {
        await createHabit({
          name: values.name,
          description: values.description,
          targetDays: values.targetDays,
          startDate: format(values.startDate!, 'yyyy-MM-dd')
        });
      } else if (mode === "edit" && habit) {
        await updateHabit(habit.id, {
          name: values.name,
          description: values.description,
          targetDays: values.targetDays,
          startDate: format(values.startDate!, 'yyyy-MM-dd')
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving habit:", error);
    }
  }
  
  const handleTargetDaysPresetChange = (preset: 'everyday' | 'weekdays' | 'weekends' | 'custom') => {
    setTargetDaysPreset(preset);
    let days: number[] = [];
    
    switch (preset) {
      case 'everyday':
        days = everyDayValue;
        break;
      case 'weekdays':
        days = weekdaysValue;
        break;
      case 'weekends':
        days = weekendsValue;
        break;
      default:
        // Keep current selection for custom
        days = form.getValues().targetDays;
    }
    
    form.setValue('targetDays', days, { shouldValidate: true });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add a new habit" : "Edit habit"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Create a new habit to track consistently."
              : "Make changes to your habit."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Drink 2L of water" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add some details about your habit"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <Label>Target days</Label>
              <div className="flex flex-wrap gap-3">
                <Button 
                  type="button" 
                  variant={targetDaysPreset === 'everyday' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTargetDaysPresetChange('everyday')}
                >
                  Every day
                </Button>
                <Button 
                  type="button" 
                  variant={targetDaysPreset === 'weekdays' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTargetDaysPresetChange('weekdays')}
                >
                  Weekdays
                </Button>
                <Button 
                  type="button" 
                  variant={targetDaysPreset === 'weekends' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTargetDaysPresetChange('weekends')}
                >
                  Weekends
                </Button>
                <Button 
                  type="button" 
                  variant={targetDaysPreset === 'custom' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTargetDaysPresetChange('custom')}
                >
                  Custom
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="targetDays"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-7 gap-2">
                      {daysOfWeek.map((day) => (
                        <FormField
                          key={day.value}
                          control={form.control}
                          name="targetDays"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day.value}
                                className="flex flex-col items-center space-y-1"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.value)}
                                    onCheckedChange={(checked) => {
                                      setTargetDaysPreset('custom');
                                      const currentValue = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValue, day.value])
                                        : field.onChange(
                                            currentValue.filter(
                                              (value) => value !== day.value
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-xs font-normal">
                                  {day.label.slice(0, 3)}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          // Always set the date when anything is clicked
                          field.onChange(date);
                        }}
                        initialFocus
                        disabled={(date) => {
                          // Only disable dates before today
                          const todayDate = new Date();
                          todayDate.setHours(0, 0, 0, 0);
                          return date < todayDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  // Explicitly check for empty required fields
                  !form.getValues().name || 
                  !form.getValues().startDate || 
                  form.getValues().targetDays.length === 0 ||
                  !form.formState.isValid || 
                  form.formState.isSubmitting
                }
                variant={
                  !form.getValues().name || 
                  !form.getValues().startDate || 
                  form.getValues().targetDays.length === 0 ||
                  !form.formState.isValid 
                    ? "outline" 
                    : "default"
                }
              >
                {mode === "create" ? "Create habit" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
