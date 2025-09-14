import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TUser, TBoardColumn } from "@/types/task";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { BoardColumnsManager } from "./BoardColumnsManager";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  status: z.string().min(1, "Status is required"),
  due_date: z.date().optional(),
  time: z.string().optional(),
  assignedToId: z.string().optional(),
  collaborators: z
    .array(
      z.object({
        id: z.number(),
        domain: z.string(),
      })
    )
    .optional(),
});

export type TaskFormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>;
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
  availableUsers: TUser[];
  boardColumns: TBoardColumn[];
  onCreateColumn: (column: { name: string; color: string; }) => Promise<any>;
  onUpdateColumn: (column: { id: number; name: string; color: string; }) => Promise<any>;
  onDeleteColumn: (id: number) => Promise<any>;
  onUpdateColumnPosition: (columnId: number, newPosition: number) => Promise<any>;
  onColumnsUpdate?: (updatedColumns: TBoardColumn[]) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  availableUsers,
  boardColumns,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onUpdateColumnPosition,
  onColumnsUpdate,

}) => {
  const { t } = useLanguage();
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    Array<{ id: number; domain: string }>
  >(
    defaultValues?.collaborators
      ? defaultValues.collaborators.map((c) => ({ id: c.id, domain: c.domain }))
      : []
  );

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedToId: "unassigned",
      collaborators: [],
      ...defaultValues,
    },
  });

  // Check for default status from localStorage
  useEffect(() => {
    const defaultStatus = localStorage.getItem("defaultTaskStatus");
    if (defaultStatus && !defaultValues?.status) {
      form.setValue("status", defaultStatus);
      localStorage.removeItem("defaultTaskStatus"); // Clean up
    }
  }, [form, defaultValues]);

  // Update collaborators when selectedCollaborators changes
  useEffect(() => {
    form.setValue("collaborators", selectedCollaborators);
  }, [selectedCollaborators, form]);

  const handleCollaboratorToggle = (userId: number, domain: string) => {
    setSelectedCollaborators((prev) =>
      prev.find((c) => c.id === userId)
        ? prev.filter((c) => c.id !== userId)
        : [...prev, { id: userId, domain }]
    );
  };

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit(data);
    form.reset();
  };

  const handleColumnsChange = useCallback(
    (updatedColumns: TBoardColumn[]) => {
      if (onColumnsUpdate) {
        onColumnsUpdate(updatedColumns); // notify parent
      }
    },
    [onColumnsUpdate]
  );

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-semibold">
        {defaultValues ? "Edit Task" : "New Task"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter task description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {boardColumns.map((column) => (
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
                    {boardColumns.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground">
                        No results found.
                      </div>
                    )}
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
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        placeholder="Select time"
                        className="pl-9"
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedToId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="collaborators"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collaborator</FormLabel>
                <div className="border rounded-md p-3">
                  {availableUsers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableUsers.map((user) => (
                        <Badge
                          key={user.id}
                          variant={
                            selectedCollaborators.find((c) => c.id === user.id)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            handleCollaboratorToggle(user.id, user.domain)
                          }
                        >
                          <Avatar className="h-4 w-4 mr-1">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {user.name}
                          {selectedCollaborators.find(
                            (c) => c.id === user.id
                          ) && <span className="ml-1 text-xs">✓</span>}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No users available
                    </p>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {defaultValues ? `Edit Task` : `New Task`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
