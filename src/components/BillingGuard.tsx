
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { useAuth } from "@/contexts/AuthProvider";

interface BillingGuardProps {
  children: React.ReactNode;
}

const BillingGuard = ({ children }: BillingGuardProps) => {
    const { isPaid, isLoading } = useBillingStatus();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated && !isPaid) {
        navigate("/billing-block", { replace: true });
        }
    }, [isPaid, isLoading, isAuthenticated, navigate]);

    if (isLoading) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
        );
    }

    if (isAuthenticated && !isPaid) {
        return null;
    }

    return <>{children}</>;
};

export default BillingGuard;
