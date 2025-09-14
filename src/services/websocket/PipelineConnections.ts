import { useEffect } from "react";
import socketService from "./Socket.Service";
import { TPipelines } from "@/types";

interface PipelineSocketProps {
    email: string | null;
    handleGetPipelineShared: (data: TPipelines) => void;
}

export const SharePipelines = ({
    email,
    handleGetPipelineShared,
}: PipelineSocketProps) => {
    
    useEffect(() => {
        if (!email || !socketService) return;

        const socket = socketService.socket;
        if (!socket) {
            console.error("Socket service not available");
            return;
        }
        const handleConnect = () => { socket.emit("register", { email }) };
        const handleDisconnect = () => console.log("Socket disconnected");
        const handleError = (err: any) => console.error("Socket error:", err);
        
        // Register event
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("error", handleError);
        socket.on("pipeline_shared", handleGetPipelineShared);

        // If already connected, register immediately
        if (socket.connected) {
            handleConnect();
        }
        // Cleanup
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("error", handleError);
            socket.off("pipeline_shared", handleGetPipelineShared);
        };
    }, [email, handleGetPipelineShared]);
};


