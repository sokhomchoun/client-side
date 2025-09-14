import axios from "axios";
import { useState, useEffect } from "react";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { TPermissions, TRoles } from "@/types";
import { Permission } from "@/types/roles";
import { MOCK_PERMISSIONS } from "@/constants/permissions";
import { toast } from "@/components/ui/sonner";
import { TUsers, TClient } from "@/types";
import { Authorizations } from "@/utils/Authorization";

export function usePermission() {

    const token = ProvideToken();
    const auth_id = AuthId();
    const { domain, client_id } = User();

    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<TRoles[]>([]);
    const [dataRoles, setDataRoles] = useState<TRoles[]>([]);
    const [dataUsers, setDataUser] = useState<TUsers[]>([]);
    const [count, setCount] = useState<number>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [countPagination, setCountPagination] = useState<number>(0);
    const [dataClient, setDataClient] = useState<TClient[]>([]);

    const handleGetClientPermission = async () => {
        try {
            setLoading(true);
            const payload = { domain: domain }
            const response = await axios.get(`haspermission/client/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataClient(response.data.data)
                setLoading(false);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };
    
    const handleSubmit = async (data: {
        id: string, name: string; description: string; color: string; permissions: string[]}, 
        onSuccess?: () => void,
        isEditing: boolean = false
    ) => {
        try {
            if (!data.permissions || data.permissions.length === 0) {
                toast.error("Please select at least one permission.");
                return;
            }
            const allPermissions: Permission[] = MOCK_PERMISSIONS;
            const permissionsAccess: TPermissions[] = data.permissions.map(id => {
                const matched = allPermissions.find(p => p.id === id);
                return {
                    url: matched?.url || '',
                    name: matched?.name || '',
                    category: matched?.category || ''
                };
            });
            const payload = {
                id: data.id,
                user_id: auth_id,
                domain: domain,
                name: data.name,
                color: data.color,
                description: data.description,
                permissions: permissionsAccess,
                client_id: client_id
            };

            const url = isEditing ? `role/${data.id}` : 'role';
            const method = isEditing ? 'put' : 'post';

            const response = await axios[method](url, payload, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleGetRoles = async (page = 1) => {
        try {
            setLoading(true);
            const payload = { auth_id: auth_id, page: page, limit: itemsPerPage, domain: domain }
            const response = await axios.get('role', {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setData(response.data.data.roles);
                setCountPagination(response.data.data.paginations.totalRoles);
                setCurrentPage(response.data.data.paginations.currentPage);
                setLoading(false);
            }
        } catch (err) {
            console.error("Error fetching roles:", err?.response?.data || err.message);
            setLoading(false); 
        } 
    };

    const handleDeleteRole = async (roleId: number) => {
        try {
            setLoading(false);
            const response = await axios.delete(`role/${roleId}`, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast(response.data.data.message);
                handleGetRoles();
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleGetRoleUsers = async () => {
        try {
            const payload = { domain: domain };
            setLoading(true);
            const response = await axios.get('role/user', {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataRoles(response.data.data);
                setLoading(false);
            }
        } catch (err) {
            const errMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errMessage);
        }
    };

    const handleSubmitRoles = async (data: TUsers, onSuccess?: () => void) => {
        try {
            const payload = {
                id: data.id,
                user_id: auth_id,
                domain: domain,
                email: data.email,
                name: data.name,
                password_hash: data.password_hash,
                role: data.role,
                client_id: client_id
            };
            const response = await axios.post('role/create/user', payload, {
               headers: Authorizations(token)
            });
            if (response.status === 201) {
                toast.success(response.data.data.message);
                if (onSuccess) onSuccess();
            }
            
        } catch (err) {
            const errMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errMessage);
        }
    };

    const handleGetPermission = async (page = 1) => {
        try {
            setLoading(true);
            const payload = { page: page, limit: itemsPerPage, auth_id: auth_id, domain }
            const response = await axios.get('role/get-permission', {
                params: payload,
                headers: Authorizations(token)
            }); 
            if (response.status === 200) {
                setDataUser(response.data.data.users);
                setCount(response.data.data.count)
                setCountPagination(response.data.data.paginations.totalUsers);
                setCurrentPage(response.data.data.paginations.currentPage);
                setLoading(false);
            }
        } catch (err) {
            const errMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errMessage);
            setLoading(false);
        }
    };

    const handleSubmitEditUser = async (data: TUsers) => {
        try {
            const payload = {   
                auth_id: auth_id,
                name: data.name,
                email: data.email,
                role: data.role,
                status: data.status
            };
            const response = await axios.put(`role/update-user/${data.id}`, payload, {
               headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errMessage);
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const payload = {
                auth_id: auth_id
            }
            const response = await axios.delete(`role/user-delete/${userId}`, {
                data: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetPermission();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errMessage);
            setLoading(false);
        }
    };

    const generatePagination = (totalPages: number, currentPage: number): (number | string)[] => {
        const pagination: (number | string)[] = [];
        pagination.push(1);
        if (currentPage > 2) pagination.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pagination.push(i);
        }
        if (currentPage < totalPages - 2) pagination.push('...');
        if (totalPages > 1) pagination.push(totalPages);
        return pagination;
    };

    const totalPages = Math.ceil(countPagination / itemsPerPage);
    const pages = generatePagination(totalPages, currentPage);
    
    useEffect(() => {
        handleGetRoleUsers();
        // display for paginations
        if (auth_id && token) {
            handleGetRoles(currentPage);
            handleGetPermission(currentPage);
            handleGetClientPermission();
        }
    },[currentPage])

    return {
        handleSubmit,
        loading,
        data,
        handleGetRoles,
        handleDeleteRole,
        dataRoles,
        handleSubmitRoles,
        dataUsers,
        count,
        handleGetPermission,
        handleSubmitEditUser,
        handleDeleteUser,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        pages,
        countPagination,
        generatePagination,
        dataClient
        
    }
}