import React from "react";
import { TTask } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface TaskCardProps {
  task: TTask;
}
export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Card
      className="mb-2 cursor-grab active:cursor-grabbing"
      data-task-id={task.id}
    >
      <div
        className="h-1"
        style={{ backgroundColor: task.boardColumn.color }}
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-medium mb-1 truncate">{task.title ? task.title.substring(0, 33) + (task.title.length > 33 ? '...' : '') : ''}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>

            {/* Assigned user and collaborators */}
            {task.assignee && (
              <div className="flex items-center mt-2 text-sm">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback>
                    {task.assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[120px]">
                  {task.assignee.name}
                </span>

                {task.task_collaborators && task.task_collaborators.length > 0 && (
                  <div className="flex items-center ml-2">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{task.task_collaborators.length}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {task.due_date && (
          <div className="text-xs text-muted-foreground mt-2">
            Due: {format(task.due_date, "MMM dd, yyyy")}
            {task.time && ` at ${task.time}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
