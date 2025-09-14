import axios from "axios";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { TNote } from "@/types";
import { Authorizations } from "@/utils/Authorization";
import { Note } from "@/services/websocket/NoteConnections";

export function useNote() {
  const [loading, setLoading] = useState<boolean>(false);
  const [dataNotes, setDataNotes] = useState<TNote[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const token = ProvideToken();
  const auth_id = AuthId();
  const { role, domain, email } = User();

  const handleGetNotes = async () => {
    try {
      const response = await axios.get(`notes/${auth_id}`, {
        headers: Authorizations(token),
      });
      if (response.status === 200) {
        setDataNotes(response.data.data.notes);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  //connect socket
  Note({ email, handleGetNotes });

  const handleCreateNote = async (note: {
    title: string;
    content: string;
    color: string;
  }) => {
    setLoading(true);
    try {
      const payload = {
        title: note.title,
        content: note.content,
        color: note.color,
        user_id: auth_id,
        domain: domain,
      };

      const response = await axios.post(`notes`, payload, {
        headers: Authorizations(token),
      });
      if (response.status === 201) {
        await handleGetNotes();
        toast.success(response.data.data.message);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (note: TNote) => {
    setLoading(true);
    try {
      const payload = {
        title: note.title,
        content: note.content,
        color: note.color,
      };

      const response = await axios.put(`notes/${note.id}`, payload, {
        headers: Authorizations(token),
      });
      if (response.status === 200) {
        setDataNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, ...payload } : n))
        );

        toast.success(response.data.data.message);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    setLoading(true);
    try {
      const note = dataNotes.find((n) => n.id === noteId);
      //if note status is trashed, it will be deleted forever
      if (note?.status === "trashed" || note?.is_deleted) {
        const response = await axios.delete(`notes/${noteId}`, {
          headers: Authorizations(token),
        });

        setDataNotes((prev) => prev.filter((note) => note.id !== noteId));
        toast.success(response.data.data.message);
      } else {
        // Move note to trash using toggle-delete endpoint
        const response = await axios.put(
          `notes/${noteId}/toggle-delete`,
          {},
          {
            headers: Authorizations(token),
          }
        );

        setDataNotes((prev) =>
          prev.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  status: "trashed",
                  // Keep legacy field for backward compatibility
                  is_deleted: true,
                }
              : note
          )
        );

        toast.success(response.data.data.message);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveNote = async (noteId: number) => {
    setLoading(true);
    try {
      const note = dataNotes.find((n) => n.id === noteId);
      const response = await axios.put(
        `notes/${noteId}/archive`,
        {},
        {
          headers: Authorizations(token),
        }
      );
      if (response.status === 200) {
        const isCurrentlyArchived =
          note?.status === "archived" || note?.is_archived;
        setDataNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  status: isCurrentlyArchived ? "actived" : "archived",
                  // Keep legacy field for backward compatibility
                  is_archived: !isCurrentlyArchived,
                }
              : n
          )
        );
        toast.success(response.data.data.message);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePinNote = async (noteId: number) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `notes/${noteId}/pin`,
        {},
        {
          headers: Authorizations(token),
        }
      );
      if (response.status === 200) {
        setDataNotes((prev) =>
          prev.map((note) =>
            note.id === noteId ? { ...note, is_pinned: !note.is_pinned } : note
          )
        );
        toast.success(response.data.data.message);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreNote = async (noteId: number) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `notes/${noteId}/toggle-delete`,
        {},
        {
          headers: Authorizations(token),
        }
      );
      if (response.status === 200) {
        setDataNotes((prev) =>
          prev.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  status: "actived",
                  // Keep legacy field for backward compatibility
                  is_deleted: false,
                }
              : note
          )
        );
        toast.success("Note restored successfully!");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShareNote = async (noteId: number, to: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `notes/${noteId}/share`,
        {
          to: to,
          senderId: auth_id,
        },
        {
          headers: Authorizations(token),
        }
      );
      if (response.status === 200) {
        toast.success("Note shared successfully!");
        // Refresh notes data to get updated collaborators
        handleGetNotes();
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (
    noteId: number,
    collaboratorId: number
  ) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `notes/${noteId}/remove-collaborator`,
        {
          data: { userId: collaboratorId },
          headers: Authorizations(token),
        }
      );
      if (response.status === 200) {
        toast.success("Collaborator removed successfully!");
        handleGetNotes();
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrCreateReminder = async (noteId: number, reminder_date: Date, reminder_time: string, repeat: string) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `notes/${noteId}/reminder`,
        { reminder_date, reminder_time, repeat },
        {
          headers: Authorizations(token),
        }
      );
      
      if (response.status === 200) {
        toast.success(response.data.data.message);
        handleGetNotes();
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveReminder = async (noteId: number) => {
    setLoading(true);
    try {
      const response = await axios.put(`notes/${noteId}/remove-reminder`,{}, {
        headers: Authorizations(token),
      });
      if (response.status === 200) {
        toast.success(response.data.data.message);
        handleGetNotes();
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetNotes();
  }, [email, toast]);

  return {
    loading,
    setLoading,
    dataNotes,
    setDataNotes,
    handleCreateNote,
    handleUpdateNote,
    handleGetNotes,
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
  };
}
