import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlusCircle, Download,Upload, Search, TrendingUp, DollarSign, Target, Activity, Calendar as CalendarIcon, ToggleLeft, ToggleRight, Settings, Pencil, Trash2, Palette, List, Kanban, GripVertical, Ban, Save, Copy, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DealNotesWidget } from "@/components/DealNotesWidget";
import { DealHistoryWidget } from "@/components/DealHistoryWidget";
import { DealAttachmentsWidget } from "@/components/DealAttachmentsWidget";
import { Checkbox } from "@/components/ui/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import PipelineView from "@/components/PipelineView";
import { DealProbabilityWidget } from "@/components/DealProbabilityWidget";
import { DealUsersWidget } from "@/components/DealUsersWidget";
import { Badge } from "@/components/ui/badge";
import { useDeals } from "@/hooks/useDeals";
import { LoadingComponent } from "@/components/LoadingComponent";
import { TDeals } from "@/types";
import { Link } from 'react-router-dom';
import { DealSkeleton } from "@/components/skeleton/DealSkeleton";
import { useHasPermission } from "@/hooks/useHasPermission";

type PipelineStage = {
    id: string;
    name: string;
    color: string;
    customColor?: string;
    probability?: number;
};
type Deal = {
    id: string;
    title: string;
    value: number;
    company: string;
    contact: string;
    stage?: string;
    stageId: string;
    probability?: number;
    expectedCloseDate?: string;
    pipelineId: string;
    product?: string;
    note?: string;
};
type Pipeline = {
    id: string;
    name: string;
    description?: string;
};
const availableColors = [{
  id: "blue",
  name: "Blue",
  value: "bg-stage-blue-light text-stage-blue-text"
}, {
  id: "green",
  name: "Green",
  value: "bg-stage-green-light text-stage-green-text"
}, {
  id: "red",
  name: "Red",
  value: "bg-stage-red-light text-stage-red-text"
}, {
  id: "yellow",
  name: "Yellow",
  value: "bg-stage-yellow-light text-stage-yellow-text"
}, {
  id: "purple",
  name: "Purple",
  value: "bg-stage-purple-light text-stage-purple-text"
}, {
  id: "orange",
  name: "Orange",
  value: "bg-stage-orange-light text-stage-orange-text"
}, {
  id: "teal",
  name: "Teal",
  value: "bg-stage-teal-light text-stage-teal-text"
}, {
  id: "indigo",
  name: "Indigo",
  value: "bg-stage-indigo-light text-stage-indigo-text"
}, {
  id: "pink",
  name: "Pink",
  value: "bg-stage-pink-light text-stage-pink-text"
}, {
  id: "custom",
  name: "Custom Color",
  value: "custom"
}];

// Helper function to check if a string is a valid hex color
const isValidHexColor = (hex: string) => {
    return /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex);
};


// Pipeline stages - shared with PipelineView
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

