import axios from "axios";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { TPermissions } from "@/types";
import { Authorizations } from "@/utils/Authorization";

export function useUrl() {

    const token = ProvideToken();
    const auth_id = AuthId();
    const [dataUrl, setDataUrl] = useState<TPermissions[]>([]);
    const [isDomain, setIsDomain] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleGetUrl = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`url/${auth_id}`, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataUrl(response.data.data.permissions);
                setIsDomain(response.data.data.domain_list);
                
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetUrl();
    },[])
    
    return {
        dataUrl,
        isDomain,
        loading,
        handleGetUrl,
        // domain
    }
}