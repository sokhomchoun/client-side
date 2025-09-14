import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Kanban,
  List,
  ToggleRight,
  ToggleLeft,
  Archive,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import {
  format,
  add,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
  setYear,
  getYear,
} from "date-fns";
import { TaskForm, TaskFormValues } from "@/components/TaskForm";
import { MonthNotesWidget } from "@/components/MonthNotesWidget";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TaskKanbanView } from "@/components/TaskKanbanView";
import { TaskListView } from "@/components/TaskListView";
import { useTask } from "@/hooks/useTask";
import { TTask, TBoardColumn } from "@/types/task";
import TaskEdit from "@/components/TaskEdit";

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
import { TaskArchiveView } from "@/components/TaskArchiveView ";

const TasksPage = () => {
  const {
    listBoardColumn,
    setListBoardColumn,
    handleGetBoardColumns,
    handleGetTasks,
    handleGetUsersByDomain,
    listTasks,
    setListTasks,
    listCollaborators,
    setListCollaborators,
    handleDeleteTaskById,
    handleCreateTask,
    handleUpdateTaskById,
    handleCreateBoardColumn,
    handleUpdateBoardColumn,
    handleDeleteBoardColumn,
    handleUpdateBoardColumnPosition,
    auth_id,
    domain,
    handleToggleArchive,
  } = useTask();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(selectedDate, { weekStartsOn: 0 })
  );
  const [weekDays, setWeekDays] = useState(
    eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart, { weekStartsOn: 0 }),
    })
  );
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">(
    "week"
  );
  const [editingTask, setEditingTask] = useState<TTask | null>(null);
  const [viewingTask, setViewingTask] = useState<TTask | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TTask | null>(null);
  const { toast } = useToast();

  // Load initial data
  React.useEffect(() => {
    handleGetTasks();
    handleGetBoardColumns();
    handleGetUsersByDomain();
  }, []);

  // Update calendar period when the selected date or view changes
  React.useEffect(() => {
    if (calendarView === "week") {
      const newWeekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      setWeekStart(newWeekStart);
      setWeekDays(
        eachDayOfInterval({
          start: newWeekStart,
          end: endOfWeek(newWeekStart, { weekStartsOn: 0 }),
        })
      );
    }
  }, [selectedDate, calendarView]);

  // Handle create new task with specific status
  const handleCreateTaskWithStatus = (status?: number) => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // New state for view toggle
  const [viewMode, setViewMode] = useState<
    "kanban" | "list" | "calendar" | "archive"
  >("calendar");

  const [showStats, setShowStats] = useState(true);

  // Handle task form submission
  const handleTaskFormSubmit = (data: TaskFormValues) => {
    // Find assigned user
    const assignedTo =
      data.assignedToId && data.assignedToId !== "unassigned"
        ? listCollaborators.find((u) => u.id === data.assignedToId)
        : undefined;

    // Find collaborators
    const collaborators =
      data.collaborators && data.collaborators.length > 0
        ? listCollaborators.filter((u) => data.collaborators?.includes(u.id))
        : undefined;

    if (editingTask) {
      // Update existing task
      setListTasks(
        listTasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: data.title,
                description: data.description,
                status: data.status,
                due_date: data.due_date,
                time: data.time,
                assignedTo,
                collaborators,
              }
            : task
        )
      );
    } else {
      // Create new task
      const newTask = {
        title: data.title,
        description: data.description,
        boardColumnId: Number(data.status),
        due_date: new Date(data.due_date),
        time: String(data.time),
        assignee_id: Number(data.assignedToId),
        collaborators: data.collaborators || [],
      };
      handleCreateTask(newTask);
    }
    setIsFormOpen(false);
  };

  // Handle edit task
  const handleEditTask = (task: TTask) => {
    setEditingTask(task);
    setViewingTask(null);
    setIsFormOpen(true);
  };

  // Handle task update from KanbanView
  const handleTaskUpdate = async (updatedTask: TTask) => {
    const taskPayload = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || "",
      boardColumnId: updatedTask.boardColumn?.id || null,
      due_date: updatedTask.due_date,
      time: updatedTask.time,
      assignee_id: updatedTask.assignee?.id || null,
      collaborators:
        updatedTask.task_collaborators?.map((c) => ({
          id: c.user_id,
          domain: c.domain,
        })) || [],
    };

    try {
      await handleUpdateTaskById(taskPayload, updatedTask.id);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Handle delete task
  const handleDeleteTask = (taskId: number) => {
    handleDeleteTaskById(taskId);
    setViewingTask(null);
  };

  // Handle task status update for kanban
  const handleTaskStatusUpdate = (taskId: number, newStatus: number) => {
    setListTasks(
      listTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Handle board columns update
  const handleColumnsUpdate = (newColumns: TBoardColumn[]) => {
    const removedColumnIds = listBoardColumn
      .filter((col) => !newColumns.find((newCol) => newCol.id === col.id))
      .map((col) => col.id);

    // If columns were removed, move tasks to the first remaining column
    if (removedColumnIds.length > 0 && newColumns.length > 0) {
      const firstColumnId = newColumns[0].id;
      setListTasks((prevTasks) =>
        prevTasks.map((task) =>
          removedColumnIds.includes(task.boardColumn.id)
            ? { ...task, status: firstColumnId }
            : task
        )
      );
    }

    setListBoardColumn(newColumns);
  };

  // Generate time slots for calendar view
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return listTasks.filter(
      (task) => task.due_date && isSameDay(task.due_date, day)
    );
  };

  // Navigate to previous/next period
  const goToPrevPeriod = () => {
    let newDate;
    if (calendarView === "day") {
      newDate = add(selectedDate, { days: -1 });
    } else if (calendarView === "week") {
      newDate = add(weekStart, { days: -7 });
    } else {
      newDate = add(selectedDate, { months: -1 });
    }
    setSelectedDate(newDate);
  };

  const goToNextPeriod = () => {
    let newDate;
    if (calendarView === "day") {
      newDate = add(selectedDate, { days: 1 });
    } else if (calendarView === "week") {
      newDate = add(weekStart, { days: 7 });
    } else {
      newDate = add(selectedDate, { months: 1 });
    }
    setSelectedDate(newDate);
  };

  // Get days for month view
  const getMonthDays = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  // Get title for calendar view
  const getCalendarTitle = () => {
    if (calendarView === "day") {
      return format(selectedDate, "MMMM d, yyyy");
    } else if (calendarView === "week") {
      return `${format(weekStart, "MMMM d")} - ${format(
        weekDays[6],
        "d, yyyy"
      )}`;
    } else {
      return format(selectedDate, "MMMM yyyy");
    }
  };

  // Handle year change - modified to update the selectedDate
  const handleYearChange = (year: string) => {
    const newDate = setYear(selectedDate, parseInt(year));
    setSelectedDate(newDate);

    // Dispatch custom event for the Calendar component to pick up
    window.dispatchEvent(
      new CustomEvent("date-change", { detail: { date: newDate } })
    );
  };

  const getTasksByStatus = (status: string, userId: number, domain: string) => {
    const tasks = listTasks.filter((task) =>
      task.task_status_collaborators.some(
        (collab) =>
          collab.status === status &&
          collab.user_id === userId &&
          collab.domain === domain
      )
    );
    console.log(status, userId, domain);
    return tasks;
  };

  const handleToggleArchiveTask = async (task: TTask) => {
    try {
      await handleToggleArchive(task.id);
    } catch (e) {
      console.error("Failed to toggle archive status", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center gap-2">
          {/* tabs here */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="flex items-center gap-2"
            >
              <Kanban className="h-4 w-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === "archive" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("archive")}
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2"
          >
            {showStats ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {showStats ? "Hide Stats" : "Show Stats"}
          </Button>
          <Button onClick={() => handleCreateTaskWithStatus()}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      {viewMode === "calendar" && (
        <Card>
          <CardHeader className="flex sm:flex-row flex-col items-center justify-between pb-2">
            {/* get date */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={goToPrevPeriod}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>{getCalendarTitle()}</CardTitle>
              <Button variant="outline" size="sm" onClick={goToNextPeriod}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* day,week,month,year */}
            <div className="flex items-center space-x-2">
              <ToggleGroup
                type="single"
                value={calendarView}
                onValueChange={(value) =>
                  value && setCalendarView(value as "day" | "week" | "month")
                }
              >
                <ToggleGroupItem value="day" aria-label="Day view">
                  Day
                </ToggleGroupItem>
                <ToggleGroupItem value="week" aria-label="Week view">
                  Week
                </ToggleGroupItem>
                <ToggleGroupItem value="month" aria-label="Month view">
                  Month
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Year selection dropdown */}
              <Select
                value={getYear(selectedDate).toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue placeholder={getYear(selectedDate).toString()} />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {Array.from(
                      { length: 11 },
                      (_, i) => getYear(new Date()) - 5 + i
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {/* Calendar with Notes Widget - Responsive with flexible height */}
            {showStats && (
              <div className="flex flex-col lg:flex-row gap-4 min-h-[400px] max-h-[800px] sm:h-[60vh] h-auto">
                <div className="w-full lg:w-1/2 h-full">
                  <Card className="h-full overflow-hidden border shadow-none">
                    <CardContent className="p-2 h-full flex items-stretch justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="w-full h-full flex-1 [&_.rdp]:h-full [&_.rdp-months]:h-full [&_.rdp-month]:h-full [&_.rdp-table]:h-full"
                      />
                    </CardContent>
                  </Card>
                </div>
                <div className="w-full lg:w-1/2 sm:h-full h-[300px]">
                  <MonthNotesWidget selectedDate={selectedDate} />
                </div>
              </div>
            )}

            {/* Day Calendar View */}
            {calendarView === "day" && (
              <div className="w-full overflow-x-auto mt-6">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-1 gap-1 mb-2">
                    <div className="text-center py-2 font-medium bg-primary/10 rounded-t-md">
                      <div className="text-lg">
                        {format(selectedDate, "EEEE")}
                      </div>
                      <div className="text-xl bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center mx-auto">
                        {format(selectedDate, "d")}
                      </div>
                    </div>

                    {/* Tasks list for the day */}
                    <div className="mb-6 p-4 border rounded-md">
                      <h3 className="font-medium mb-3">
                        Tasks for {format(selectedDate, "MMMM d")}
                      </h3>
                      <ScrollArea className="h-[180px]">
                        {getTasksForDay(selectedDate).length > 0 ? (
                          getTasksForDay(selectedDate).map((task) => (
                            <div
                              key={task.id}
                              style={{
                                backgroundColor: task.boardColumn.color,
                              }}
                              className={`p-3 rounded-md cursor-pointer `}
                              onClick={() => setViewingTask(task)}
                            >
                              <div className="flex justify-between">
                                <div>
                                  <div className="font-medium">
                                    {task.title}
                                  </div>
                                  <div className="text-sm opacity-80">
                                    {task.description}
                                  </div>
                                </div>
                                <div className="text-sm font-medium">
                                  {task.time || "No time set"}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            No tasks scheduled for this day
                          </p>
                        )}
                      </ScrollArea>
                    </div>

                    <div className="relative">
                      {timeSlots.map((hour) => (
                        <div key={hour} className="grid grid-cols-1 gap-1">
                          <div className="flex">
                            <div className="h-16 w-16 text-xs text-right pr-2 pt-1 text-muted-foreground">
                              {hour}:00
                            </div>
                            <div className="flex-1 border-t border-border h-16 relative">
                              {listTasks
                                .filter(
                                  (task) =>
                                    task.due_date &&
                                    isSameDay(task.due_date, selectedDate) &&
                                    task.time &&
                                    task.time.includes(
                                      `${hour > 12 ? hour - 12 : hour}:`
                                    )
                                )
                                .map((task) => (
                                  <div
                                    key={task.id}
                                    style={{
                                      backgroundColor: task.boardColumn.color,
                                    }}
                                    className={`absolute top-0 left-0 right-0 px-3 py-1 m-1 text-sm rounded truncate cursor-pointer`}
                                  >
                                    <div className="font-medium">
                                      {task.title}
                                    </div>
                                    <div className="text-xs">{task.time}</div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Calendar View */}
            {calendarView === "week" && (
              <div className="w-full overflow-x-auto mt-6">
                <div className="min-w-[800px]">
                  {/* Calendar Header (Days) */}
                  <div className="grid grid-cols-8 gap-1">
                    <div className="h-10"></div>{" "}
                    {/* Empty cell for time column */}
                    {weekDays.map((day) => (
                      <div
                        key={day.toString()}
                        className={`text-center py-2 font-medium ${
                          isSameDay(day, new Date())
                            ? "bg-primary/10 rounded-t-md"
                            : ""
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div>{format(day, "EEE")}</div>
                        <div
                          className={`text-lg ${
                            isSameDay(day, new Date())
                              ? "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                              : ""
                          }`}
                        >
                          {format(day, "d")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Body with Tasks Listed Under Each Day */}
                  <div className="grid grid-cols-8 gap-1 mt-4">
                    <div className="font-medium text-muted-foreground px-2 py-1 text-right">
                      Tasks
                    </div>
                    {weekDays.map((day) => {
                      const dayTasks = getTasksForDay(day);
                      return (
                        <div
                          key={day.toString()}
                          className={`min-h-[150px] border border-border rounded-md p-2 ${
                            isSameDay(day, new Date()) ? "bg-primary/5" : ""
                          }`}
                        >
                          <ScrollArea className="h-[140px]">
                            {dayTasks.length > 0 ? (
                              dayTasks.map((task) => (
                                <div
                                  key={task.id}
                                  style={{
                                    backgroundColor: task.boardColumn.color,
                                  }}
                                  className={`mb-2 px-2 py-1 text-xs rounded truncate cursor-pointer`}
                                  onClick={() => setViewingTask(task)}
                                >
                                  <div className="font-medium">
                                    {task.title}
                                  </div>
                                  <div className="truncate text-xs opacity-70">
                                    {task.description}
                                  </div>
                                  {task.time && (
                                    <div className="text-xs mt-1 font-medium">
                                      {task.time}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-center text-muted-foreground p-2">
                                No tasks
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calendar Body (Time slots) - Improved layout with full width cells */}
                  <div className="relative mt-4">
                    {timeSlots.map((hour) => (
                      <div key={hour} className="grid grid-cols-8 gap-1">
                        <div className="h-14 text-xs text-right pr-2 pt-1 text-muted-foreground flex items-center justify-end">
                          <span>
                            {hour > 12 ? `${hour - 12}` : hour}:00{" "}
                            {hour >= 12 ? "PM" : "AM"}
                          </span>
                        </div>
                        {weekDays.map((day) => {
                          const tasksForHour = listTasks.filter(
                            (task) =>
                              task.due_date &&
                              isSameDay(task.due_date, day) &&
                              task.time &&
                              task.time.includes(
                                `${hour > 12 ? hour - 12 : hour}:`
                              )
                          );

                          return (
                            <div
                              key={day.toString()}
                              className={`h-14 border-t border-border relative ${
                                isSameDay(day, new Date()) ? "bg-primary/5" : ""
                              }`}
                            >
                              {tasksForHour.map((task) => (
                                <div
                                  key={task.id}
                                  className={`absolute inset-0 m-1 px-2 py-1 text-xs rounded truncate cursor-pointer `}
                                  onClick={() => setViewingTask(task)}
                                  style={{
                                    backgroundColor: task.boardColumn.color,
                                  }}
                                >
                                  <div className="font-medium">
                                    {task.title}
                                  </div>
                                  <div className="text-xs">{task.time}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Month Calendar View */}
            {calendarView === "month" && (
              <div className="w-full mt-6">
                <div className="grid grid-cols-7 gap-1 text-center font-medium">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-1 mt-2">
                  {getMonthDays().map((day) => {
                    const dayTasks = getTasksForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                      <div
                        key={day.toString()}
                        className={`min-h-[100px] p-1 border rounded ${
                          isToday ? "border-primary" : "border-border"
                        } ${isSelected ? "bg-primary/5" : ""}`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div
                          className={`text-right text-sm font-medium ${
                            isToday
                              ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center ml-auto"
                              : ""
                          }`}
                        >
                          {format(day, "d")}
                        </div>
                        <ScrollArea className="h-[70px] mt-1">
                          {dayTasks.map((task) => (
                            <div
                              key={task.id}
                              style={{
                                backgroundColor: task.boardColumn.color,
                              }}
                              className={`px-1 py-0.5 mb-1 text-xs rounded truncate cursor-pointer`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingTask(task);
                              }}
                            >
                              {task.title}
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === "kanban" && (
        <TaskKanbanView
          tasks={getTasksByStatus("active", auth_id, domain)}
          setTasks={setListTasks}
          boardColumns={listBoardColumn}
          onTaskStatusUpdate={handleTaskStatusUpdate}
          onTaskDelete={handleDeleteTask}
          onTaskCreate={handleCreateTaskWithStatus}
          onColumnsUpdate={handleColumnsUpdate}
          onTaskUpdate={handleTaskUpdate}
          onCreateColumn={handleCreateBoardColumn}
          onUpdateColumn={handleUpdateBoardColumn}
          onDeleteColumn={handleDeleteBoardColumn}
          onUpdateColumnPosition={handleUpdateBoardColumnPosition}
          listCollaborators={listCollaborators}
          onToggleArchive={handleToggleArchiveTask}
        />
      )}

      {viewMode === "list" && (
        <TaskListView
          tasks={getTasksByStatus("active", auth_id, domain)}
          boardColumns={listBoardColumn}
          listCollaborators={listCollaborators}
          onTaskView={setViewingTask}
          onTaskDelete={handleDeleteTask}
          onTaskUpdate={handleTaskUpdate}
          onToggleArchive={handleToggleArchiveTask}
        />
      )}
      {viewMode === "archive" && (
        <TaskArchiveView
          tasks={getTasksByStatus("archived", auth_id, domain)}
          boardColumns={listBoardColumn}
          listCollaborators={listCollaborators}
          onTaskView={setViewingTask}
          onTaskDelete={handleDeleteTask}
          onTaskUpdate={handleTaskUpdate}
          onToggleArchive={handleToggleArchiveTask}
        />
      )}

      {/* Task View Dialog */}
      <Dialog
        open={!!viewingTask}
        onOpenChange={(open) => !open && setViewingTask(null)}
      >
        <DialogContent className="sm:max-w-md">
          {viewingTask && (
            <TaskEdit
              task={viewingTask}
              listBoardColumn={listBoardColumn}
              listCollaborators={listCollaborators}
              onDelete={() => {
                if (viewMode === "calendar") {
                  setTaskToDelete(viewingTask);
                  setDeleteConfirmOpen(true);
                  return;
                }
                handleDeleteTask(viewingTask.id);
                setViewingTask(null);
              }}
              onEdit={async (updatedTask) => {
                // Optimistic UI update
                setListTasks((prevTasks) =>
                  prevTasks.map((t) =>
                    t.id === updatedTask.id ? updatedTask : t
                  )
                );
                setViewingTask(updatedTask);

                // Persist to backend
                const payload = {
                  id: updatedTask.id,
                  title: updatedTask.title,
                  description: updatedTask.description || "",
                  boardColumnId: updatedTask.boardColumn?.id || null,
                  due_date: updatedTask.due_date,
                  time: updatedTask.time,
                  assignee_id: updatedTask.assignee?.id || null,
                  collaborators:
                    updatedTask.task_collaborators?.map((c) => ({
                      id: c.user_id,
                      domain: c.domain,
                    })) || [],
                };
                try {
                  await handleUpdateTaskById(payload, updatedTask.id);
                } catch (e) {
                  console.error("Failed to persist task update", e);
                }
              }}
              onClose={() => setViewingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/*Create New Task Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <TaskForm
            defaultValues={
              editingTask
                ? {
                    title: editingTask.title,
                    description: editingTask.description,
                    status: editingTask.boardColumn.id.toString(),
                    due_date: editingTask.due_date,
                    time: editingTask.time,
                    assignedToId: editingTask.assignee?.id?.toString(),
                    collaborators:
                      editingTask.task_collaborators?.map((c) => ({
                        id: c.user_id,
                        domain: c.domain,
                      })) || [],
                  }
                : undefined
            }
            onSubmit={handleTaskFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            availableUsers={listCollaborators}
            boardColumns={listBoardColumn}
            onCreateColumn={handleCreateBoardColumn}
            onUpdateColumn={handleUpdateBoardColumn}
            onDeleteColumn={handleDeleteBoardColumn}
            onUpdateColumnPosition={handleUpdateBoardColumnPosition}
            onColumnsUpdate={handleColumnsUpdate}
          />
        </DialogContent>
      </Dialog>
      {/* Delete Task Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setTaskToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {taskToDelete?.title ? (
                <>
                  the task{" "}
                  <span className="font-medium">"{taskToDelete.title}"</span>.
                </>
              ) : (
                " this task."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToDelete) {
                  handleDeleteTask(taskToDelete.id);
                }
                setDeleteConfirmOpen(false);
                setTaskToDelete(null);
                setViewingTask(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksPage;