const Deals = () => {

    const { 
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
        // dataDealAssign
        
    } = useDeals();
    
    const { hasPermission } = useHasPermission();

    const [searchParams] = useSearchParams();
    const [deals, setDeals] = useState<Deal[]>([{
        id: "1",
        title: "Software License",
        value: 5000,
        company: "Tech Corp",
        contact: "John Doe",
        stage: "Lead",
        stageId: "lead",
        probability: 20,
        pipelineId: "sales",
        expectedCloseDate: "2024-02-15",
        product: "Enterprise Software",
        note: ""
    }, {
        id: "2",
        title: "Consulting Project",
        value: 10000,
        company: "Acme Inc",
        contact: "Jane Smith",
        stage: "Meeting Scheduled",
        stageId: "meeting",
        probability: 40,
        pipelineId: "sales",
        expectedCloseDate: "2024-02-20",
        product: "Consulting Services",
        note: ""
    }, {
        id: "3",
        title: "SaaS Subscription",
        value: 3500,
        company: "Zenith",
        contact: "Bob Johnson",
        stage: "Proposal Made",
        stageId: "proposal",
        probability: 60,
        pipelineId: "sales",
        expectedCloseDate: "2024-02-25",
        product: "SaaS Platform",
        note: ""
    }, {
        id: "4",
        title: "Hardware Purchase",
        value: 15000,
        company: "Mega Corp",
        contact: "Alice Brown",
        stage: "Negotiation",
        stageId: "negotiation",
        probability: 80,
        pipelineId: "partnerships",
        expectedCloseDate: "2024-03-01",
        product: "Hardware Solutions",
        note: ""
    }, {
        id: "5",
        title: "Support Contract",
        value: 7500,
        company: "Local Business",
        contact: "Charlie Wilson",
        stage: "Won",
        stageId: "won",
        probability: 100,
        pipelineId: "sales",
        expectedCloseDate: "2024-01-30",
        product: "Support Services",
        note: ""
    }]);
    const [pipelines] = useState<Pipeline[]>([{
        id: "sales",
        name: "Sales Pipeline",
        description: "Main sales pipeline"
    }, {
        id: "partnerships",
        name: "Partnerships",
        description: "Partner deals"
    }]);
    const [searchProduct, setSearchProduct] = useState("");
    const [searchContact, setSearchContact] = useState("");
    const [selectedStage, setSelectedStage] = useState("all");
    const [editDealOpen, setEditDealOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const [showStats, setShowStats] = useState(true);
    // const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(defaultStages);

    // New state for stage management
    const [customizePipelineOpen, setCustomizePipelineOpen] = useState(false);
    const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);

    const [customColorHex, setCustomColorHex] = useState("#D3E4FD");
    const [showCustomColorInput, setShowCustomColorInput] = useState(false);
    const [deleteStageDialogOpen, setDeleteStageDialogOpen] = useState(false);

    // New state for view toggle
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    // New state for drag and drop
    const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);

    // Function to filter deals based on search term, pipeline, and stage
    const filteredDeals = deals.filter(deal => {
        const searchTermMatch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) || deal.company.toLowerCase().includes(searchTerm.toLowerCase()) || deal.contact.toLowerCase().includes(searchTerm.toLowerCase());
        const pipelineMatch = selectedPipeline === "all" || deal.pipelineId === selectedPipeline;
        const stageMatch = selectedStage === "all" || deal.stageId === selectedStage;
        return searchTermMatch && pipelineMatch && stageMatch;
    });

    const handleCustomColorChange = (hex: string) => {
        setCustomColorHex(hex);
        if (isValidHexColor(hex)) {
            setNewStage(prev => ({
                ...prev,
                color: "custom",
                customColor: hex
            }));
        }
    };

    const handleStageDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    // Export utilities
    const exportToCSV = (deals: Deal[], pipelineStages: PipelineStage[]) => {
        const headers = ['Title', 'Value', 'Company', 'Contact', 'Stage', 'Probability (%)', 'Expected Close Date', 'Product', 'Pipeline', 'Note'];
        const csvContent = [headers.join(','), ...deals.map(deal => {
        const stage = pipelineStages.find(s => s.id === deal.stageId);
        return [`"${deal.title}"`, deal.value, `"${deal.company}"`, `"${deal.contact}"`, `"${stage?.name || 'Unknown'}"`, deal.probability || 0, deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '', `"${deal.product || ''}"`, `"${deal.pipelineId}"`, `"${deal.note || ''}"`].join(',');
        })].join('\n');
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;'
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `deals_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const exportToPDF = (deals: Deal[], pipelineStages: PipelineStage[]) => {
        // Create a simple HTML content for PDF
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Deals Export</title>
            <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #ef4444; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header-info { margin-bottom: 20px; color: #666; }
            </style>
        </head>
        <body>
            <h1>Deals Export Report</h1>
            <div class="header-info">
            <p>Export Date: ${new Date().toLocaleDateString()}</p>
            <p>Total Deals: ${deals.length}</p>
            <p>Total Value: $${deals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}</p>
            </div>
            <table>
            <thead>
                <tr>
                <th>Title</th>
                <th>Value</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Stage</th>
                <th>Probability</th>
                <th>Expected Close</th>
                <th>Product</th>
                </tr>
            </thead>
            <tbody>
                ${deals.map(deal => {
        const stage = pipelineStages.find(s => s.id === deal.stageId);
        return `
                <tr>
                <td>${deal.title}</td>
                <td>$${deal.value.toLocaleString()}</td>
                <td>${deal.company}</td>
                <td>${deal.contact}</td>
                <td>${stage?.name || 'Unknown'}</td>
                <td>${deal.probability || 0}%</td>
                <td>${deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'N/A'}</td>
                <td>${deal.product || 'N/A'}</td>
                </tr>
                `;
        }).join('')}
            </tbody>
            </table>
        </body>
        </html>
        `;

        // Create a new window and print it as PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        }
    };

    // Add the missing handleExport function
    // const handleExport = () => {
    //     const dealsToExport = filteredDeals.length > 0 ? filteredDeals : deals;
    //     if (exportFormat === 'csv') {
    //         exportToCSV(dealsToExport, pipelineStages);
    //         toast.success(`${dealsToExport.length} deals exported to CSV successfully!`);
    //     } else if (exportFormat === 'pdf') {
    //         exportToPDF(dealsToExport, pipelineStages);
    //         toast.success(`${dealsToExport.length} deals exported to PDF successfully!`);
    //     }
    //     setExportDialogOpen(false);
    // };

    const updateDeal = (field: keyof TDeals, value: any) => {
        if (typeof selectedDealForEdit !== 'object' || selectedDealForEdit === null) return;

        setSelectedDealForEdit({
            ...selectedDealForEdit,
            [field]: value,
        });
    };

    
    // New state for export
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

    useEffect(() => {
        if (dataPipelineStage.length > 0) {
            dealForm.reset({
                ...dealForm.getValues(),
                stageId: dataPipelineStage[0].id.toString(),
            });
        }
    }, [dataPipelineStage]);


    return (    
        <main className="relative">
            <DealSkeleton isActive={loading} />
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight py-0 my-[8px]">Deal Tracking</h1>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                        <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} className="flex items-center gap-2">
                            <Kanban className="h-4 w-4" />
                            Kanban
                        </Button>
                        <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            List
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="flex items-center gap-2">
                        {showStats ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {showStats ? 'Hide Stats' : 'Show Stats'}
                    </Button>
                    {hasPermission("deals.import") && 
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Upload className="h-4 w-4 mr-1" />
                            Import
                        </Button>
                    }
                    {hasPermission("deals.export") && 
                        <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)} className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    }
                    <Button variant="outline" size="sm" onClick={() => setCustomizePipelineOpen(true)} className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Manage Stages
                    </Button>
                    {hasPermission("deals.create") && 
                        <Button onClick={() => {
                            const client = dataClient[0];
                            const limitRaw = client?.deal_tracking;
                            const usageRaw = client?.client_usage?.[0]?.deal_usage;

                            const isUnlimited = typeof limitRaw === 'string' && limitRaw.toLowerCase() === 'unlimited';
                            const limit = isUnlimited ? Infinity : Number(limitRaw || 0);
                            const currentUsage = Number(usageRaw || 0);

                            if (!isUnlimited && currentUsage >= limit) {
                                toast.warning(`You have reached your deal limit of ${limit}. Please upgrade your plan to add more.`);
                                return;
                            }
                            setAddDealOpen(true)
                        }}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Deal
                        </Button>
                    }
                 
                </div>
            </div>

            {/* Stats Cards */}
            {showStats && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card style={{ background: 'linear-gradient(135deg, rgba(229, 59, 47, 0.1) 0%, rgba(252, 138, 39, 0.05) 100%)', borderColor: 'rgba(229, 59, 47, 0.2)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" >{totalDeals}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last month
                        </p>
                    </CardContent>
                </Card>
                <Card style={{ background: 'linear-gradient(135deg, rgba(252, 138, 39, 0.1) 0%, rgba(247, 214, 31, 0.05) 100%)', borderColor: 'rgba(252, 138, 39, 0.2)'}}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#FC8A27' }}>
                            {currency === 'USD'
                                ? `$${dataDeal.reduce((sum, deal) => sum + (deal.value_usd || 0), 0).toLocaleString()}`
                                : `${dataDeal.reduce((sum, deal) => sum + (deal.value_khr || 0), 0).toLocaleString()} ៛`
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card style={{ background: 'linear-gradient(135deg, rgba(95, 166, 90, 0.1) 0%, rgba(0, 82, 0, 0.05) 100%)', borderColor: 'rgba(95, 166, 90, 0.2)'}}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground"  />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#5FA65A' }}>
                            {currency === 'USD' 
                            ? `$${dataDeal.filter(deal => deal.pipeline_stage?.name === 'Won').reduce((sum, deal) => sum + (deal.value_usd || 0), 0).toLocaleString()}`
                            : `${dataDeal.filter(deal => deal.pipeline_stage?.name === 'Won').reduce((sum, deal) => sum + (deal.value_khr || 0), 0).toLocaleString()} ៛`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Based on stage probability
                        </p>
                    </CardContent>
                </Card>
                <Card style={{ background: 'linear-gradient(135deg, rgba(1, 181, 188, 0.1) 0%, rgba(251, 85, 87, 0.05) 100%)', borderColor: 'rgba(1, 181, 188, 0.2)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {(() => {
                        const wonDeals = dataDeal.filter(d => d.pipeline_stage?.name?.toLowerCase() === 'won');

                        const totalValue = currency === "USD"
                            ? dataDeal.reduce((sum, d) => sum + (d.value_usd || 0), 0)
                            : dataDeal.reduce((sum, d) => sum + (d.value_khr || 0), 0);

                        const wonValue = currency === "USD"
                            ? wonDeals.reduce((sum, d) => sum + (d.value_usd || 0), 0)
                            : wonDeals.reduce((sum, d) => sum + (d.value_khr || 0), 0);

                        const winRate = totalValue > 0 ? Math.round((wonValue / totalValue) * 100) : 0;

                        return (
                            <>
                                <div className="text-2xl font-bold" style={{ color: '#01B5BC' }}>{winRate}% </div>
                                <p className="text-xs text-muted-foreground">
                                    Deals successfully closed ({currency})
                                </p>
                            </>
                        );
                        })()}
                    </CardContent>
                </Card>
            </div>}

        {/* Filters */}
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input type="search" placeholder="Search deals..." 
                    value={searchDeal} 
                    onChange={e => setSearchDeal(e.target.value)} 
                    className="w-full" 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearchDeal(searchDeal)
                        }
                    }}
                />
                <Select value={selectedStageById} onValueChange={(value) => { setSelectedStageById(value); handleGetDeal(undefined, value)}}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        {dataPipelineStage.map(stage => <SelectItem key={stage.id} value={stage.id.toString()}>
                            <span>
                                {stage.name}
                            </span>
                        </SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Sort by Value */}
                {viewMode === 'list' && (
                    <Select
                        value={selectedSort}
                        onValueChange={(value: "asc" | "desc" | "none" | "stage") => {
                        setSelectedSort(value);
                        sortDeals(value, currency);
                    }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sort by Value / Stage" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sort By</SelectItem>
                            <SelectItem value="asc">Lowest → Highest</SelectItem>
                            <SelectItem value="desc">Highest → Lowest</SelectItem>
                            <SelectItem value="stage">Sort by Stage</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>

        {/* Kanban View - Now fully responsive */}
        <Card>
            <CardContent className="p-6">
                <div className="w-full">
                {viewMode === 'kanban' ? 
                    <PipelineView 
                        handleDragStart={handleDragStart}
                        handleDrop={handleDrop}
                        currency={currency}
                        dataDeal={dataDeal}
                        dataPipelineStage={dataPipelineStage}
                        selectedStage={selectedStage}
                        DealUsers={DealUsers}
                        selectedPipeline={selectedPipeline}
                        pipelines={pipelines} 
                        pipelineStages={pipelineStages} 
                        onStagesChange={handleStagesChange} 
                        handleChangeUserAssgin={handleChangeUserAssgin}
                        role={role}
                        setSearchUser={setSearchUser}
                        searchUser={searchUser}
                        handleSearchAssignUsers={handleSearchAssignUsers}
                        handleDisplayUser={handleDisplayUser}
                        handleChangeAssignDate={handleChangeAssignDate}
                        // setAddDealOpen={setAddDealOpen}
                        setCustomizePipelineOpen={setCustomizePipelineOpen}
                        onDealClick={deal => {
                            setSelectedDealForEdit(deal);
                            setDealDetailOpen(true);
                        }} /> :
                    // List View
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            {dataDeal.map(deal => {
                                const stage = pipelineStages.find(s => s.id === deal.stage_id.toString());
                                return <ContextMenu key={deal.id}>
                                <ContextMenuTrigger>
                                    <Card className="cursor-pointer hover:shadow-md transition-all duration-300" 
                                    onClick={() => { setSelectedDealForEdit(deal); setDealDetailOpen(true); }}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-medium text-lg">{deal.title}</h4>
                                                       <Badge variant="secondary" className={`${deal.pipeline_stage.color} text-xs`}>
                                                            {deal.pipeline_stage.name}
                                                        </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                                    <div>
                                                        <span className="font-medium">Email:</span> {deal.contact?.email}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Contact:</span> {deal.contact?.name}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Product:</span> {deal.product?.name || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Expected Close:</span> {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary">
                                                    {currency === "USD" ? `$ ${deal.value_usd.toLocaleString()}` : `៛ ${deal.value_khr.toLocaleString()}`}
                                                </div>
                                                {deal.pipeline_stage.probability !== undefined && 
                                                    <div className="text-sm text-muted-foreground">
                                                        {deal.pipeline_stage.probability}% probability
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </CardContent>
                                    </Card>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => { setDealDetailOpen(true); }}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        View Details
                                    </ContextMenuItem>
                                    {/* <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteDealFromDetail(deal.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Deal
                                    </ContextMenuItem> */}
                                </ContextMenuContent>
                                </ContextMenu>;
                            })}
                        </div>
                        
                        {filteredDeals.length === 0 && <div className="text-center py-12">
                            <p className="text-muted-foreground">No deals found matching your criteria.</p>
                            </div>}
                        </div>}
                    </div>
            </CardContent>
        </Card>

        {/* Add Deal Dialog */}
        <Dialog open={addDealOpen} onOpenChange={setAddDealOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <Form {...dealForm}>
                <form onSubmit={dealForm.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField control={dealForm.control} name="title" render={({ field}) => 
                        <FormItem>
                            <FormLabel>Deal Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Deal title" {...field} required />
                            </FormControl>
                            <FormMessage />
                            
                        </FormItem>} />
                    <FormField control={dealForm.control} name="value" render={({ field }) => 
                        <FormItem>
                            <FormLabel>Value ({currency})</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Value" {...field} required />
                            </FormControl>
                            <FormMessage />
                        </FormItem>} />

                    <FormField control={dealForm.control} name="productId" render={({ field }) => 
                    <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px] overflow-y-auto bg-white text-black dark:bg-[#051438] dark:text-white">
                                <div className="px-3 py-2">
                                    <Input
                                        placeholder="Search product..."
                                        value={searchProduct}
                                        onChange={(e) => setSearchProduct(e.target.value)}
                                        className="max-w-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchProduct(searchProduct);
                                            }
                                        }}
                                    />
                                </div>
                                {dataProduct.length > 0 ? (
                                    dataProduct.map((pipeline) => (
                                        <SelectItem key={pipeline.id} value={pipeline.id.toString()} className="hover:bg-gray-100 dark:hover:bg-[#102345] text-black dark:text-white">
                                            {pipeline.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No results found.</div>
                                )}
                                <Link to={`/${domain}/pipelines/products`}>
                                    <Button className="h-[30px] my-2 mx-2">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Product
                                    </Button>
                                </Link>
                            </SelectContent>
                            
                        </Select>
                        <FormMessage />
                    </FormItem>
                    } />

                    <FormField control={dealForm.control} name="contactId" render={({ field }) => 
                    <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a contact" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px] overflow-y-auto bg-white text-black dark:bg-[#051438] dark:text-white">
                                <div className="px-3 py-2">
                                    <Input
                                        placeholder="Search contact..."
                                        value={searchContact}
                                        onChange={(e) => setSearchContact(e.target.value)}
                                        className="max-w-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchContact(searchContact);
                                            }
                                        }}
                                    />
                                </div>
                                {dataContact.length > 0 ? (
                                    dataContact.map((contact) => (
                                        <SelectItem key={contact.id} value={contact.id.toString()} className="hover:bg-gray-100 dark:hover:bg-[#102345] text-black dark:text-white">
                                            {contact.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No results found.</div>
                                )}
                                 <Link to={`/${domain}/pipelines/contacts`}>
                                    <Button className="h-[30px] my-2 mx-2">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Contact
                                    </Button>
                                </Link>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    } />

                    <FormField control={dealForm.control} name="expectedCloseDate" render={({ field }) => 
                        <FormItem className="flex flex-col space-y-3">
                            <FormLabel>Expected Close Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date < new Date()} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            <FormMessage />
                        </FormItem>} />
                    <FormField control={dealForm.control} name="stageId" render={({ field }) => 
                        <FormItem>
                            <FormLabel>Stage</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a stage" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dataPipelineStage.map(stage => 
                                            <SelectItem key={stage.id} value={stage.id.toString()}>
                                                <span>
                                                    {stage.name}
                                                    {role === 'admin' && (
                                                        <p className="text-xs text-muted-foreground break-words">
                                                            Created By: {stage.user?.name ?? 'Admin'}
                                                        </p>
                                                    )}
                                                </span>
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            <FormMessage />
                        </FormItem>
                    } />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setAddDealOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Add Deal</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
        </Dialog>

        {/* Export Deals Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Deals</DialogTitle>
                    <DialogDescription>
                        Export your deals to CSV or PDF format. Current filters will be applied to the export.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="format">Export Format</Label>
                        <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf') => setExportFormat(value)}>
                            <SelectTrigger id="format">
                                <SelectValue placeholder="Select a format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                                <SelectItem value="pdf">PDF (Document)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <p>Deals to export: {filteredDeals.length > 0 ? filteredDeals.length : deals.length}</p>
                        {filteredDeals.length > 0 && <p className="text-orange-600">Note: Current filters are applied. Only visible deals will be exported.</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setExportDialogOpen(false)}>
                        Cancel
                    </Button>
                    {/* <Button onClick={handleExport} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export {exportFormat.toUpperCase()}
                    </Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Sheet open={dealDetailOpen} onOpenChange={setDealDetailOpen}>
            <SheetContent className="w-full !max-w-[40vw] [@media(max-width:1199px)]:!max-w-[60vw] [@media(max-width:625px)]:!max-w-full h-full overflow-y-auto p-6">
                <SheetHeader> 
                    <div className="flex justify-between mt-5">
                        <SheetTitle>Deal Details</SheetTitle>
                        <Button onClick={() => handleCopyDeal(selectedDealForEdit)} variant="destructive" className="flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            Copy
                        </Button>
                    </div>
                    <SheetDescription>
                        View and edit the details of this deal.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Deal Title</Label>
                                <Input 
                                    id="edit-title" 
                                    value={typeof selectedDealForEdit === 'object' && selectedDealForEdit !== null ? selectedDealForEdit.title : ''}
                                    onChange={(e) => updateDeal('title', e.target.value)} 
                                    placeholder="Enter deal title"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && selectedDealForEdit && typeof selectedDealForEdit !== 'string') {
                                            handleUpdatedDealTitle(selectedDealForEdit.id, selectedDealForEdit.title);
                                        }
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-value">Value ({currency})</Label>
                                    <Input
                                        id="edit-value"
                                        type="text"
                                        value={ typeof selectedDealForEdit === 'object' && selectedDealForEdit !== null 
                                            ? (currency === "USD" ? selectedDealForEdit.value_usd : selectedDealForEdit.value_khr) 
                                            : ''}
                                        onChange={(e) => {
                                            const newValue = Number(e.target.value);
                                            if (
                                                typeof selectedDealForEdit === 'object' &&
                                                selectedDealForEdit !== null
                                            ) {
                                                updateDeal(
                                                    currency === "USD" ? "value_usd" : "value_khr",
                                                    isNaN(newValue) ? 0 : newValue
                                                );
                                            }
                                        }}
                                        placeholder={`Enter value in ${currency}`}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && selectedDealForEdit && typeof selectedDealForEdit !== 'string') {
                                            handleUpdatedDealValue(
                                                selectedDealForEdit.id,
                                                currency === "USD"
                                                ? selectedDealForEdit.value_usd
                                                : selectedDealForEdit.value_khr,
                                                currency
                                            );
                                        }}}
                                    />
                                </div>
                                {typeof selectedDealForEdit === "object" && selectedDealForEdit !== null && (
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-stage">Stage</Label>
                                        <Select 
                                            value={String(selectedDealForEdit.pipeline_stage?.id ?? "")}
                                            onValueChange={(stageId) => handleUpdatedDealStage(selectedDealForEdit.id, Number(stageId))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dataPipelineStage.map(stage => (
                                                    <SelectItem  key={stage.id} value={stage.id.toString()} className="group rounded hover:bg-red-600">
                                                        <span className="group-hover:text-white font-medium">
                                                            {stage.name}
                                                        </span>
                                                        {role === 'admin' && (
                                                            <p className="text-xs text-red-500 group-hover:text-white break-words">
                                                                Created By: {stage.user.name}
                                                            </p>
                                                        )}
                                                    </SelectItem>   
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {typeof selectedDealForEdit === "object" && selectedDealForEdit !== null && (
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-stage">Product</Label>
                                        <Select 
                                            value={String(selectedDealForEdit.product_id ?? "")}
                                            onValueChange={(productId) => handleUpdatedDealProduct(Number(selectedDealForEdit.id), Number(productId))}
                                        >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dataProduct.map(products => (
                                                <SelectItem  key={products.id} value={products.id.toString()} className="group rounded hover:bg-red-600">
                                                    <span className="group-hover:text-white font-medium">
                                                        {products.name}
                                                    </span>
                                                    {role === 'admin' && (
                                                        <p className="text-xs text-red-500 group-hover:text-white break-words">
                                                            Created By: {products.user?.name ?? ''}
                                                        </p>
                                                    )}
                                                </SelectItem>  
                                            ))}
                                        </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                           
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Expected Close Date</Label>
                                    <div>
                                        {typeof selectedDealForEdit === 'object' && selectedDealForEdit !== null && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className={cn( "w-[240px] justify-start text-left font-normal", !selectedDealForEdit.expected_close_date && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {selectedDealForEdit.expected_close_date ? (
                                                            format(new Date(selectedDealForEdit.expected_close_date), "PPP")
                                                        ) : (
                                                            <span>Select a date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={ selectedDealForEdit.expected_close_date ? new Date(selectedDealForEdit.expected_close_date) : undefined}
                                                        onSelect={(date) => handleUpdatedDealExpectedCloseDate(selectedDealForEdit.id, date)}
                                                        disabled={(date) => date < new Date()}
                                                        initialFocus
                                                        className={cn("p-3 pointer-events-auto")}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {typeof selectedDealForEdit === "object" && selectedDealForEdit !== null && (
                                        <div className="space-y-4">
                                            <DealProbabilityWidget 
                                                probability={selectedDealForEdit.pipeline_stage.probability || 0} 
                                                onChange={(probability) => handleUpdatedDealProbability(selectedDealForEdit.id, probability, selectedDealForEdit.pipeline_stage.id)} 
                                                label="Win Probability" 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {typeof selectedDealForEdit === 'object' && selectedDealForEdit !== null && (
                        <div className="space-y-4">
                            <DealUsersWidget
                                selectedDealForEdit={selectedDealForEdit}
                                dealId={selectedDealForEdit.id}
                                DealUsers={DealUsers}
                                handleAssignUsers={handleAssignUsers}
                                setUserAssigns={setUserAssigns}
                                userAssigns={userAssigns}
                                setAddUserDialogOpen={setAddUserDialogOpen}
                                addUserDialogOpen={addUserDialogOpen}
                                selectedUserId={selectedUserId}
                                setSelectedUserId={setSelectedUserId}
                                handleSearchAssignUsers={handleSearchAssignUsers}
                                setSearchUser={setSearchUser}
                                searchUser={searchUser}
                                handleRemoveUser={handleRemoveUser}

                            />
                        </div>
                    )}
                    {typeof selectedDealForEdit === 'object' && selectedDealForEdit !== null && (
                        <div className="space-y-4">
                            <DealNotesWidget 
                                dealId={selectedDealForEdit.id} 
                                handleSaveNote={handleSaveNote}
                                dataDeal={dataDeal}
                            />
                        </div>
                    )}
                    {typeof selectedDealForEdit === 'object' && selectedDealForEdit !== null && (
                        <div className="space-y-2">
                            <DealAttachmentsWidget 
                                dealId={selectedDealForEdit.id.toString()}
                                handleFileUpload={(e) => handleFileUpload(e)}
                                fileInputRef={fileInputRef}
                                isUploading={isUploading}
                                setAttachments={setAttachments}
                                attachments={attachments}
                                dataDeal={dataDeal}
                                handleDeleteFile={handleDeleteFile}
                                setFileToDelete={setFileToDelete}
                                fileToDelete={fileToDelete}
                                confirmDeleteFile={confirmDeleteFile}
    
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        {/* <DealHistoryWidget dealId={selectedDeal.id} /> */}
                    </div>
                
                </div>
                    <SheetFooter className="gap-2">
                        <Button onClick={() => handleSaveDeal(selectedDealForEdit)} variant="destructive" className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save
                        </Button>
                        {hasPermission("deals.delete") && 
                            <Button onClick={() => handleDeleteDeal(selectedDealForEdit.id)} variant="destructive" className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete Deal
                            </Button>
                        }
                        <SheetClose asChild>
                            <Button type="button">Close</Button>
                        </SheetClose>
                    </SheetFooter>
            </SheetContent>
        </Sheet>

        {/* Customize Pipeline Dialog */}
        <Dialog open={customizePipelineOpen} onOpenChange={setCustomizePipelineOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="text-xl">Manage Pipeline Stages</DialogTitle>
                <DialogDescription>
                    Add new stages or edit existing ones to customize your pipeline. Drag stages to reorder them.
                </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <h3 className="text-lg font-medium mb-3">Add New Stage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stage Name</label>
                            <Input value={newStage.name} onChange={e => setNewStage(prev => ({
                                ...prev,
                                name: e.target.value
                            }))} placeholder="Enter stage name" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stage Color</label>
                            <div className="flex gap-2">
                                <Select value={newStage.color} onValueChange={handleColorChange}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Select a color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {availableColors.map(color => <SelectItem key={color.id} value={color.value}>
                                        <div className="flex items-center gap-2">
                                            {color.id !== "custom" ? <div className={`w-4 h-4 rounded-full ${color.value.split(" ")[0]}`}></div> : <Palette className="w-4 h-4" />}
                                            {color.name}
                                        </div>
                                        </SelectItem>)}
                                    </SelectContent>
                                </Select>
                                
                                {showCustomColorInput && <div className="flex-1">
                                    <Input type="text" value={customColorHex} onChange={e => handleCustomColorChange(e.target.value)} placeholder="#RRGGBB" className="flex-1" />
                                    {!isValidHexColor(customColorHex) && customColorHex && <p className="text-xs text-destructive mt-1">Enter valid hex color (e.g., #FF5500)</p>}
                                    </div>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Win Probability %</label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                value={newStage.probability !== undefined ? newStage.probability.toString() : ""}
                                onChange={(e) => handleProbabilityChange(e.target.value)}
                                placeholder="Enter probability (0–100)"
                                maxLength={3}
                            />
                        </div>
                        <div className="flex items-end md:col-span-3">
                            <Button onClick={editingStageId ? handleUpdateStage : handleAddStage} className="w-full flex gap-2">
                                <PlusCircle className="h-4 w-4" />
                                {editingStageId ? "Update Stage" : "Add Stage"}
                            </Button>
                        </div>
                    </div>
                </div>
            
                <div>
                    <h3 className="text-lg font-medium mb-3">Current Stages</h3>
                    <div className="border rounded-md">
                        {dataPipelineStage.map((stage, index) => <div key={stage.id} className={cn("flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors", 
                            draggedStageIndex === index && "opacity-50")} 
                            draggable onDragStart={e => handleStageDragStart(e, index, stage.is_permanent)} 
                            onDragOver={handleStageDragOver} 
                            onDrop={e => handleStageDrop(e, index)} onDragEnd={handleStageDragEnd}>

                            <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                {stage.color === "custom" && stage.color ? <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }}></div> : 
                                <div className={`w-4 h-4 rounded-full ${stage.color.split(" ")[0]}`}></div>}
                                <span>
                                    {stage.name}    
                                    {role === 'admin' && (
                                        <p className="text-xs text-muted-foreground break-words flex gap-2 items-center mt-1">
                                            <User className="h-4 w-4" style={{ color: '#E53B2F' }} />
                                            <span>{stage.user?.name ?? ''}</span>
                                        </p>
                                    )}
                                </span>
                                {stage.probability !== undefined && 
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                        {stage.probability}%
                                    </span>
                                }
                            </div>
                            
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEditStage(stage)}>
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Button>
                                {stage.is_permanent === true ? (
                                    <Button size="sm" variant="ghost" disabled className="opacity-50 cursor-not-allowed" title="This stage cannot be deleted">
                                        <Ban className="h-4 w-4" />
                                        Delete
                                    </Button>
                                    ) : (
                                    <Button size="sm" variant="ghost" onClick={() => { setStageToDelete(stage.id.toString()); setDeleteStageDialogOpen(true); }}>
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <DialogFooter>
            <Button variant="outline" onClick={() => setCustomizePipelineOpen(false)}>Done</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>

        {/* Edit Stage Dialog */}
        {editingStage && <Dialog open={!!editingStage} onOpenChange={open => !open && setEditingStage(null)}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Stage</DialogTitle>
            </DialogHeader>
            
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditingStage(null)}>Cancel</Button>
                {/* <Button onClick={handleEditStage}>Save Changes</Button> */}
            </DialogFooter>
            </DialogContent>
        </Dialog>}

        {/* Delete Stage Confirmation Dialog */}
        <AlertDialog open={deleteStageDialogOpen} onOpenChange={setDeleteStageDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the stage{stageToDelete ? ` "${dataPipelineStage.find(s => s.id.toString() === stageToDelete)?.name}"` : ""}. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => { setDeleteStageDialogOpen(false); setStageToDelete(null); }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => stageToDelete && handleDeleteStage(stageToDelete)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Delete Deal Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the deal
                        {selectedDealForEdit ? ` "${dataDeal.find(d => d.id === selectedDealForEdit.id)?.title}"` : ""} and remove all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDeleteDeal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, delete deal
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
            </div>
        </main>
    )

};
export default Deals;
