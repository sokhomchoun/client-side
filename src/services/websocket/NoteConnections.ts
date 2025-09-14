import { useEffect } from "react";
import socketService from "./Socket.Service";

interface NoteSocketProps {
  email: string | null;
  handleGetNotes: () => void;
}

export const Note = ({ email, handleGetNotes }: NoteSocketProps) => {
  useEffect(() => {
    if (!email) return;

    const socket = socketService.socket;
    if (!socket) {
      console.error("Socket service not available");
      return;
    }

    const handleConnect = () => {
      socket.emit("register", { email });
    };
    const handleDisconnect = () => console.log("Socket disconnected");
    const handleError = (err: any) => console.error("Socket error:", err);

    // Handle real-time note updates from other users
    const handleNoteUpdatedFromSocket = (data: any) => {
      // Only update if the update came from another user
      if (data.updatedBy !== email) {
        handleGetNotes();
      }
    };

    // Handle note sharing
    const handleNoteSharedFromSocket = (data: any) => {
      // Only update if the share came from another user
      if (data.sharedBy !== email) {
        handleGetNotes();
      }
    };

    // Handle note removing
    const handleNoteRemovedFromSocket = (data: any) => {
      // Only update if the removal came from another user
      if (data.removedBy !== email) {
        handleGetNotes();
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);
    socket.on("note", handleGetNotes);
    socket.on("noteShared", handleNoteSharedFromSocket);
    socket.on("noteUpdated", handleNoteUpdatedFromSocket);

    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.off("note", handleGetNotes);
      socket.off("noteShared", handleNoteSharedFromSocket);
      socket.off("noteUpdated", handleNoteUpdatedFromSocket);
    };
  }, [email, handleGetNotes]);
};
