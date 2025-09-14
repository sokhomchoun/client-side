import axios from "axios";
import { ProvideToken, AuthId } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { TPermissions } from "@/types";
import { Authorizations } from "@/utils/Authorization";

export function useHasPermission() {

    const token = ProvideToken();
    const auth_id = AuthId();
    const [dataHasPermission, setdataHasPermission] = useState<TPermissions[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleGetHasPermission = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`haspermission/${auth_id}`, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setdataHasPermission(response.data.data)
            }
            setLoading(false);
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const hasPermission = (permissionName: string): boolean => {
        return dataHasPermission.some((p) => p.name === permissionName);
    };

    useEffect(() => {
        handleGetHasPermission();
    },[])
    return {
        dataHasPermission,
        loading,
        hasPermission,
    }
}