import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

import {
  Plus,
  Search,
  Trash2,
  Pin,
  Archive,
  Palette,
  StickyNote,
  ArchiveRestore,
  UserPlus,
  X,
  BellPlus,
  Clock3,
  CalendarPlus,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNote } from "@/hooks/useNote";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TNote } from "@/types";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { FormControl, FormItem, FormMessage } from "@/components/ui/form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useHasPermission } from "@/hooks/useHasPermission";

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

interface TCreateNote {
  title: string;
  content: string;
  color: string;
}

interface TCollaborator {
  id: number;
  email: string;
}

const noteColors = [
  { name: "Default", value: "#ffffff", class: "bg-white" },
  { name: "Scarlet Red", value: "#F7C4C1", class: "bg-[#F7C4C1]" },
  { name: "Neon Orange", value: "#FDD2B2", class: "bg-[#FDD2B2]" },
  { name: "Sunflower Yellow", value: "#FDF3BC", class: "bg-[#FDF3BC]" },
  { name: "Leaf Green", value: "#CFE4CD", class: "bg-[#CFE4CD]" },
  { name: "Forest Green", value: "#B2CBB2", class: "bg-[#B2CBB2]" },
  {
    name: "Bright Cyan",
    value: "#B2E9EB",
    class: "bg-[#B2E9EB]",
  },
  {
    name: "Coral Red",
    value: "#FECCCD",
    class: "bg-[#FECCCD]",
  },
  { name: "Midnight Blue", value: "#B4B8C4", class: "bg-[#B4B8C4]" },
  { name: "Black", value: "#B2B2B2", class: "bg-[#B2B2B2]" },
];

