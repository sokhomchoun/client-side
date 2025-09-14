import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Listen for custom date change events
  React.useEffect(() => {
    const handleDateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.date && props.mode === "single") {
        // DayPicker in react-day-picker 8.x doesn't have onSelect in its type definitions
        // We need to use any type here to bypass TypeScript's type checking
        const dayPickerProps = props as any;
        if (
          dayPickerProps.onSelect &&
          typeof dayPickerProps.onSelect === "function"
        ) {
          // Create a proper ActiveModifiers object with literal true values
          const modifiers = {
            disabled: true,
            outside: true,
            today: true,
          } as Record<string, true>; // Type assertion to match ActiveModifiers requirement

          dayPickerProps.onSelect(
            customEvent.detail.date,
            customEvent.detail.date, // Selected days (matches the selected date for single mode)
            modifiers, // Properly typed modifiers
            {} as React.MouseEvent // Empty object that satisfies the MouseEvent type
          );
        }
      }
    };

    window.addEventListener("date-change", handleDateChange);

    return () => {
      window.removeEventListener("date-change", handleDateChange);
    };
  }, [props.mode]); // Only depend on the mode prop since we're using 'as any' for onSelect

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 h-full w-full flex flex-col pointer-events-auto",
        className
      )}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-1 sm:space-x-1 sm:space-y-0 w-full h-full",
        month: "space-y-0 w-full h-full flex-1 flex flex-col",
        caption: "flex justify-center relative items-center pb-3",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full flex-1 border-collapse space-y-2",
        head_row: "flex w-full justify-between",
        head_cell:
          "text-muted-foreground rounded-md text-xs font-normal w-10 h-10 flex items-center justify-center",
        row: "flex w-full justify-between my-1",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 h-10 w-10 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent dark:hover:text-white rounded-full"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-black hover:bg-primary hover:text-black focus:bg-primary focus:text-black dark:text-primary-foreground dark:hover:text-primary-foreground dark:focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
