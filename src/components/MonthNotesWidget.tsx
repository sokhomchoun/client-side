import React, { useEffect } from "react";
import { format, getMonth, getYear } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useTask } from "@/hooks/useTask";

interface MonthNotesWidgetProps {
  selectedDate: Date;
}

export const MonthNotesWidget = ({ selectedDate }: MonthNotesWidgetProps) => {
  const {
    loading,
    currentNote,
    setCurrentNote,
    handleCreateOrUpdateMonthlyNote,
    handleGetMonthlyNote,
  } = useTask();

  const month = getMonth(selectedDate) + 1;
  const year = getYear(selectedDate);

  // Load note whenever the selected date changes
  useEffect(() => {
    handleGetMonthlyNote(month, year);
  }, [month, year]);

  // Save note handler
  const saveNote = () => {
    handleCreateOrUpdateMonthlyNote({
      content: currentNote,
      month,
      year,
    });
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="p-3 pb-2 flex-shrink-0 border-b">
        <CardTitle className="text-xs flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Notes for {format(selectedDate, "MMMM yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        <Textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="Add notes for this month..."
          className="flex-grow min-h-0 text-xs resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
        />
        <Button
          onClick={saveNote}
          className="rounded-none rounded-b-lg w-full text-xs h-8 bg-primary hover:bg-primary/90"
        >
          Save Note
        </Button>
      </CardContent>
    </Card>
  );
};