const Notes = () => {
  const {
    dataNotes,
    loading,
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote,
    handleArchiveNote,
    handlePinNote,
    handleRestoreNote,
    handleShareNote,
    handleRemoveCollaborator,
    handleUpdateOrCreateReminder,
    handleRemoveReminder,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
  } = useNote();

  const { hasPermission } = useHasPermission();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<TNote | null>(null);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    color: "#ffffff",
  });
  const [viewMode, setViewMode] = useState<"notes" | "archive" | "trash">(
    "notes"
  );

  const [isCollaboratorDialog, setIsCollaboratorDialog] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [sharingNote, setSharingNote] = useState<TNote | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [shouldReturnToEdit, setShouldReturnToEdit] = useState(false);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [NoteReminder, setNoteReminder] = useState<TNote | null>(null);
  const [openDate, setOpenDate] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [repeat, setRepeat] = useState<string>("none");
  const [noteToDelete, setNoteToDelete] = useState<TNote | null>(null);

  // Initialize reminder form when NoteReminder changes
  useEffect(() => {
    if (NoteReminder) {
      // Set date from remind_date
      if (NoteReminder.remind_date) {
        const reminderDate = new Date(NoteReminder.remind_date);
        setDate(reminderDate);
      } else {
        setDate(undefined);
      }

      // Set time from remind_time
      if (NoteReminder.remind_time) {
        setTime(NoteReminder.remind_time);
      } else {
        setTime("");
      }

      // Set repeat value
      if (NoteReminder.repeat) {
        setRepeat(NoteReminder.repeat);
      } else {
        setRepeat("none");
      }
    } else {
      // Reset form when no note is selected
      setDate(undefined);
      setTime("");
      setRepeat("none");
    }
  }, [NoteReminder]);

  // Update sharingNote when dataNotes changes to keep collaborators in sync
  useEffect(() => {
    if (sharingNote && dataNotes.length > 0) {
      const updatedNote = dataNotes.find((note) => note.id === sharingNote.id);
      if (updatedNote) {
        setSharingNote(updatedNote);
      }
    }
  }, [dataNotes, sharingNote?.id]);

  // Function to create a new note
  const createNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      toast.error("Please add a title or content to create a note.");
      return;
    }
    const note: TCreateNote = {
      title: newNote.title || "Untitled",
      content: newNote.content,
      color: newNote.color,
    };

    setNewNote({ title: "", content: "", color: "#E53B2F" });
    setIsCreateDialogOpen(false);
    handleCreateNote(note);
  };

  // Function to update an existing note
  const updateNote = (updatedNote: TNote) => {
    handleUpdateNote(editingNote);
    setEditingNote(null);
  };

  // Function to delete or delete forver a note
  // If the note is in trash, it will be deleted forever
  const deleteNote = (id: number) => {
    const note = dataNotes.find((note) => note.id === id);

    // If note is already trashed, ask for confirmation for permanent deletion
    if (note?.status === "trashed" || note?.is_deleted) {
      // Open confirmation dialog and store note to delete
      setNoteToDelete(note);
      setDeleteConfirmOpen(true);
      return;
    }

    handleDeleteNote(id);
  };

  // Function to toggle pin a note
  const togglePin = (id: number) => {
    const note = dataNotes.find((note) => note.id === id);
    handlePinNote(id);
  };
  // Function to toggle archive a note
  const toggleArchive = (id: number) => {
    const note = dataNotes.find((note) => note.id === id);

    handleArchiveNote(id);
  };
  //restore a note from trash
  const restoreNote = (id: number) => {
    const note = dataNotes.find((note) => note.id === id);

    handleRestoreNote(id);
  };

  //handle add collaborator
  const addCollaborator = async (noteId: number, to: string) => {
    //validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(to.trim())) {
      toast.error("Invalid email format");
      return;
    }
    if (!to.trim()) return;
    setIsInviting(true);

    try {
      await handleShareNote(noteId, to);
      setNewCollaborator("");
      setIsInviting(false);

      // Update the sharingNote with the latest data from dataNotes
      const updatedNote = dataNotes.find((note) => note.id === noteId);
      if (updatedNote && sharingNote) {
        setSharingNote(updatedNote);
      }
    } catch (error) {
      toast.error("Failed to add collaborator");
      setIsInviting(false);
    }
  };

  // Function to remove a collaborator
  const removeCollaborator = async (noteId: number, collaboratorId: number) => {
    try {
      await handleRemoveCollaborator(noteId, collaboratorId);

      // Update the sharingNote with the latest data from dataNotes
      const updatedNote = dataNotes.find((note) => note.id === noteId);
      if (updatedNote && sharingNote) {
        setSharingNote(updatedNote);
      }
    } catch (error) {
      toast.error("Failed to remove collaborator");
    }
  };

  //create or update reminder
  const createOrUpdateReminder = (
    noteId: number,
    reminder_date: Date | undefined,
    reminder_time: string,
    repeat: string
  ) => {
    // Check if date is selected
    if (!noteId || !reminder_date) {
      toast.error("Please select a date for the reminder");
      return;
    }

    // Check if time is provided
    if (!reminder_time) {
      toast.error("Please select a time for the reminder");
      return;
    }

    // Check if the selected time is in the past for today
    const isToday =
      new Date(reminder_date).toDateString() === new Date().toDateString();
    if (isToday) {
      const now = new Date();
      const [hours, minutes] = reminder_time.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);

      if (selectedTime <= now) {
        toast.error("Reminder can not in the past");
        return;
      }
    }

    try {
      handleUpdateOrCreateReminder(
        noteId,
        reminder_date,
        reminder_time,
        repeat
      );

      setReminderDialog(false);
      setNoteReminder(null);
      setDate(undefined);
      setTime("");
      setRepeat("none");
    } catch (error) {
      toast.error("Failed to create or update reminder");
    }
  };

  const removeReminder = async (noteId: number) => {
    try {
      await handleRemoveReminder(noteId);
    } catch (error) {
      toast.error("Failed to remove reminder");
    }
  };

  const filteredNotes = dataNotes.filter((note) => {
    if (!note) return false;

    // Filter based on view mode
    let statusFilter = true;
    if (viewMode === "archive") {
      statusFilter = note.status === "archived";
    } else if (viewMode === "trash") {
      // For trash, we need to check for legacy is_deleted field or a "trashed" status
      statusFilter = note.is_deleted === true || note.status === "trashed";
    } else {
      // For active notes - only show active notes that are owned or have proper permissions
      statusFilter =
        note.status === "actived" ||
        (!note.status && !note.is_archived && !note.is_deleted);
    }

    // Search filter
    const searchFilter =
      (note.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (note.content?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    return statusFilter && searchFilter;
  });

  const pinnedNotes = filteredNotes.filter((note) => note.is_pinned);
  const regularNotes = filteredNotes.filter((note) => !note.is_pinned);

  const getColorClass = (color: string) => {
    const colorObj = noteColors.find((c) => c.value === color);
    return colorObj ? colorObj.class : "";
  };

  const getColorStyle = (color: string) => {
    const colorObj = noteColors.find((c) => c.value === color);
    return colorObj ? {} : { backgroundColor: color };
  };

  const NoteCard = ({ note }: { note: TNote }) => (
    <Card
      className={`${getColorClass(
        note.color
      )} border hover:shadow-md transition-shadow cursor-pointer group relative`}
      style={getColorStyle(note.color)}
      onClick={() => {
        // Don't allow editing trashed notes
        if (note.status === "trashed" || note.is_deleted) {
          toast.error("Cannot edit notes in trash. Please restore first.");
          return;
        }
        setEditingNote(note);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-base text-black line-clamp-2">
              {note.title}
            </h3>
          </div>
          {viewMode !== "trash" && (
            <Button
              variant="ghost"
              size="icon"
              className={`opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-gray-600 ${
                note.is_pinned ? "opacity-100" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                togglePin(note.id);
              }}
            >
              <Pin
                className={`h-4 w-4 ${note.is_pinned ? "fill-current" : ""}`}
              />
            </Button>
          )}
        </div>

        <p className="text-sm text-black line-clamp-4 mb-3">{note.content}</p>

        {/* list collaborators here */}
        <div className="flex items-center gap-1 mt-1 mb-3">
          {note.collaborators && note.collaborators.length > 0 && (
            <div className="flex items-center gap-1">
              {note.collaborators.slice(0, 3).map((collaborator, index) => (
                <Avatar key={collaborator.id} className="w-6 h-6">
                  <AvatarImage
                    src={collaborator.avatar_url}
                    alt={collaborator.name}
                  />
                  <AvatarFallback className="text-xs">
                    {collaborator.name?.charAt(0) ||
                      collaborator.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {note.collaborators.length > 3 && (
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                  +{note.collaborators.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* show reminder */}
        {note.remind_date && note.remind_time && (
          <div className="flex items-center gap-3 mt-1 mb-2">
            <span
              className="flex gap-1 text-xs text-black cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setNoteReminder(note);
                setReminderDialog(true);
              }}
            >
              <Clock className="h-4 w-4 text-black" />
              {note.remind_date && note.remind_time
                ? (() => {
                    const reminderDate = new Date(note.remind_date);
                    const today = new Date();
                    const tomorrow = new Date();
                    tomorrow.setDate(today.getDate() + 1);

                    // Reset time to compare only dates
                    const reminderDateOnly = new Date(
                      reminderDate.getFullYear(),
                      reminderDate.getMonth(),
                      reminderDate.getDate()
                    );
                    const todayOnly = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate()
                    );
                    const tomorrowOnly = new Date(
                      tomorrow.getFullYear(),
                      tomorrow.getMonth(),
                      tomorrow.getDate()
                    );

                    let dateText;
                    if (reminderDateOnly.getTime() === todayOnly.getTime()) {
                      dateText = "Today";
                    } else if (
                      reminderDateOnly.getTime() === tomorrowOnly.getTime()
                    ) {
                      dateText = "Tomorrow";
                    } else {
                      dateText = reminderDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    }

                    return `${dateText}, ${note.remind_time}`;
                  })()
                : note.remind_date}
            </span>
            <X
              className="h-3 w-3 text-black cursor-pointer hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                removeReminder(note.id);
              }}
            />
          </div>
        )}

        <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-black">
            {note.last_edited_at
              ? new Date(note.last_edited_at).toLocaleDateString()
              : ""}
          </span>
          <div className="flex gap-3">
            {/* Show share button only for owners */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-600 hover:text-gray-900 dark:text-gray-600 dark:hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setNoteReminder(note);
                setReminderDialog(true);
              }}
            >
              <BellPlus className="h-4 w-4" />
            </Button>
            {hasPermission("notes.add") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-600 hover:text-gray-900 dark:text-gray-600 dark:hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setSharingNote(note);
                  setIsCollaboratorDialog(true);
                  setShouldReturnToEdit(false); // Don't return to edit dialog
                }}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            )}

            {/* Archive button */}
            {note && note.status !== "trashed" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-600 hover:text-gray-900 dark:text-gray-600 dark:hover:text-white"
                title={viewMode === "notes" ? "Archive Note" : "Unarchive Note"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleArchive(note.id);
                }}
              >
                {viewMode === "notes" ? (
                  <Archive className="h-4 w-4" />
                ) : (
                  <ArchiveRestore className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Restore button - only in trash view */}
            {viewMode === "trash" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-600 hover:text-gray-900 dark:text-gray-600 dark:hover:text-white"
                title="Restore from trash"
                onClick={(e) => {
                  e.stopPropagation();
                  restoreNote(note.id);
                }}
              >
                <ArchiveRestore className="h-4 w-4" />
              </Button>
            )}

            {/* Delete button - only for admin permission */}
            {note && hasPermission("notes.delete") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-700"
                title={
                  note.status === "trashed" || note.is_deleted
                    ? "Delete permanently"
                    : "Move to trash"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Notes</h1>

        {/* View Mode Tabs */}
        <div className="mb-4">
          <Tabs
            value={viewMode}
            onValueChange={(value) =>
              setViewMode(value as "notes" | "archive" | "trash")
            }
          >
            <TabsList>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archive
              </TabsTrigger>
              <TabsTrigger value="trash" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Trash
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search and Create */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {viewMode === "notes" && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                {hasPermission("notes.create") && (
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Note
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) =>
                      setNewNote((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                  <Textarea
                    placeholder="Take a note..."
                    value={newNote.content}
                    onChange={(e) =>
                      setNewNote((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={6}
                  />

                  {/* Color Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {noteColors.map((color) => (
                        <button
                          key={color.value}
                          className={`w-8 h-8 rounded-full border-2 ${
                            color.class
                          } ${
                            newNote.color === color.value
                              ? "border-gray-800"
                              : "border-gray-300"
                          }`}
                          onClick={() =>
                            setNewNote((prev) => ({
                              ...prev,
                              color: color.value,
                            }))
                          }
                        />
                      ))}

                      {/* <div className="relative">
                        <input
                          ref={(input) => {
                            if (input) {
                              input.addEventListener("click", (e) =>
                                e.stopPropagation()
                              );
                            }
                          }}
                          type="color"
                          value={newNote.color}
                          onChange={(e) =>
                            setNewNote((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer opacity-0 absolute inset-0"
                        />
                        <div
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center ${
                            !noteColors.find((c) => c.value === newNote.color)
                              ? "border-gray-800"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: newNote.color }}
                          title="Custom color picker"
                          onClick={(e) => {
                            e.preventDefault();
                            const input =
                              e.currentTarget.parentElement?.querySelector(
                                'input[type="color"]'
                              ) as HTMLInputElement;
                            if (input) {
                              input.click();
                            }
                          }}
                        >
                          <Palette className="h-4 w-4 text-white drop-shadow-sm" />
                        </div>
                      </div> */}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createNote}>Create Note</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Notes Masonry Grid */}
      <div className="space-y-8">
        {pinnedNotes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-600">Pinned</h2>
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {pinnedNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-4">
                  <NoteCard note={note} />
                </div>
              ))}
            </div>
          </div>
        )}

        {regularNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <h2 className="text-lg font-semibold mb-4 text-gray-600">
                Others
              </h2>
            )}
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {regularNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-4">
                  <NoteCard note={note} />
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <StickyNote className="h-16 w-16 mx-auto mb-4" />
              {viewMode === "notes" && (
                <>
                  <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
                  <p>Create your first note to get started!</p>
                </>
              )}

              {viewMode === "archive" && (
                <>
                  <h3 className="text-xl font-semibold mb-2">
                    No archived notes
                  </h3>
                  <p>Archive notes to see them here.</p>
                </>
              )}
              {viewMode === "trash" && (
                <>
                  <h3 className="text-xl font-semibold mb-2">
                    No trashed notes
                  </h3>
                  <p>Deleted notes will appear here.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Note Dialog */}
      {editingNote && hasPermission("notes.edit") && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note title..."
                value={editingNote.title}
                onChange={(e) =>
                  setEditingNote((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
              />
              <Textarea
                placeholder="Take a note..."
                value={editingNote.content}
                onChange={(e) =>
                  setEditingNote((prev) =>
                    prev ? { ...prev, content: e.target.value } : null
                  )
                }
                rows={Math.max(
                  8,
                  Math.min(18, editingNote.content.split("\n").length + 3)
                )}
              />

              {/* Color Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {noteColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${
                        color.class
                      } ${
                        editingNote.color === color.value
                          ? "border-gray-800"
                          : "border-gray-300"
                      }`}
                      onClick={() =>
                        setEditingNote((prev) =>
                          prev ? { ...prev, color: color.value } : null
                        )
                      }
                    />
                  ))}
                  {/* Custom color picker */}
                  {/* <div className="relative">
                    <input
                      ref={(input) => {
                        if (input) {
                          input.addEventListener("click", (e) =>
                            e.stopPropagation()
                          );
                        }
                      }}
                      type="color"
                      value={editingNote.color}
                      onChange={(e) =>
                        setEditingNote((prev) =>
                          prev ? { ...prev, color: e.target.value } : null
                        )
                      }
                      className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer opacity-0 absolute inset-0"
                    />
                    <div
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center ${
                        !noteColors.find((c) => c.value === editingNote.color)
                          ? "border-gray-800"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: editingNote.color }}
                      title="Custom color picker"
                      onClick={(e) => {
                        e.preventDefault();
                        const input =
                          e.currentTarget.parentElement?.querySelector(
                            'input[type="color"]'
                          ) as HTMLInputElement;
                        if (input) {
                          input.click();
                        }
                      }}
                    >
                      <Palette className="h-4 w-4 text-white drop-shadow-sm" />
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Collaborators */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Collaborators</label>

                <div
                  className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSharingNote(editingNote);
                    if (hasPermission("notes.add")) {
                      setIsCollaboratorDialog(true);
                    }
                    setEditingNote(null);
                    setShouldReturnToEdit(true);
                  }}
                  title="Click to manage collaborators"
                >
                  {editingNote.collaborators &&
                  editingNote.collaborators.length > 0 ? (
                    editingNote.collaborators.map((collaborator) => (
                      <Avatar
                        key={collaborator.id}
                        title={collaborator.email}
                        className="cursor-pointer"
                      >
                        <AvatarImage
                          src={collaborator.avatar_url}
                          alt={collaborator.name || collaborator.email}
                        />
                        <AvatarFallback>
                          {collaborator.name?.charAt(0) ||
                            collaborator.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg">
                      <UserPlus className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Click to add collaborators
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
                <Button onClick={() => updateNote(editingNote)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add collaborator dialog */}
      {isCollaboratorDialog && sharingNote && (
        <Dialog
          open={isCollaboratorDialog}
          onOpenChange={(open) => {
            if (!open) {
              // Only restore edit dialog if coming from edit dialog
              if (shouldReturnToEdit) {
                setEditingNote(sharingNote);
              }
              setIsCollaboratorDialog(false);
              setSharingNote(null);
              setShouldReturnToEdit(false);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Share "{sharingNote.title}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Current Collaborators */}
              <div className="space-y-2">
                <div className="flex flex-col gap-0 max-h-60 overflow-y-auto">
                  {sharingNote.collaborators &&
                  sharingNote.collaborators.length > 0 ? (
                    sharingNote.collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center justify-between p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={collaborator.avatar_url}
                              alt={collaborator.name}
                            />
                            <AvatarFallback className="text-sm">
                              {collaborator.name?.charAt(0) ||
                                collaborator.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium flex gap-1 items-center">
                              {collaborator.name}
                              {collaborator.is_owner && (
                                <div className="flex gap-1 text-gray-400">
                                  (Owner)
                                </div>
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {collaborator.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!collaborator.is_owner &&
                            sharingNote.is_owner &&
                            hasPermission("notes.remove") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                onClick={() =>
                                  removeCollaborator(
                                    sharingNote.note_id,
                                    collaborator.id
                                  )
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No collaborators yet
                    </p>
                  )}
                </div>
              </div>

              {/* Collaborator */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Add Collaborator</label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address..."
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      addCollaborator(sharingNote.id, newCollaborator)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      addCollaborator(sharingNote.id, newCollaborator)
                    }
                    disabled={!newCollaborator.trim() || isInviting}
                  >
                    {isInviting ? "Inviting..." : "Invite"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Only restore edit dialog if coming from edit dialog
                    if (shouldReturnToEdit) {
                      setEditingNote(sharingNote);
                    }
                    setIsCollaboratorDialog(false);
                    setSharingNote(null);
                    setShouldReturnToEdit(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* reminder dialog */}
      {reminderDialog && NoteReminder && (
        <Dialog
          open={!!reminderDialog}
          onOpenChange={(open) => {
            if (!open) {
              setReminderDialog(false);
              setNoteReminder(null);
              setDate(undefined);
              setTime("");
              setRepeat("none");
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Remind me later</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note title..."
                value={NoteReminder?.title || ""}
                disabled
              />

              <div className="flex items-center justify-start gap-6">
                <CalendarPlus />
                <div className="flex flex-col gap-3">
                  <Popover open={openDate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal"
                      >
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[240px] h-auto max-h-[300px] overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDate(date);
                          setOpenDate(false);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="origin-top-left scale-[0.8]"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* select time */}
              <div className="flex items-center justify-start gap-6">
                <Clock3 />
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          placeholder="time"
                          className="pl-9"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                        />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              </div>
              <div className="flex items-center justify-start gap-6">
                <p className="text-gray-500">Repeat:</p>
                <Select value={repeat} onValueChange={setRepeat}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none" defaultChecked>
                        None
                      </SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReminderDialog(false);
                    setNoteReminder(null);
                    setDate(undefined);
                    setTime("");
                    setRepeat("none");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    createOrUpdateReminder(NoteReminder?.id, date, time, repeat)
                  }
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* dialog confirm permanent delete note */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setNoteToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {noteToDelete?.title ? (
                <>
                  the note{" "}
                  <span className="font-medium">"{noteToDelete.title}"</span>.
                </>
              ) : (
                "this note."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (noteToDelete) {
                  handleDeleteNote(noteToDelete.id);
                }
                setDeleteConfirmOpen(false);
                setNoteToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notes;
