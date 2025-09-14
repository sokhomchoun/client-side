import { useEffect } from "react";
import socketService from "./Socket.Service";
import { TNotification } from "@/types";

interface NotificationSocketProps {
    email: string | null;
    handleNewNotification: (data: TNotification) => void;
}

export const Notification = ({
    email,
    handleNewNotification,
}: NotificationSocketProps) => {

    useEffect(() => {
        if (!email) return;

        const socket = socketService.socket;
        if (!socket) {
            console.error("Socket service not available");
            return;
        }

        const handleConnect = () => { socket.emit("register", { email }) };
        const handleDisconnect = () => console.log("Socket disconnected");
        const handleError = (err: any) => console.error("Socket error:", err);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("error", handleError);
        socket.on("notification", handleNewNotification);

        if (socket.connected) handleConnect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("error", handleError);
            socket.off("notification", handleNewNotification);
        };
    }, [email, handleNewNotification]);
};
