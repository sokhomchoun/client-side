import { useEffect, useState } from "react";
import axios from "axios";
import { User, ProvideToken, AuthId } from "@/tokens/token";
import { Authorizations } from "@/utils/Authorization";
import { TNotification } from "@/types";
import socketService from "@/services/websocket/Socket.Service";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/services/websocket/NotificationConnections";

export function useNotification() {

    const token = ProvideToken();
    const { email, domain } = User();
    const auth_id = AuthId();
    const { toast,  dismiss } = useToast();
    const [notifications, setNotifications] = useState<TNotification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleGetNotification = async () => {
        if (!email) {
            console.log("No user email available, skipping notification fetch");
            return;
        }
        try {
            const payload = { domain: domain };
            const response = await axios.post('contact/notifications', { email: email }, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                const notificationList = response.data?.data?.notifications || [];
                setNotifications(notificationList);
                setUnreadCount(response.data.data.count)
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            dismiss(errorMessage);
        }
    };

    // Handle incoming socket notifications
    const handleNewNotification = (data: TNotification) => {
        // Check if notification is for current user
        if (data.email && data.email.toLowerCase() !== email.toLowerCase()) {
            return;
        }
        const newNotification: TNotification = {
            id: data.id || Date.now(),
            message: data.message,
            createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
        };
        
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        setHasUnread(true);
        
        // Show toast notification
        toast({
            title: "New Notification",
            description: data.message,
            duration: 5000,
        });
    };

    // Notifications connection from socket
    Notification({ email, handleNewNotification });

    const handleMarkAllAsRead = async () => {
        try {
            const payload = { user_id: auth_id, email: email }
            const response = await axios.post('contact/markall', payload, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetNotification();
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            dismiss(errorMessage);
        }
    };

    useEffect(() => {
        handleGetNotification()
    }, [])


    return {
        notifications,
        unreadCount,
        setHasUnread,
        handleMarkAllAsRead,
    }
}