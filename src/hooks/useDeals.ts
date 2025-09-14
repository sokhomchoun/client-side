import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { any, number, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { Authorizations } from "@/utils/Authorization";
import { TClient, TContact, TDeals, TDealTeam, TPipelines, TPipelineState, TProduct, TUsers } from "@/types";
import { stat } from "fs";
import { Currency } from "@/tokens/currency";
import { useLocation } from "react-router-dom";
import { showSuccess, showError } from "@/services/notification";

const dealSchema = z.object({
    title: z.string().min(1, "Title is required"),
    value: z.coerce.number().min(0, "Value must be a positive number"),
    contact: z.string().min(1, "Contact is required"),
    expectedCloseDate: z.date({ required_error: "Expected close date is required" }),
    stageId: z.string().min(1, "Stage is required"),
    pipelineId: z.string().min(1, "Pipeline is required"),
    contactId: z.string().min(1, "Contact is required"),
    productId: z.string().min(1, "Product is required"),
});
   
type PipelineStage = {
    id: string;
    name: string;
    color: string;
    customColor?: string;
    probability?: number;
};

interface FileAttachment {
    id: string;
    name: string;
    size: number;
    unit: 'GB' | 'MB' | 'KB' | 'Bytes'; // <- add this
    type: string;
    lastModified: number;
    content?: string;
    createdAt: string;
}

const defaultStages: PipelineStage[] = [{
    id: "lead",
    name: "Lead",
    color: "bg-stage-blue-light text-stage-blue-text",
    probability: 20
}, {
    id: "meeting",
    name: "Meeting Scheduled",
    color: "bg-stage-purple-light text-stage-purple-text",
    probability: 40
}, {
    id: "proposal",
    name: "Proposal Made",
    color: "bg-stage-orange-light text-stage-orange-text",
    probability: 60
}, {
    id: "negotiation",
    name: "Negotiation",
    color: "bg-stage-yellow-light text-stage-yellow-text",
    probability: 80
}, {
    id: "won",
    name: "Won",
    color: "bg-stage-green-light text-stage-green-text",
    probability: 100
}];

export function useDeals () {

    const token = ProvideToken();
    const auth_id = AuthId();
    const location = useLocation();
    const pipelineId = location.state?.pipeline_id;
    
    const { role, domain, client_id } = User();
    const { currency, rate } = Currency();
    
    const [draggedDeal, setDraggedDeal] = useState<TDeals | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDeal, setSearchDeal] = useState("");
    const [selectedPipeline, setSelectedPipeline] = useState("all");
    const [selectedStageById, setSelectedStageById] = useState("all");
    const [addDealOpen, setAddDealOpen] = useState(false);
    const [editDealOpen, setEditDealOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [selectedDealForEdit, setSelectedDealForEdit] = useState<TDeals | null>(null);
    const [dealDetailOpen, setDealDetailOpen] = useState(false);
    
    const [showStats, setShowStats] = useState(true);

    // New state for stage management
    const [customizePipelineOpen, setCustomizePipelineOpen] = useState(false);
    const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);

    const [newStage, setNewStage] = useState<PipelineStage>({
        id: null,
        name: "",
        color: "bg-stage-blue-light text-stage-blue-text",
        probability: 0,
    });
    const [customColorHex, setCustomColorHex] = useState("#D3E4FD");
    const [showCustomColorInput, setShowCustomColorInput] = useState(false);
    const [deleteStageDialogOpen, setDeleteStageDialogOpen] = useState(false);
    const [stageToDelete, setStageToDelete] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [dataClient, setDataClient] = useState<TClient[]>([]);
    
    const [dataPipelineStage, setDataPipelineStage] =  useState<TPipelineState[]>([]);
    const [editingStageId, setEditingStageId] = useState<number | null>(null);
    const [dataPipeline, setDataPipeline] = useState<TPipelines[]>([]);
    const [dataProduct, setDataProduct] = useState<TProduct[]>([]);
    const [dataContact, setDataContact] = useState<TContact[]>([]);
    const [dataDeal, setDataDeal] = useState<TDeals[]>([]);
    const [totalDeals, setTotalDeals] = useState<number>(0);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [countPagination, setCountPagination] = useState<number>(0);
    const [isDialogContactOpen, setIsDialogContactOpen] = useState(false);
    const [DealPerPage, setDealPerPage] = useState(10);
    const [DealUsers, setDealUsers] = useState<TUsers[]>([]);
    const [userAssigns, setUserAssigns] = useState<TUsers[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");
    const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [dataDealAssign, setDataDealAssign] = useState<TDealTeam[]>([]);
    const [dealTeamId, setDealTeamId] = useState<number>(null);

    // New state for view toggle
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    // New state for drag and drop
    const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);

    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editingFileName, setEditingFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [confirmDealId, setConfirmDealId] = useState<number>(null);
    const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
    // const [selectedSort, setSelectedSort] = useState<"asc" | "desc" | "none">("none");
    const [selectedSort, setSelectedSort] = useState<"asc" | "desc" | "none" | "stage">("none");
    const [allDeals, setAllDeals] = useState<TDeals[]>([]); 

    const dealForm = useForm({
        defaultValues: {
            title: "",
            value: 0,
            pipelineId: "",
            productId: "",
            contactId: "",
            expectedCloseDate: new Date(),
            stageId: "",
        }
    });

    const handleColorChange = (color: string) => {
        if (color === "custom") {
            setShowCustomColorInput(true);
            return;
        }
        setShowCustomColorInput(false);
        setNewStage(prev => ({
            ...prev,
            color,
            customColor: undefined
        }));
    };

    const handleProbabilityChange = (value: string) => {
        const num = Number(value);
        if (!isNaN(num) && num >= 0 && num <= 100) {
            setNewStage(prev => ({ ...prev, probability: num }));
        }
    };

    const handleAddStage = async () => {
        if (!newStage.name || !newStage.color || newStage.probability === null) {
            toast.error('Please fill in all stage fields.');
            return;
        }
        try {
            const response = await axios.post('pipeline/stage', {
                ...newStage,
                color: newStage.color,
                user_id: auth_id,
                role: role,
                client_id: client_id,
                domain: domain,
                pipeline_id: pipelineId
            }, { headers: Authorizations(token) } );
            if (response.status === 200) {
                handleGetPipelineState();
                toast.success(response.data.data.message);
                setNewStage({id: null, name: '', color: '', probability: 0 });
                setCustomColorHex('');
                setShowCustomColorInput(false);
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleGetPipelineState = async () => {
        try {
            // setLoading(true);
            const payload = { domain: domain, pipeline_id: pipelineId };
            const response = await axios.get(`pipeline/stage/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataPipelineStage(response.data.data)
                // setLoading(false);
            };
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            // setLoading(false);
        }
    };

    const handleEditStage = (stage: TPipelineState) => {
        setEditingStageId(stage.id);
        setNewStage({
            id: stage.id.toString(),
            name: stage.name || "",
            probability: stage.probability ?? 0,
            color: stage.color || "bg-stage-blue-light text-stage-blue-text",
        });
    };

    const handleUpdateStage = async () => {
        try {
            const pyaload = {
                name: newStage.name,
                color: newStage.color,
                probability: newStage.probability
            }
            const response = await axios.put(`pipeline/stage/${newStage.id}`, pyaload, {
                headers: Authorizations(token)
            });

            if (response.status === 200) {
                toast.success(response.data.data.message);
                handleGetPipelineState();
                setNewStage({id: null, name: '', color: '', probability: 0 });
                setCustomColorHex('');
                setShowCustomColorInput(false);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleDeleteStage = async (stageId: string) => {
        try {
            const response = await axios.delete(`pipeline/stage/${stageId}`, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
                handleGetPipelineState();
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleGetProduct = async (search?: string) => {
        try {
            const payload = { 
                domain: domain,
                search: search || searchTerm || ''
            };
            const response = await axios.get(`pipeline/product/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataProduct(response.data.data.product);
            };
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleSearchProduct = async (value: string) => {
        try {
            await handleGetProduct(value);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const handleGetContact = async (search?: string) => {
        try {
            const payload = { 
                domain: domain,
                search: search || searchTerm || ''
            };
            const response = await axios.get(`pipeline/contact/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataContact(response.data.data.contact);
            };
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleSearchContact = async (value: string) => {
        try {
            await handleGetContact(value);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const onSubmit = async (values: z.infer<typeof dealSchema>) => {
        try {

            let value_usd = 0;
            let value_khr = 0;

            if (currency === "USD") {
                value_usd = values.value;
                value_khr = values.value * rate;
            } else {
                value_khr = values.value;
                value_usd = values.value / rate;
            }

            const payload = {
                domain: domain,
                client_id: client_id,
                user_id: auth_id,
                title: values.title,
                value_usd: Number(value_usd),
                value_khr: Number(value_khr),
                pipelineId: Number(pipelineId),
                productId: Number(values.productId),
                contactId: Number(values.contactId),
                expectedCloseDate: values.expectedCloseDate,
                stageId: Number(values.stageId),
                status: currency
            };

            const response = await axios.post("deal", payload, {
                headers: Authorizations(token),
            });

            if (response.status === 201) {
                toast.success(response.data.data.message);
                setAddDealOpen(false); 
                dealForm.reset();
                handleGetDeal();
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleGetDeal = async (search?: string, stageId?: string) => {
        try {
            setLoading(true);
            const payload = { 
                domain: domain,
                pipeline_id: pipelineId,
                stage_id: stageId || selectedStageById || "all",
                search: search || searchTerm || '',
            };
            const response = await axios.get(`deal/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setAllDeals(response.data.data.deals);
                setDataDeal(response.data.data.deals);
                setTotalDeals(response.data.data.totalDeals);
                setLoading(false);                
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const sortDeals = (sort: "asc" | "desc" | "none" | "stage", currency: "USD" | "KHR") => {
        let sortedDeals = [...allDeals];

        if (sort === "asc" || sort === "desc") {
            sortedDeals.sort((a, b) => {
                const aValue = currency === "USD" ? a.value_usd : a.value_khr;
                const bValue = currency === "USD" ? b.value_usd : b.value_khr;
                return sort === "asc" ? aValue - bValue : bValue - aValue;
            });
        }

        if (sort === "stage") {
            const stageOrder = pipelineStages.map(stage => stage.id);
            sortedDeals.sort((a, b) => {
                return stageOrder.indexOf(a.pipeline_stage.id.toString()) - stageOrder.indexOf(b.pipeline_stage.id.toString());
            });
        }

        setDataDeal(sortedDeals);
    };

    // Handle drag start
    const handleDragStart = (deal: TDeals, e: React.DragEvent<HTMLDivElement>) => {
        setDraggedDeal(deal);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', deal.id.toString());
    };

    // Handle drop
    const handleDrop = async (targetStageId: string, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedDeal) {
            if (draggedDeal.stage_id.toString() === targetStageId) {
                setDraggedDeal(null);
                return;
            }
        }
        try {
            const deal_id = draggedDeal.id;
            const payload = {
                stage_id: targetStageId,
                user_id: auth_id
            }
            const response = await axios.put(`deal/${deal_id}`, {}, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
                setDraggedDeal(null);
                handleGetDeal();
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleSearchDeal = async (value: string) => {
        try {
            await handleGetDeal(value);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const updateDeal = async (dealId: number, updatedFields: Record<string, any>) => {
        try {
            const payload = {
                domain,
                dealId,
                ...updatedFields,
            };

            const response = await axios.put(`deal/edit/${auth_id}`, payload, {
                headers: Authorizations(token),
            });

            if (response.status === 200) {
                handleGetDeal();
                toast.success(response.data.data.message || "Deal updated successfully.");
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    // Update title
    const handleUpdatedDealTitle = (dealId: number, title: string) => updateDeal(dealId, { title });

    // Update value
    const handleUpdatedDealValue = (dealId: number, value: number, currency: "USD" | "KHR") => {
        let value_usd = 0;
        let value_khr = 0;

        if (currency === "USD") {
            value_usd = value;
            value_khr = value * rate;
        } else {
            value_khr = value;
            value_usd = value / rate;
        }

        return updateDeal(dealId, { value_usd, value_khr });
    };

    const handleUpdatedDealStage = (dealId: number, stageId: number) => updateDeal(dealId, { stageId });

    const handleUpdatedDealProduct = (dealId: number, productId: number) =>  updateDeal(dealId, { productId });

    const handleUpdatedDealPipeline = (dealId: number, pipelineId: number) => updateDeal(dealId, { pipelineId });

    const handleUpdatedDealExpectedCloseDate = (dealId: number, expectedCloseDate: Date) => updateDeal(dealId, { expectedCloseDate });

    const handleUpdatedDealProbability = (dealId: number, probability: number, stageId: number) => updateDeal(dealId, { probability, stageId });

    const handleSaveNote = (dealId: number, notes?: string) => updateDeal(dealId, { notes });

    const handleGetDealUsers = async (page = 1, search?: string) => {
        try { 
            const payload = {
                page: page,
                limit: DealPerPage,
                search: search || searchUser || '',
            }
            const response = await axios.get(`deal/user/${domain}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDealUsers(response.data.data.users)
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleSearchAssignUsers = async (value: string) => {
        try {
            await handleGetDealUsers(currentPage, value);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const handleAssignUsers = async (dealId: number) => {
        try {
            if (!selectedUserId) {
                toast.error('Please select a user to add')
                return;
            }
            const userToAdd = DealUsers.find(user => user.id === selectedUserId);
            if (!userToAdd) return;
            const updatedUsers = [...userAssigns, {...userToAdd, role: userRole || userToAdd.role}];

            const payload = {
                user_id: userToAdd.id,
                name: userToAdd.name,
                email: userToAdd.email,
                role: userToAdd.role,
                dealId: dealId,
                domain: domain,
                client_id: client_id,
                assign_by_id: auth_id
            };
            const response = await axios.post('deal/user', payload, {
                headers: Authorizations(token)
            });

            if (response.status === 200) {
                handleGetDeal();
                setUserAssigns(updatedUsers);
                setSelectedUserId("");
                setUserRole("");
                setAddUserDialogOpen(false);
                setSearchTerm("");
                setDealDetailOpen(false);
                toast.success(response.data.data.message);
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleDisplayUser = (team: TDealTeam) => {
        setSearchUser(team.name)
        setDealTeamId(team.id)
    };

    const handleChangeUserAssgin = async (user: TUsers) => {
        try {
            const payload = {
                assign_by_id: auth_id,
                role: user.role,
                user_id: user.id,
                email: user.email,
                name: user.name,
            };
            const response = await axios.put(`deal/user/${dealTeamId}`, payload, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetDeal();
                toast.success(response.data.data.message);
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleRemoveUser = async (dealTeamId: number) => {
        try {
            const response = await axios.delete(`deal/user/${dealTeamId}`, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetDeal();
                setDealDetailOpen(false);
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleChangeAssignDate = async (newDate?: string, team?: TDealTeam) => {
        try {
            const payload = {
                createdAt: newDate,
            }
            const response = await axios.put(`deal/user/updated-date/${team.id}`, payload, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetDeal();
                toast.success(response.data.data.message);
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const form = new FormData();
            const newAttachments: FileAttachment[] = [];
            // condition set size upload file 5MB
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 5 * 1024 * 1024) {
                    showError({
                        title: "File too large",
                        description: `${file.name} exceeds the 5MB limit.`
                    });
                    continue;
                }
                form.append('domain', domain);
                form.append('client_id', client_id);
                form.append('attachments', file);
            }
            if (selectedDealForEdit) {
                const response = await axios.post(`deal/attachment/${selectedDealForEdit.id}`, form, {
                    headers: Authorizations(token)
                });
                if (response.status === 200) {
                    handleGetDeal();
                    showSuccess({
                        title: "Files Uploaded",
                        description: response.data.data.message
                    });
                }
            }

        } catch (error) {
            console.error("Error uploading files", error);
            showError({
                title: "Upload Failed",
                description: "There was a problem uploading your files."
            });

        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteFile = async (fileId?: string) => {
        setFileToDelete(fileId);
    };

    const confirmDeleteFile = async () => {
        if (fileToDelete) {
            const response = await axios.delete(`deal/attachment/${fileToDelete}`, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetDeal();
                showSuccess({
                    title: "File Deleted",
                    description: response.data.data.message
                });
                setFileToDelete(null);
            }
        }
    };

    const handleCopyDeal = async (deals: TDeals) => {
        try {
            const paylaod = {
                domain: deals.domain,
                client_id: deals.client_id,
                pipelineId: deals.pipeline_id,
                user_id: deals.user_id,
                contactId: deals.contact_id,
                productId: deals.product_id,
                stageId: deals.stage_id,
                title: deals.title,
                value_usd: deals.value_usd,
                value_khr: deals.value_khr,
                expectedCloseDate: deals.expected_close_date,
                notes: deals.notes,
                status: deals.status,
                deal_attachments: deals.deal_attachments || [],
                deal_teams: deals.deal_teams || []
            }
            const response = await axios.post('deal/copy', paylaod, {
                headers: Authorizations(token) 
            });
            if (response.status === 200) {
                handleGetDeal();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleSaveDeal = async (deals: TDeals) => {
        try {

            let value_usd = deals.value_usd || 0;
            let value_khr = deals.value_khr || 0;

            if (currency === "USD") {
                value_usd = deals.value_usd || 0;
                value_khr = value_usd * rate;
            } else if (currency === "KHR") {
                value_khr = deals.value_khr || 0;
                value_usd = value_khr / rate;
            }

            const paylaod = {
                pipelineId: deals.pipeline_id,
                user_id: deals.user_id,
                contactId: deals.contact_id,
                productId: deals.product_id,
                dealId: deals.stage_id,
                title: deals.title,
                value_usd,
                value_khr,
                expectedCloseDate: deals.expected_close_date,
                notes: deals.notes,
                status: deals.status,
            }
            const response = await axios.put(`deal/save/${deals.id}`, paylaod, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetDeal();
                toast.success(response.data.data.message);
            }
            
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleDeleteDeal = async (dealId: number) => {
        setConfirmDealId(dealId);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDeleteDeal = async () => {
        try {
            const response = await axios.delete(`deal/${confirmDealId}`, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetDeal();
                setDealDetailOpen(false);
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleStageDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();

        if (draggedStageIndex === null || draggedStageIndex === targetIndex) {
            setDraggedStageIndex(null);
            return;
        }

        const newStages = [...dataPipelineStage];

        const draggedStage = newStages[draggedStageIndex];
        const targetStage = newStages[targetIndex];

        // Prevent dropping on a permanent stage
        if (targetStage.is_permanent) {
            toast.warning("Cannot move permanent stages.");
            setDraggedStageIndex(null);
            return;
        }

        newStages.splice(draggedStageIndex, 1);
        newStages.splice(targetIndex, 0, draggedStage);

        setDataPipelineStage(newStages);
        setDraggedStageIndex(null);

        const updatedStages = newStages.map((stage, index) => ({
            id: stage.id,
            orderStage: index
        }));

        axios.post("pipeline/order", updatedStages, {
            headers: Authorizations(token)
        })
        .then(res => {
            if (res.status === 200) {
                toast.success(res.data.data.message);
                handleGetPipelineState();
            }
        })
        .catch(err => {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            handleStagesChange([...dataPipelineStage]);
        });
    };

    const handleStagesChange = (newStages: TPipelineState[]) => {
        setDataPipelineStage(newStages);
    };

    const handleStageDragEnd = () => {
        setDraggedStageIndex(null);
    };

    const handleStageDragStart = (e: React.DragEvent, index: number, isPermanent?: boolean) => {
        if (isPermanent) {
            e.preventDefault();
            toast.warning("Cannot move permanent stages.");
            return;
        }
        setDraggedStageIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };
    
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


    useEffect(() => {
        handleGetProduct();
        handleGetClientPermission();
        handleGetPipelineState();
        handleGetContact();
        handleGetDeal();
        if (auth_id && token) {
            handleGetDealUsers(currentPage);
        };
        
    }, []);

    return {
        handleAddStage,
        handleColorChange,
        newStage,
        setNewStage,
        handleProbabilityChange,
        dataPipelineStage,
        loading,
        handleEditStage,
        editingStageId,
        handleUpdateStage,
        setStageToDelete,
        stageToDelete,
        handleDeleteStage,
        dataPipeline,
        dataProduct,
        handleSearchProduct,
        dataContact,
        handleSearchContact,
        dealForm,
        onSubmit,
        setAddDealOpen,
        addDealOpen,
        currency,
        dataDeal,
        totalDeals,
        handleDrop,
        handleDragStart,
        domain,
        role,
        handleSearchDeal,
        searchTerm,
        setSearchTerm,
        searchDeal,
        setSearchDeal,
        selectedPipeline,
        setSelectedPipeline,
        selectedStageById,
        setSelectedStageById,
        handleGetDeal,
        handleUpdatedDealTitle,
        handleUpdatedDealValue,
        handleUpdatedDealStage,
        handleUpdatedDealProduct,
        handleUpdatedDealPipeline,
        handleUpdatedDealExpectedCloseDate,
        handleUpdatedDealProbability,
        handleSaveNote,
        handleAssignUsers,
        DealUsers,
        setUserAssigns,
        userAssigns,
        setAddUserDialogOpen,
        addUserDialogOpen,
        selectedUserId,
        setSelectedUserId,
        setSearchUser,
        searchUser,
        handleSearchAssignUsers,
        handleChangeUserAssgin,
        handleDisplayUser,
        handleRemoveUser,
        handleChangeAssignDate,
        handleFileUpload,
        fileInputRef,
        isUploading,
        setAttachments,
        attachments,
        selectedDealForEdit,
        setSelectedDealForEdit,
        handleDeleteFile,
        fileToDelete,
        setFileToDelete,
        confirmDeleteFile,
        handleCopyDeal,
        handleSaveDeal,
        dealDetailOpen,
        setDealDetailOpen,
        handleDeleteDeal,
        deleteConfirmOpen,
        setDeleteConfirmOpen,
        handleConfirmDeleteDeal,
        pipelineStages,
        setPipelineStages,
        handleStagesChange,
        handleStageDrop,
        handleStageDragEnd,
        handleStageDragStart,
        selectedSort,
        setSelectedSort,
        sortDeals,
        dataClient

    }
}