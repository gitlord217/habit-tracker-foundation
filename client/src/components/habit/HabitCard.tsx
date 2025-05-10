import { useState } from "react";
import { Habit, HabitCompletion } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { formatTime, calculateStreakColor } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { useHabits } from "@/hooks/use-habits";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import HabitDialog from "./HabitDialog";

interface HabitCardProps {
  habit: Habit;
  completion?: HabitCompletion;
  showActions?: boolean;
}

export default function HabitCard({ habit, completion, showActions = true }: HabitCardProps) {
  const { toggleCompletion, deleteHabit, isCompletionToggling } = useHabits();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const handleCompletionToggle = async (checked: boolean) => {
    await toggleCompletion(habit.id, undefined, checked);
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteHabit(habit.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Checkbox
            id={`habit-${habit.id}`}
            checked={completion?.completed || false}
            onCheckedChange={handleCompletionToggle}
            disabled={isCompletionToggling}
            className="h-5 w-5"
          />
          <div className="ml-3">
            <label htmlFor={`habit-${habit.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {habit.name}
              {completion?.completed && completion?.completedAt && (
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                  {formatTime(new Date(completion.completedAt))}
                </span>
              )}
            </label>
            {habit.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{habit.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center ml-2">
          <div className={`flex px-2 py-1 rounded text-xs font-medium ${
            calculateStreakColor(habit.currentStreak)
          } text-white`}>
            <span>streak:</span>
            <span className="ml-1 font-bold">{habit.currentStreak}</span>
          </div>

          {showActions && (
            <div className="ml-2 flex space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditClick}>
                      <Pencil className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit habit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDeleteClick}>
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete habit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <HabitDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        habit={habit}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the habit "{habit.name}" and all of its completion history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
