import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

interface RegistrationSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function RegistrationSuccessDialog({ 
  isOpen, 
  onClose,
  username 
}: RegistrationSuccessDialogProps) {
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(2); // Reduced countdown time to 2 seconds
  
  // Auto-redirect countdown
  useEffect(() => {
    if (!isOpen) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleDashboardRedirect();
    }
  }, [countdown, isOpen]);
  
  const handleDashboardRedirect = () => {
    onClose();
    navigate('/dashboard');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
          </div>
          <DialogTitle className="text-xl text-center">Registration Complete!</DialogTitle>
          <DialogDescription className="text-center">
            <p className="font-semibold text-lg mb-2">
              Welcome to HabitVault, <span className="text-primary">{username.split(' ')[0]}</span>!
            </p>
            <p>
              Your account has been successfully created.
              <br />
              Taking you to your dashboard to start tracking habits...
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center mt-4">
          <Button 
            onClick={handleDashboardRedirect} 
            className="w-full sm:w-auto"
            size="lg"
          >
            Go to Dashboard ({countdown}s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}