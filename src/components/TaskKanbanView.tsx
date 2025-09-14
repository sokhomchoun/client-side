import React, { useCallback, useState } from "react";
import { TTask, TBoardColumn } from "@/types/task";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TaskCard } from "@/components/TaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Archive, Plus, Trash2 } from "lucide-react";
import { BoardColumnsManager } from "@/components/BoardColumnsManager";
import { TaskDetail } from "./TaskDetail";
import { useTask } from "@/hooks/useTask";
import { Badge } from "./ui/badge";
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

interface TaskKanbanViewProps {
  tasks: TTask[];
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
  boardColumns: TBoardColumn[];
  onTaskStatusUpdate?: (taskId: number, newStatus: number) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskCreate?: (status: number) => void;
  onColumnsUpdate?: (columns: TBoardColumn[]) => void;
  onTaskUpdate?: (task: TTask) => void;
  onCreateColumn?: (column: { name: string; color: string }) => Promise<any>;
  onUpdateColumn?: (column: {
    id: number;
    name: string;
    color: string;
  }) => Promise<any>;
  onDeleteColumn?: (id: number) => Promise<any>;
  onUpdateColumnPosition?: (id: number, position: number) => Promise<any>;
  listCollaborators?: {
    id: number;
    name: string;
    avatar: string;
    domain: string;
  }[];
  onToggleArchive?: (task: TTask) => void;
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  setTasks,
  boardColumns,
  onTaskStatusUpdate,
  onTaskDelete,
  onTaskCreate,
  onColumnsUpdate,
  onTaskUpdate,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onUpdateColumnPosition,
  listCollaborators = [],
  onToggleArchive,
}) => {
  const {
    handleUpdateTaskById,
    handleUpdateTaskStatus,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleDeleteTaskById,
  } = useTask();
  const [taskIdToDelete, setTaskIdToDelete] = useState<number | null>(null);
  const taskToDelete =
    taskIdToDelete != null
      ? tasks.find((t) => t.id === taskIdToDelete)
      : undefined;

  const getTasksForColumn = (columnId: number) => {
    return tasks.filter((task) => task.boardColumn.id === columnId);
  };

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("text/plain", taskId.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, columnId: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    const taskIdNum = Number(taskId);

    // Optimistic update: move task locally
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskIdNum
          ? { ...task, boardColumn: { ...task.boardColumn, id: columnId } }
          : task
      )
    );

    handleUpdateTaskStatus(taskIdNum, columnId);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColumnsChange = useCallback(
    (updatedColumns: TBoardColumn[]) => {
      if (onColumnsUpdate) {
        onColumnsUpdate(updatedColumns); // notify parent
      }
    },
    [onColumnsUpdate]
  );

  // Edit handler
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

    // Update local state for consistency
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  // Delete flow with confirm
  const requestTaskDelete = (taskId: number) => {
    setTaskIdToDelete(taskId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (taskIdToDelete == null) return;
    try {
      if (onTaskDelete) {
        await onTaskDelete(taskIdToDelete);
      } else {
        await handleDeleteTaskById(taskIdToDelete);
      }
      // Keep local state in sync
      setTasks((prev) => prev.filter((t) => t.id !== taskIdToDelete));
    } finally {
      setDeleteConfirmOpen(false);
      setTaskIdToDelete(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Kanban Board</h2>
        {boardColumns && (
          <BoardColumnsManager
            boardColumns={boardColumns}
            onUpdateColumns={handleColumnsChange}
            onCreateColumn={onCreateColumn}
            onUpdateColumn={onUpdateColumn}
            onDeleteColumn={onDeleteColumn}
            onUpdateColumnPosition={onUpdateColumnPosition}
          />
        )}
      </div>

      {/* Horizontal scrolling container */}
      <div className="overflow-x-auto pb-4 kanban-scroll-container">
        <div className="flex gap-6 min-w-max px-0">
          {boardColumns.length === 0 && (
            <Card className="w-80 flex-shrink-0 kanban-column bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      Get Started
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 h-[400px] flex items-center justify-center">
                <div className="flex items-center justify-center">
                  {boardColumns && (
                    <BoardColumnsManager
                      boardColumns={boardColumns}
                      onUpdateColumns={handleColumnsChange}
                      onCreateColumn={onCreateColumn}
                      onUpdateColumn={onUpdateColumn}
                      onDeleteColumn={onDeleteColumn}
                      onUpdateColumnPosition={onUpdateColumnPosition}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {boardColumns.map((column) => (
            <Card
              key={column.id}
              className="w-80 flex-shrink-0 kanban-column bg-muted/30"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragEnter={handleDragEnter}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle
                    className="text-lg flex items-center gap-2"
                    style={{ color: column.color }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    {column.name}
                    <span className="text-sm text-muted-foreground font-normal">
                      ({getTasksForColumn(column.id).length})
                    </span>
                  </CardTitle>
                  {onTaskCreate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskCreate(column.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px] max-h-[600px]">
                  <div className="space-y-3 pr-2">
                    {getTasksForColumn(column.id).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="cursor-grab active:cursor-grabbing group relative"
                      >
                        <TaskCard task={task} />

                        {/* Edit and Delete buttons on hover */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-md p-1 flex gap-1">
                          <TaskDetail
                            task={task}
                            onClose={() => {}}
                            listBoardColumn={boardColumns}
                            onEdit={handleTaskEdit}
                            onDelete={() => requestTaskDelete(task.id)}
                            listCollaborators={listCollaborators}
                          />
                          {onTaskDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleArchive) {
                                  onToggleArchive(task);
                                }
                              }}
                              className="h-6 w-6 p-0 hover:text-destructive"
                            >
                              <Archive className="h-3 w-3" />
                            </Button>
                          )}
                          {onTaskDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestTaskDelete(task.id);
                              }}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {getTasksForColumn(column.id).length === 0 && (
                      <div
                        className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg transition-colors hover:border-muted-foreground/40"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                        onDragEnter={handleDragEnter}
                      >
                        Drop tasks here or click + to add
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
    </div>
  );
};
