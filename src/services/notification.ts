
import { toast } from "@/hooks/use-toast";
import { ToastActionElement } from "@/components/ui/toast";

/**
 * Notification types
 */
export type NotificationType = "info" | "success" | "warning" | "error";

/**
 * Notification options
 */
export interface NotificationOptions {
  /**
   * Title of the notification
   */
  title?: string;
  
  /**
   * Description of the notification
   */
  description?: string;
  
  /**
   * Duration in milliseconds
   * 
   * @default 5000
   */
  duration?: number;
  
  /**
   * Action button for the notification
   * Must be a ToastActionElement
   */
  action?: ToastActionElement;
}

/**
 * Show a notification
 */
const showNotification = (
  type: NotificationType,
  options: NotificationOptions
) => {
  const { title, description, duration = 5000, action } = options;

  // Map notification type to toast variant
  const variant = 
    type === "error" ? "destructive" : 
    type === "success" ? "success" : 
    type === "warning" ? "default" : 
    "info";
  
  return toast({
    variant,
    title,
    description,
    duration,
    action,
  });
};

/**
 * Show an info notification
 */
export const showInfo = (options: NotificationOptions) => {
  return showNotification("info", options);
};

/**
 * Show a success notification
 */
export const showSuccess = (options: NotificationOptions) => {
  return showNotification("success", options);
};

/**
 * Show a warning notification
 */
export const showWarning = (options: NotificationOptions) => {
  return showNotification("warning", options);
};

/**
 * Show an error notification
 */
export const showError = (options: NotificationOptions) => {
  return showNotification("error", options);
};

/**
 * Close all notifications.
 * 
 * Note: This function must be used within a component context, as it requires the useToast hook.
 * It cannot be called directly from a service function.
 */
export const closeAllNotifications = () => {
  // This is just a helper function to document that this operation should be performed
  // using the dismiss function from useToast() within a component
  console.warn("closeAllNotifications must be called within a component using useToast().dismiss()");
};
