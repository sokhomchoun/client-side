import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Clock, CalendarCheck, Save, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTask } from "@/hooks/useTask";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TBoardColumn, TTask } from "@/types/task";

interface TaskDetailProps {
  task: TTask;
  listBoardColumn: TBoardColumn[];
  listCollaborators?: { id: number; name: string; avatar: string, domain: string }[];
  onClose: () => void;
  onDelete: () => void;
  icon?: React.ReactNode;
  onEdit: (task: TTask) => void;
  isNoIcon?: boolean;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  onClose,
  onDelete,
  icon,
  onEdit,
  listBoardColumn,
  listCollaborators = [],
  isNoIcon = false,
}) => {
  const { auth_id, domain, } =
    useTask();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [time, setTime] = useState(task.time || "");
  const [status, setStatus] = useState(task.boardColumn?.id.toString() || "");
  const [assigneeId, setAssigneeId] = useState(
    task.assignee?.id?.toString() || "unassigned"
  );
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<
    number[]
  >(task.task_collaborators?.map((c) => c.user_id) || []);

  const handleCollaboratorToggle = (userId: number) => {
    setSelectedCollaboratorIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    const updatedTask: TTask = {
      ...task,
      title,
      description,
      due_date: dueDate ?? null,
      time,
      assignee:
        assigneeId === "unassigned"
          ? null
          : listCollaborators.find((u) => u.id.toString() === assigneeId) ||
            null,
      boardColumn: listBoardColumn.find((c) => c.id.toString() === status)!,
      task_collaborators: selectedCollaboratorIds.map((id) => ({
        id,
        user_id: id,
        domain: listCollaborators.find((u) => u.id === id)?.domain || null,
      })),
    };

    onEdit(updatedTask);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {!isNoIcon &&
          (icon ? (
            icon
          ) : (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Edit className="h-3 w-3" />
            </Button>
          ))}
      </SheetTrigger>
      <SheetContent className="w-full  sm:!max-w-[40vw] h-full overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>Task Details</SheetTitle>
          <SheetDescription>View and edit the task</SheetDescription>
        </SheetHeader>

        <div className="grid gap-3 pt-3">
          {/* Title */}
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            {/* Due Date */}
            <div className="grid gap-2 w-full">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start gap-2">
                    <CalendarCheck />
                    {dueDate ? dueDate.toLocaleDateString() : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Time */}
            <div className="grid gap-2 w-full">
              <Label>Due Time</Label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2 w-full">
              <Label>Status</Label>

              {auth_id === task.user_id && domain === task.domain ? (
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={listBoardColumn.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {listBoardColumn.map((column) => (
                      <SelectItem key={column.id} value={column.id.toString()}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: column.color }}
                          />
                          {column.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={task.boardColumn?.id?.toString()} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="No status" />
                  </SelectTrigger>
                  <SelectContent>
                    {task.boardColumn && (
                      <SelectItem value={task.boardColumn.id.toString()}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: task.boardColumn.color }}
                          />
                          {task.boardColumn.name}
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="grid gap-2">
            <Label>Assign To</Label>
            <Select
              value={assigneeId}
              onValueChange={setAssigneeId}
              disabled={task.user_id !== auth_id || task.domain !== domain}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {listCollaborators.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-1">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Collaborators */}
          <FormItem>
            <FormLabel>Collaborators</FormLabel>
            <div className="border rounded-md p-3">
              <div className="flex flex-wrap gap-2">
                {listCollaborators.map((user) => {
                  const isDisabled =
                    task.user_id !== auth_id || task.domain !== domain;
                  const isSelected = selectedCollaboratorIds.includes(user.id);

                  return (
                    <Badge
                      key={user.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={
                        isDisabled
                          ? undefined
                          : () => handleCollaboratorToggle(user.id)
                      }
                    >
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-black dark:text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.name}
                      {isSelected && <span className="ml-1 text-xs">✓</span>}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        </div>

        {/* Footer */}
        <SheetFooter className="mt-4 gap-2">
          <SheetClose asChild>
            <Button variant="default" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </SheetClose>
          {task.user_id === auth_id && task.domain === domain && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <SheetClose asChild>
            <Button variant="destructive" size="sm">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
