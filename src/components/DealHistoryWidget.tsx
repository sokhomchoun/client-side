import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

// Define the history entry type
interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
}

interface DealHistoryWidgetProps {
  dealId: string;
}

// Define the ref interface and export it
export interface DealHistoryWidgetRef {
  addHistoryEntry: (action: string, user?: string) => HistoryEntry;
}

export const DealHistoryWidget = forwardRef<DealHistoryWidgetRef, DealHistoryWidgetProps>(
  ({ dealId }, ref) => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    // Load history entries when component mounts or dealId changes
    useEffect(() => {
      const savedHistory = localStorage.getItem(`deal-history-${dealId}`);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        // Create some example history if none exists
        const exampleHistory = [
          {
            id: "1",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            action: "Deal created",
            user: "John Smith"
          },
          {
            id: "2",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            action: "Updated probability to 40%",
            user: "Emily Johnson"
          },
          {
            id: "3",
            timestamp: new Date().toISOString(),
            action: "Changed stage to Meeting Scheduled",
            user: "John Smith"
          }
        ];
        
        setHistory(exampleHistory);
        localStorage.setItem(`deal-history-${dealId}`, JSON.stringify(exampleHistory));
      }
    }, [dealId]);

    // Add a new history entry (can be called from parent components)
    const addHistoryEntry = (action: string, user: string = "Current User") => {
      const newEntry = {
        id: `history-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        user
      };
      
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem(`deal-history-${dealId}`, JSON.stringify(updatedHistory));
      
      return newEntry;
    };

    // Expose the addHistoryEntry function to parent components via ref
    useImperativeHandle(ref, () => ({
      addHistoryEntry
    }));

    return (
      <Card className="w-full">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            Deal History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-sm">
            {history.length === 0 ? (
              <div className="text-muted-foreground py-3 text-center">No history available</div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="border-b last:border-b-0 pb-2 last:pb-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium">{entry.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">by {entry.user}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

// Add display name for debugging purposes
DealHistoryWidget.displayName = "DealHistoryWidget";
