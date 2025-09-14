import axios from "axios";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { TTaskNote, TTask, TCollaborator } from "@/types/task";
import { Authorizations } from "@/utils/Authorization";
import { log } from "node:console";
// import { Note } from "@/services/websocket/NoteConnections";

export function useTask() {
  const [loading, setLoading] = useState<boolean>(false);
  const [dataTasks, setDataTasks] = useState<TTaskNote[]>([]);
  const [currentNote, setCurrentNote] = useState<string>("");
  const [monthlyNoteData, setMonthlyNoteData] = useState<TTaskNote | null>(
    null
  );
  const [listBoardColumn, setListBoardColumn] = useState<any[]>([]);
  const [listTasks, setListTasks] = useState<TTask[]>([]);
  const [listCollaborators, setListCollaborators] = useState<any[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const token = ProvideToken();
  const auth_id = AuthId();
  const { role, domain, email } = User();

  const handleCreateOrUpdateMonthlyNote = async (note: {
    content: string;
    month: number;
    year: number;
  }) => {
    setLoading(true);
    try {
      const payload = {
        content: note.content,
        user_id: auth_id,
        domain: domain,
        month: note.month,
        year: note.year,
      };

      const response = await axios.post(`task/monthly-note`, payload, {
        headers: Authorizations(token),
      });
      if (response.status) {
        toast.success(response.data.data.message);
        setCurrentNote(response.data.data.content);
        setMonthlyNoteData(response.data.data);
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

  const handleGetMonthlyNote = async (month: number, year: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`task/monthly-note`, {
        headers: Authorizations(token),
        params: {
          user_id: auth_id,
          domain: domain,
          month: month,
          year: year,
        },
      });
      if (response.status) {
        // Handle both single note and empty response
        const noteData = response.data.data;
        if (noteData && noteData.content !== undefined) {
          setCurrentNote(noteData.content);
          setMonthlyNoteData(noteData);
        } else {
          setCurrentNote("");
          setMonthlyNoteData(null);
        }
      }
    } catch (err) {
      // If note doesn't exist (404), it's not really an error
      if (err?.response?.status === 404) {
        setCurrentNote("");
        setMonthlyNoteData(null);
      } else {
        const errorMessage =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "An unexpected error occurred.";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  //   boardColumns
  const handleCreateBoardColumn = async (column: {
    name: string;
    color: string;
  }) => {
    setLoading(true);
    try {
      const payload = {
        ...column,
        user_id: auth_id,
        domain: domain,
      };

      const response = await axios.post(`task/board-column`, payload, {
        headers: Authorizations(token),
      });
      if (response.status) {
        toast.success(response.data.data.message);
        handleGetBoardColumns();
      }
      return response;
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

  const handleGetBoardColumns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`task/board-column`, {
        headers: Authorizations(token),
        params: {
          user_id: auth_id,
          domain: domain,
        },
      });
      if (response.status === 200) {
        setListBoardColumn(response.data.data);
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

  const handleUpdateBoardColumn = async (column: {
    id: number;
    name: string;
    color: string;
  }) => {
    setLoading(true);
    try {
      const payload = {
        ...column,
        user_id: auth_id,
        domain: domain,
      };

      const response = await axios.put(
        `task/board-column/${column.id}`,
        payload,
        {
          headers: Authorizations(token),
        }
      );

      if (response.status) {
        toast.success(response.data.data.message);
        handleGetBoardColumns();
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

  const handleUpdateBoardColumnPosition = async (
    id: number,
    position: number
  ) => {
    setLoading(true);
    try {
      const payload = {
        user_id: auth_id,
        domain: domain,
        position: position,
      };

      const response = await axios.put(
        `task/board-column/${id}/position`,
        payload,
        {
          headers: Authorizations(token),
        }
      );
      if (response.status) {
        setListBoardColumn((prev) =>
          prev.map((col) => (col.id === id ? { ...col, position } : col))
        );
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

  const handleDeleteBoardColumn = async (Id: number) => {
    setLoading(true);
    try {
      const payload = { domain: domain, user_id: auth_id };
      const response = await axios.delete(`task/board-column/${Id}`, {
        headers: Authorizations(token),
        data: payload,
      });

      if (response.status) {
        toast.success(response.data.data.message);
        setListBoardColumn((prev) => prev.filter((col) => col.id !== Id));
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

  // task
  const handleCreateTask = async (task: {
    title: string;
    description: string;
    boardColumnId: number;
    due_date: Date | null;
    time: string | null;
    assignee_id: number | null;
    collaborators: Array<{ id?: number; domain?: string }>;
  }) => {
    setLoading(true);
    try {
      const payload = {
        ...task,
        user_id: auth_id,
        domain: domain,
      };

      const response = await axios.post("task", payload, {
        headers: Authorizations(token),
      });

      if (response.status) {
        toast.success(response.data.data.message);
        handleGetTasks();
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

  const handleUpdateTaskById = async (
    task: {
      id: number;
      title: string;
      description: string;
      boardColumnId: number | null;
      due_date: Date | null;
      time: string | null;
      assignee_id: number | null;
      collaborators: Array<{ id?: number; domain?: string }>;
    },
    taskId: number
  ) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `task/${taskId}`,
        { ...task, user_id: auth_id, domain: domain },
        {
          headers: Authorizations(token),
        }
      );
      if (response.status) {
        toast.success(response.data.data.message);
        handleGetTasks();
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

  const handleDeleteTaskById = async (Id: number) => {
    try {
      const response = await axios.delete(`task/${Id}`, {
        headers: Authorizations(token),
        data: { user_id: auth_id, domain: domain },
      });
      if (response.status) {
        toast.success(response.data.data.message);
        setListTasks((prev) => prev.filter((task) => task.id !== Id));
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  const handleGetTasks = async () => {
    setLoading(true);
    try {
      const payload = {
        user_id: auth_id,
        domain: domain,
      };
      const response = await axios.get("task", {
        headers: Authorizations(token),
        params: payload,
      });
      if (response.status) {
        setListTasks(response.data.data);
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

  const handleUpdateTaskStatus = async (taskId: number, columnId: number) => {
    setLoading(true);
    try {
      const payload = {
        columnId,
        user_id: auth_id,
        domain: domain,
      };

      const response = await axios.put(`task/${taskId}/status`, payload, {
        headers: Authorizations(token),
      });

      if (response.status) {
        toast.success(response.data.data.message);
        handleGetTasks();
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  //user for collaborators
  const handleGetUsersByDomain = async () => {
    setLoading(true);
    try {
      const response = await axios.get("task/collaborators", {
        headers: Authorizations(token),
        params: { domain: domain },
      });
      if (response.status) {
        setListCollaborators(response.data.data);
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

  const handleToggleArchive = async (taskId: number) => {
    setLoading(true);
    try {
      const payload = {
        user_id: auth_id,
        domain: domain,
      };
      const response = await axios.put(`task/${taskId}/toggle-status`, payload, {
        headers: Authorizations(token),
      });
      if (response.status) {
        toast.success(response.data.data.message);
        handleGetTasks();
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    auth_id,
    domain,
    loading,
    setLoading,
    dataTasks,
    setDataTasks,
    currentNote,
    setCurrentNote,
    monthlyNoteData,
    setMonthlyNoteData,
    listBoardColumn,
    setListBoardColumn,
    handleCreateOrUpdateMonthlyNote,
    handleGetMonthlyNote,
    handleCreateBoardColumn,
    handleUpdateBoardColumn,
    handleDeleteBoardColumn,
    handleUpdateBoardColumnPosition,
    handleGetBoardColumns,
    listTasks,
    setListTasks,
    listCollaborators,
    setListCollaborators,
    handleCreateTask,
    handleGetTasks,
    handleGetUsersByDomain,
    handleDeleteTaskById,
    handleUpdateTaskById,
    handleUpdateTaskStatus,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleToggleArchive,
  };
}
