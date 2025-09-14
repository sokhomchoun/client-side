import { Label } from "@radix-ui/react-menubar";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { TTask, TUser } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Clock, CalendarCheck, Save, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTask } from "@/hooks/useTask";

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
import { TBoardColumn } from "@/types/task";

interface TaskEditProps {
  task: TTask;
  listBoardColumn: TBoardColumn[];
  listCollaborators: TUser[];
  onDelete: () => void;
  onEdit: (updatedTask: TTask) => void;
  onClose?: () => void;
}
const TaskEdit = ({
  task,
  listBoardColumn,
  listCollaborators,
  onDelete,
  onEdit,
  onClose,
}: TaskEditProps) => {
  const { auth_id, domain, handleUpdateTaskById } = useTask();

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
    // Preserve current column if listBoardColumn hasn't loaded or no match is found
    const selectedColumn = listBoardColumn.find(
      (c) => c.id.toString() === status
    );

    const assignedUser =
      assigneeId === "unassigned"
        ? null
        : listCollaborators.find((u) => u.id.toString() === assigneeId) || null;

    const updatedTask: TTask = {
      ...task,
      title,
      description,
      due_date: dueDate ?? null,
      time,
      assignee: assignedUser
        ? {
            id: assignedUser.id,
            name: assignedUser.name,
            avatar: assignedUser.avatar ?? null,
          }
        : (null as any),
      boardColumn: selectedColumn ?? task.boardColumn,
      task_collaborators: selectedCollaboratorIds.map((id) => ({
        id,
        user_id: id,
        domain: listCollaborators.find((u) => u.id === id)?.domain || null,
      })),
    };

    onEdit(updatedTask);
  };

  return (
    <>
      <div className="space-y-4 p-6">
        <h2 className="text-xl font-semibold">Edit Task</h2>
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
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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

          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="default" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            {task.user_id === auth_id && task.domain === domain && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskEdit;
