
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";

interface BillingStatus {
    isPaid: boolean;
    isLoading: boolean;
    checkBillingStatus: () => void;
}

export const useBillingStatus = (): BillingStatus => {
    const [isPaid, setIsPaid] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const checkBillingStatus = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock logic: check if user has paid bills
            // You can replace this with actual API call to your billing system
            const mockUnpaidUsers = ["unpaid@example.com"]; // Add test emails here
            const hasUnpaidBills = mockUnpaidUsers.includes(user.email);
            
            setIsPaid(!hasUnpaidBills);
        } catch (error) {
            console.error("Error checking billing status:", error);
            // On error, assume user is paid to avoid blocking legitimate users
            setIsPaid(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkBillingStatus();
    }, [user]);

    return { isPaid, isLoading, checkBillingStatus };
};
