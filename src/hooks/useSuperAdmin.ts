import { useState, useEffect } from "react";
import axios from "axios";
import { ProvideToken } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { Authorizations } from "@/utils/Authorization";
import { TClient, TClientStats } from "@/types";

export function useSuperAdmin () {

    const token = ProvideToken();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    // const [clientsPerPage, setClientsPerPage] = useState(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [dataClient, setDataClient] = useState<TClient[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [totalCount, settotalCount] = useState<number>(0);
    const [totals, setTotals] = useState<TClientStats | null>(null);
    const [blockLoading, setBlockLoading] = useState<boolean>(false);

    const [editingLimits, setEditingLimits] = useState({
        id: null,
        contactsLimit: '',
        storageLimit: '',
        amount: null
    });

    const handleGetClient = async (page = 1, search?: string) => {
        try {
            setLoading(true);
            const payload = {
                page: page,
                limit: itemsPerPage,
                search: search || searchTerm || ''
            }
            const response = await axios.get('superAdmin/client', {
                params: payload,
                headers: Authorizations(token)
            });

            if (response.status === 200) {
                setDataClient(response.data.data.clients);
                settotalCount(response.data.data.paginations.total);
                setCurrentPage(response.data.data.paginations.currentPage);
                setTotals(response.data.data.totals);
                setLoading(false);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const handleSearchClient = async (value: string) => {
        try {
            await handleGetClient(currentPage, value);
        } catch (err) {
            console.error('Search failed:', err);
        }
    }

    const handleBlockAccess = async (clientId: number) => {
       try {
            setBlockLoading(true);
            const response = await axios.put(`superAdmin/block-access/${clientId}`, {}, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
                handleGetClient();
                setBlockLoading(false);
            }
       } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setBlockLoading(false);
       }
    };

    const handleUpGradeToPro = async (clientId: number) => {
        try {
            const response = await axios.put(`superAdmin/upgrade/${clientId}`, {}, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetClient();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleSaveLimits = async (editingLimits: TClient) => {
        try {
            const payload = {
                id: editingLimits.id,
                limited_contact: editingLimits.contactsLimit,
                limited_storage: editingLimits.storageLimit,
                amount: editingLimits.amount
            }

            const response = await axios.post('superAdmin/custom', payload, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetClient();
                toast.success(response.data.data.message);
                setSelectedClient(null);
                setEditingLimits({
                    id: null,
                    contactsLimit: '',
                    storageLimit:  '',
                    amount: ''
                });
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    }

    useEffect(() => {
        if (token) {
            handleGetClient(currentPage);
        }
       
    },[currentPage,])

    return {
        handleGetClient,
        dataClient,
        loading,
        handleBlockAccess,
        handleUpGradeToPro,
        handleSaveLimits,
        editingLimits,
        setEditingLimits,
        handleSearchClient,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        totalCount,
        totals,
        blockLoading
    }
}