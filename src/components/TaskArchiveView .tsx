import React, { useEffect, useState } from "react";
import { TTask, TBoardColumn } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Eye,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Users,
  CircleCheck,
  CircleX,
  ArchiveRestore,
} from "lucide-react";
import { format } from "date-fns";
import { TaskDetail } from "./TaskDetail";
import { useTask } from "@/hooks/useTask";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface TaskListViewProps {
  tasks: TTask[];
  onTaskView: (task: TTask) => void;
  onTaskDelete: (taskId: number) => void;
  boardColumns: TBoardColumn[];
  onTaskUpdate?: (task: TTask) => void;
  onToggleArchive?: (task: TTask) => void;
  listCollaborators?: {
    id: number;
    name: string;
    avatar: string;
    domain: string;
  }[];
}

export const TaskArchiveView: React.FC<TaskListViewProps> = ({
  tasks,
  boardColumns,
  onTaskView,
  onTaskDelete,
  onTaskUpdate,
  listCollaborators,
  onToggleArchive,
}) => {
  const {
    handleUpdateTaskById,
    auth_id,
    domain,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
  } = useTask();

  const [taskIdToDelete, setTaskIdToDelete] = useState<number | null>(null);
  const taskToDelete =
    taskIdToDelete != null
      ? tasks.find((t) => t.id === taskIdToDelete)
      : undefined;

  // Confirm deletion action from dialog
  const confirmDelete = () => {
    if (taskIdToDelete != null) {
      onTaskDelete(taskIdToDelete);
    }
    setDeleteConfirmOpen(false);
    setTaskIdToDelete(null);
  };

  // Edit handler - use the same logic as Kanban view
  const handleTaskEdit = async (updatedTask: TTask) => {
    if (onTaskUpdate) {
      await onTaskUpdate(updatedTask);
    } else {
      // Fallback to local hook if no prop is provided
      const taskPayload = {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description || "",
        boardColumnId: updatedTask.boardColumn.id,
        due_date: updatedTask.due_date,
        time: updatedTask.time,
        assignee_id: updatedTask.assignee?.id || null,
        collaborators:
          updatedTask.task_collaborators?.map((c) => ({
            id: c.user_id,
            domain: c.domain,
          })) || [],
      };

      await handleUpdateTaskById(taskPayload, updatedTask.id);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">
                      {task.title
                        ? task.title.substring(0, 45) +
                          (task.title.length > 45 ? "..." : "")
                        : ""}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {task.description
                        ? task.description.substring(0, 45) +
                          (task.description.length > 45 ? "..." : "")
                        : ""}
                    </div>
                    {task.task_collaborators &&
                      task.task_collaborators.length > 0 && (
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          {task.task_collaborators.length} collaborator
                          {task.task_collaborators.length > 1 ? "s" : ""}
                        </div>
                      )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className="text-black"
                    style={{ backgroundColor: task.boardColumn.color }}
                  >
                    {task.boardColumn.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {auth_id === task.user_id && domain === task.domain ? (
                    <CircleCheck className="h-6 w-6 text-blue-500" />
                  ) : (
                    <CircleX className="h-6 w-6 text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(task.due_date, "MMM dd, yyyy")}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No due date
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {task.time ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {task.time}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No time
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <TaskDetail
                      task={task}
                      onClose={() => {}}
                      onEdit={handleTaskEdit}
                      onDelete={() => {
                        setTaskIdToDelete(task.id);
                        setDeleteConfirmOpen(true);
                      }}
                      listBoardColumn={boardColumns}
                      listCollaborators={listCollaborators}
                      icon={
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleArchive) {
                          onToggleArchive(task);
                        }
                      }}
                    >
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskIdToDelete(task.id);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Delete Task Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setTaskIdToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {taskToDelete?.title ? (
                <>
                  task{" "}
                  <span className="font-medium">"{taskToDelete.title}"</span>
                </>
              ) : (
                "task"
              )}{" "}
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
