import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { Currency } from '../tokens/currency';
import { toast } from "@/components/ui/sonner";
import { TClient, TPipelines, TSharePipelines } from "@/types";
import { Authorizations } from "@/utils/Authorization";
import { Pipeline, SalesTarget } from "@/types/pipeline";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import socketService from "@/services/websocket/Socket.Service";
import { SharePipelines } from "@/services/websocket/PipelineConnections";

export type PipelineSharingLevel = "private" | "team" | "organization" | "public";
export type PipelineUserPermission = "viewer" | "editor" | "admin";
export type PipelineUserAccess = {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    permission: PipelineUserPermission;
};
export interface PipelineSharing {
    level: PipelineSharingLevel;
    users: PipelineUserAccess[];
    allowCopy: boolean;
    allowExport: boolean;
}

const inviteUserSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    permission: z.enum(["viewer", "editor", "admin"])
});

export function usePipelines () {

    const defaultSharing: PipelineSharing = {
        level: "private",
        users: [],
        allowCopy: false,
        allowExport: false
    };

    const inviteForm = useForm<z.infer<typeof inviteUserSchema>>({
        resolver: zodResolver(inviteUserSchema),
        defaultValues: {
            email: "",
            permission: "viewer"
        }
    });

    const initialSharing: PipelineSharing = defaultSharing;

    const token = ProvideToken();
    const navigate = useNavigate();
    const auth_id = AuthId();
    const { role, domain, client_id, email } = User();
    const { currency, rate } = Currency();

    const [addPipelineOpen, setAddPipelineOpen] = useState(false);
    const [dataPipelines, setDataPipelines] = useState<TPipelines[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [editPipelineOpen, setEditPipelineOpen] = useState(false);
    const [dataClient, setDataClient] = useState<TClient[]>([]);
    const [totalDeals, setTotalDeals] = useState<number>(0);
    const [selectedPipelineForSharing, setSelectedPipelineForSharing] = useState<string | null>(null);
    const [isShareSettingsOpen, setIsShareSettingsOpen] = useState(false);
    const [sharing, setSharing] = useState<PipelineSharing>(initialSharing || defaultSharing);
    const [dataUserInvite, setDataUserInvite] = useState<TSharePipelines[]>([]);
    const [commitEmail, setCommitEmail] = useState<string[]>([]);
    const [commitDomain, setCommitDomain] = useState<string>('');
    const [pipelineId, setPipelineId] = useState<number>(null);
    const [deletePipelineOpen, setDeletePipelineOpen] = useState(false);
    type PipelineForm = Omit<Pipeline, "id"> & { id?: number };

    const [newPipeline, setNewPipeline] = useState<PipelineForm>({
        name: "",
        description: "",
        lastUpdated: new Date().toISOString(),
        dealCount: 0,
        stages: [],
        salesTarget: {
            monthly: 0,
            quarterly: 0,
            yearly: 0,
            periodType: "monthly"
        }
    });

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

    // Function to handle adding a new pipeline
    const handleAddPipeline = async () => {
        try {
            if (!newPipeline.name.trim()) {
                toast.error("Please enter a pipeline name");
                return;
            };
            const payload = {
                domain: domain,
                client_id: client_id,
                user_id: auth_id,
                role: role,
                name: newPipeline.name,
                description: newPipeline.description
            };

            const response = await axios.post('pipeline', payload, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
                setAddPipelineOpen(false);
                handleGetClientPermission();
                handleGetPipeline();
                
                setNewPipeline({
                    name: "",
                    description: "",
                    lastUpdated: new Date().toISOString(),
                    dealCount: 0,
                    stages: [],
                    salesTarget: {
                        monthly: 0,
                        quarterly: 0,
                        yearly: 0,
                        periodType: "monthly"
                    }
                });
            };

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleGetPipeline = async () => {
        try {
            setLoading(true);
            const payload = { domain: domain };
            const response = await axios.get(`pipeline/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataPipelines(response.data.data.pipelines)
                setTotalDeals(response.data.data.TotalDeals);
                setLoading(false);
            };
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const handleEditPipeline = (pipeline) => {
        const target = pipeline.sale_target?.[0];
        const isUSD = currency === 'USD';

        setNewPipeline({
            id: pipeline.id,
            name: pipeline.name || "",
            description: pipeline.description || "",
            lastUpdated: new Date().toISOString(),
            dealCount: pipeline.dealCount || 0,
            stages: pipeline.stages || [],
            salesTarget: {
                monthly: isUSD ? target?.monthly_target_usd || 0 : target?.monthly_target_khr || 0,
                quarterly: isUSD ? target?.quarterly_target_usd || 0 : target?.quarterly_target_khr || 0,
                yearly: isUSD ? target?.yearly_target_usd || 0 : target?.yearly_target_khr || 0,
                periodType: target?.period_type || "monthly",
            },
        });

        setEditPipelineOpen(true);
    };

    const handleUpdatePipeline = async () => {
        try {
            const { monthly = 0, quarterly = 0, yearly = 0, periodType = "monthly" } = newPipeline.salesTarget || {};

            const isUSD = currency === "USD";
            const salesTargetPayload = {
                domain: domain,
                client_id: client_id,
                role: role,
                user_id: auth_id,
                period_type: periodType,
                monthly_target_usd: isUSD ? monthly : monthly / rate,
                quarterly_target_usd: isUSD ? quarterly : quarterly / rate,
                yearly_target_usd: isUSD ? yearly : yearly / rate,
                monthly_target_khr: isUSD ? Math.round(monthly * rate) : Math.round(monthly),
                quarterly_target_khr: isUSD ? Math.round(quarterly * rate) : Math.round(quarterly),
                yearly_target_khr: isUSD ? Math.round(yearly * rate) : Math.round(yearly),
                status: currency,
            };

            const payload = {
                id: newPipeline.id,
                domain,
                client_id,
                name: newPipeline.name,
                description: newPipeline.description,
                salesTarget: salesTargetPayload,
                stages: newPipeline.stages || [],
            };

            const response = await axios.put(`pipeline/${newPipeline.id}`, payload, {
                headers: Authorizations(token),
            });
            
            if (response.status === 200) {
                toast.success(response.data.data.message);
                setEditPipelineOpen(false);
                handleGetPipeline();
            };

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleViewPipeline = (id: number) => {
        navigate(`deals`, { state: { pipeline_id: id } } );
        
    };

    const handleShare = (pipelineId: number) => {
        setSelectedPipelineForSharing(pipelineId.toString());
        setIsShareSettingsOpen(true);
    };

    const handleSharingLevelChange = useCallback((level: PipelineSharingLevel) => {
        setSharing(prev => ({
            ...prev,
            level,
        }));
    }, []);

    const onInviteUser = async (data: z.infer<typeof inviteUserSchema>) => {
        try {
            const payload = {
                pipeline_id: selectedPipelineForSharing,
                domain: domain,
                client_id: client_id,
                user_id: auth_id,
                email: data.email,
                permission: data.permission
            }
            const response = await axios.post('pipeline/invite-user', payload, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetUserInvite();
                toast.success(response.data.data.message);
                inviteForm.reset();
            }
            setCommitEmail(email);
            setCommitDomain(domain);
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
        
    };

    const handleGetUserInvite = async () => {
        try {
            const payload = { domain: domain, pipeline_id: selectedPipelineForSharing };
            const response = await axios.get(`pipeline/get-invite-user/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataUserInvite(response.data.data);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleRemoveUser = async (id: number) => {
        try {
            const response = await axios.delete(`pipeline/delete-invite-user/${id}`, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetUserInvite();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handlePermissionChange = async (id: string, permission: PipelineUserPermission) => {
        try {
            const payload = { permission: permission };
            const response = await axios.put(`pipeline/update-invite-user/${id}`, payload, {
                headers: Authorizations(token)
            })
            if (response.status === 200) {
                handleGetUserInvite();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const payload = { 
                status_share: sharing.level,
                user_id: auth_id,
                client_id: client_id,
                domain: domain
            };
            const response = await axios.put(`pipeline/share/${selectedPipelineForSharing}`, payload , {
                headers: Authorizations(token)
            });

            if (response.status === 200) {
                toast.success(response.data.data.message);
                handleGetPipeline();
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleDeletePipeline = (id: number) => {
        setPipelineId(id);
        setDeletePipelineOpen(true);
    };

    const handleConfirmDeletePipeline = async () => {   
        try {
            const payload = {
                domain: domain
            }
            const response = await axios.delete(`pipeline/${pipelineId}`, {
                params: payload,
                headers: Authorizations(token)
            })
            if (response.status === 200) {
                handleGetPipeline();
                handleGetClientPermission();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleGetPipelineShared = (data: TPipelines) => {
        if (!data || !data.pipeline_shared) return;
        setDataPipelines((prev) => [data.pipeline_shared, ...prev]);
    }
    
    // Pipeline connection from socket
    SharePipelines({ email, handleGetPipelineShared });

    // status share
    const selectedPipeline = dataPipelines.find(p => p.id.toString() === selectedPipelineForSharing);

    const statusShare = selectedPipeline?.share_pipelines?.[0]?.status_share || null;
    function isValidSharingLevel(level: string): level is PipelineSharingLevel {
        return ["private", "team", "public"].includes(level);
    }
    
    useEffect(() => {
        handleGetClientPermission();
        handleGetPipeline();
        if (selectedPipelineForSharing !== null) {
            handleGetUserInvite();
        }
        // register email 
        if (commitEmail) { 
            socketService.register(commitEmail);
        }
        // register domain
        if (commitDomain) {
            socketService.register(commitDomain);
        }
        
    },[selectedPipelineForSharing, commitEmail, commitDomain]);

    useEffect(() => {
        if (statusShare && isValidSharingLevel(statusShare)) {
            handleSharingLevelChange(statusShare);
        }

    }, [statusShare, handleSharingLevelChange, dataClient]);


    return {
        handleAddPipeline,
        newPipeline,
        setNewPipeline,
        addPipelineOpen,
        setAddPipelineOpen,
        dataPipelines,
        handleEditPipeline,
        editPipelineOpen,
        setEditPipelineOpen,
        dataClient,
        handleUpdatePipeline,
        currency,
        loading,
        setTotalDeals,
        domain,
        handleViewPipeline,
        totalDeals,
        handleShare,
        selectedPipelineForSharing,
        setSelectedPipelineForSharing,
        isShareSettingsOpen,
        setIsShareSettingsOpen,
        handleSaveSettings,
        handleSharingLevelChange,
        setSharing,
        sharing,
        onInviteUser,
        inviteForm,
        dataUserInvite,
        handleRemoveUser,
        handlePermissionChange,
        email,
        auth_id,
        handleDeletePipeline,
        setDeletePipelineOpen,
        deletePipelineOpen,
        handleConfirmDeletePipeline,
        role
    }
}