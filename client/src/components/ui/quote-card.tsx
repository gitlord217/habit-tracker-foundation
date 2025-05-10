import { getTodaysQuote } from "@/lib/quotes";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareQuote } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function QuoteCard() {
  const [showQuotes] = useLocalStorage("show-quotes", true);
  
  // Don't render if quotes are disabled
  if (!showQuotes) {
    return null;
  }
  
  const { text, author } = getTodaysQuote();
  
  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center">
          <MessageSquareQuote className="h-8 w-8 text-white opacity-80 flex-shrink-0" />
          <div className="ml-5 flex-1">
            <h3 className="text-lg leading-6 font-medium">Daily Motivation</h3>
            <p className="mt-2 text-white text-opacity-90">
              "{text}" - {author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
