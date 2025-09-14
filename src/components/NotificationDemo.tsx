
import React from "react";
import { Button } from "@/components/ui/button";
import { showSuccess, showInfo, showWarning, showError } from "@/services/notification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const NotificationDemo: React.FC = () => {
  // We need the dismiss function from useToast for the close all notifications button
  const { dismiss } = useToast();

  const handleShowSuccess = () => {
    showSuccess({
      title: "Success!",
      description: "Your operation completed successfully.",
      duration: 5000,
    });
  };

  const handleShowInfo = () => {
    showInfo({
      title: "Information",
      description: "Here's some important information for you.",
      duration: 5000,
    });
  };

  const handleShowWarning = () => {
    showWarning({
      title: "Warning",
      description: "There might be an issue that needs your attention.",
      duration: 5000,
    });
  };

  const handleShowError = () => {
    showError({
      title: "Error",
      description: "An error occurred while processing your request.",
      duration: 5000,
    });
  };

  const handleCloseAll = () => {
    dismiss(); // Using the dismiss function from useToast hook
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification System</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleShowSuccess} variant="outline">
            Show Success
          </Button>
          <Button onClick={handleShowInfo} variant="outline">
            Show Info
          </Button>
          <Button onClick={handleShowWarning} variant="outline">
            Show Warning
          </Button>
          <Button onClick={handleShowError} variant="outline">
            Show Error
          </Button>
          <Button onClick={handleCloseAll} variant="outline">
            Close All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationDemo;
