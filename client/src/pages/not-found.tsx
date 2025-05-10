import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const goToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 shadow-lg border-primary/10">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <CardTitle className="text-2xl font-bold">404 - Page Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button onClick={goToHome} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
