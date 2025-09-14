import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlusCircle, Settings, Users, User, BarChart3, Target, Trash2, TrendingUp, Filter, Share2, Calendar, MoreVertical, Edit, Eye, Building2, Clock, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import PipelineShareSettings from "@/components/PipelineShareSettings";
import { usePipelines } from "@/hooks/usePipelines";
import { LoadingComponent } from "@/components/LoadingComponent";
import { useHasPermission } from "@/hooks/useHasPermission";
import { PipelineSkeleton } from "@/components/skeleton/PipelineSkeleton";

const Pipelines = () => {

    const { 
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
        totalDeals,
        domain,
        handleViewPipeline,
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


    } = usePipelines();

    const { hasPermission } = useHasPermission();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPipelines = dataPipelines.filter(pipeline => 
        pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) 
        || pipeline.description 
        && pipeline.description.toLowerCase().includes(searchTerm.toLowerCase()));


    return (
        <main className="relative">
            <PipelineSkeleton isActive={loading} />
            <div className="space-y-6" style={{
                    background: 'linear-gradient(135deg, rgba(229, 59, 47, 0.02) 0%, rgba(252, 138, 39, 0.02) 25%, rgba(247, 214, 31, 0.02) 50%, rgba(95, 166, 90, 0.02) 75%, rgba(1, 181, 188, 0.02) 100%)'
                }}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight py-0 my-[8px] text-foreground">Pipeline Management</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasPermission("pipelines.create") && 
                            <Button
                                onClick={() => {
                                    const client = dataClient[0];
                                    const limitRaw = client?.limited_pipeline;
                                    const usageRaw = client?.client_usage?.[0]?.pipeline_usage;

                                    const isUnlimited = typeof limitRaw === 'string' && limitRaw.toLowerCase() === 'unlimited';
                                    const limit = isUnlimited ? Infinity : Number(limitRaw || 0);
                                    const currentUsage = Number(usageRaw || 0);

                                    if (!isUnlimited && currentUsage >= limit) {
                                        toast.warning(`You have reached your pipeline limit of ${limit}. Please upgrade your plan to add more.`);
                                        return;
                                    }

                                    setAddPipelineOpen(true);
                                }}
                                style={{ background: 'linear-gradient(135deg, rgba(229, 59, 47, 0.9) 0%, rgba(252, 138, 39, 0.9) 100%)', border: 'none'}}
                                className="text-white hover:opacity-90 transition-opacity"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Pipeline
                            </Button>
                        }
                       
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card style={{
                        background: 'linear-gradient(135deg, rgba(229, 59, 47, 0.1) 0%, rgba(252, 138, 39, 0.05) 100%)',
                        borderColor: 'rgba(229, 59, 47, 0.2)'
                        }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pipelines</CardTitle>
                        <TrendingUp className="h-4 w-4" style={{ color: '#E53B2F' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#E53B2F' }}>{dataPipelines.length}</div>
                        <p className="text-xs text-muted-foreground">
                        {dataPipelines.length} active dataPipelines
                        </p>
                    </CardContent>
                    </Card>
                    <Card style={{
                        background: 'linear-gradient(135deg, rgba(252, 138, 39, 0.1) 0%, rgba(247, 214, 31, 0.05) 100%)',
                        borderColor: 'rgba(252, 138, 39, 0.2)'
                    }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                        <Users className="h-4 w-4" style={{ color: '#FC8A27' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#FC8A27' }}>
                            {totalDeals}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all pipelines
                        </p>
                    </CardContent>
                    </Card>
                    <Card style={{
                        background: 'linear-gradient(135deg, rgba(95, 166, 90, 0.1) 0%, rgba(0, 82, 0, 0.05) 100%)',
                        borderColor: 'rgba(95, 166, 90, 0.2)'
                    }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Target</CardTitle>
                        <Target className="h-4 w-4" style={{ color: '#5FA65A' }} />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#5FA65A' }}>
                            {dataPipelines.reduce((sum, pipeline) => {
                                const monthlyTarget = pipeline.sale_target.find(t => t.period_type === 'monthly');
                                if (!monthlyTarget) return sum;
                                if (currency === 'KHR') {
                                    return sum + (monthlyTarget.monthly_target_khr || 0);
                                } else {
                                    return sum + (monthlyTarget.monthly_target_usd || 0);
                                }
                            }, 0).toLocaleString(undefined, { style: 'currency', currency })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Monthly target across all pipelines ({currency})
                        </p>
                    </CardContent>
                    </Card>
                    <Card style={{
                    background: 'linear-gradient(135deg, rgba(1, 181, 188, 0.1) 0%, rgba(251, 85, 87, 0.05) 100%)',
                    borderColor: 'rgba(1, 181, 188, 0.2)'
                    }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Deals/Pipeline</CardTitle>
                        <Settings className="h-4 w-4" style={{ color: '#01B5BC' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: '#01B5BC' }}>
                        {dataPipelines.length > 0 ? Math.round(dataPipelines.reduce((sum, pipeline) => sum + (pipeline._count.deals || 0), 0) / dataPipelines.length) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average deal count per pipeline
                        </p>
                    </CardContent>
                    </Card>
                </div>

                {/* Pipeline List */}
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPipelines.map((pipeline, index) => {

                    const publicShare = pipeline.share_pipelines?.find(sp => sp.status_share === 'public');
                    const isPublicShare = !!publicShare;

                    const currentUserShare = pipeline.share_pipelines?.find(sp => sp.email === email);
                    const isOwnerOfPublicShare = publicShare?.invited_by === auth_id;

                    let effectivePermission = currentUserShare?.permission;

                    // If public share exists but user is NOT owner, force viewer permission
                    if (isPublicShare && !isOwnerOfPublicShare) {
                        effectivePermission = 'viewer';
                    }

                    // Adjust this to include both "admin" and "editor"
                    const canEditPermission = ['admin', 'editor'];

                    // Now check if effectivePermission is in allowed edit permissions
                    const canEdit = (!isPublicShare || isOwnerOfPublicShare) &&
                    (!pipeline.share_pipelines?.length || !currentUserShare || canEditPermission.includes(effectivePermission ?? ''));

                    const canShare = (!isPublicShare || isOwnerOfPublicShare) &&
                    (!pipeline.share_pipelines?.length || !currentUserShare || effectivePermission === 'admin');

                    const canDelete = (!isPublicShare || isOwnerOfPublicShare) &&
                    (!pipeline.share_pipelines?.length || !currentUserShare || effectivePermission === 'admin');

                    return <Card onClick={() => handleViewPipeline(pipeline.id)} key={pipeline.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white dark:bg-white/5 border">
                        <CardHeader className="relative pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div>
                                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                                        <div className="flex items-center">
                                            {pipeline.name}
                                            <div className="px-3">
                                                {role === 'admin' && (
                                                    <p className="text-xs text-muted-foreground break-words flex gap-2 items-center">
                                                        <User className="h-4 w-4" style={{ color: '#E53B2F' }} />
                                                        <span> {pipeline.user?.name ?? ''}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                       
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-0.5 group-hover:text-foreground/80 transition-colors duration-300">{pipeline.description}</CardDescription>
                                </div>
                            </div>

                            { /* Dropdown Menu */ }
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted transition-all duration-300">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                {/* Dropdown Menu Content */}
                                <DropdownMenuContent align="end" className="bg-background shadow-lg border">
                                    {hasPermission("pipelines.view") && (
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewPipeline(pipeline.id);
                                            }}
                                            className="hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer text-foreground hover:text-blue-800 dark:hover:text-blue-200"
                                            >
                                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                            <span className="font-medium">View Pipeline</span>
                                        </DropdownMenuItem>
                                    )}

                                    {(!isPublicShare || isOwnerOfPublicShare) && canEdit && hasPermission("pipelines.edit") && (
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditPipeline(pipeline);
                                            }}
                                            className="hover:bg-green-100 dark:hover:bg-green-900/20 cursor-pointer text-foreground hover:text-green-800 dark:hover:text-green-200"
                                        >
                                            <Edit className="mr-2 h-4 w-4 text-green-600" />
                                            <span className="font-medium">Edit</span>
                                        </DropdownMenuItem>
                                    )}

                                    {(!isPublicShare || isOwnerOfPublicShare) && canShare && hasPermission("pipelines.share") && (
                                        <DropdownMenuItem 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShare(pipeline.id);
                                            }}    
                                            className="hover:bg-purple-100 dark:hover:bg-purple-900/20 cursor-pointer text-foreground hover:text-purple-800 dark:hover:text-purple-200"
                                        >
                                        <Share2 className="mr-2 h-4 w-4 text-purple-600" />
                                        <span className="font-medium">Share</span>
                                        </DropdownMenuItem>
                                    )}

                                    {(!isPublicShare || isOwnerOfPublicShare) && canDelete && hasPermission("pipelines.delete") && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer" 
                                                 onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePipeline(pipeline.id);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                                <span className="font-medium">Delete</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        </CardHeader>
                        <CardContent className="relative pt-1 bg-white dark:bg-transparent">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 shadow-sm bg-white dark:bg-white/10">
                            <div className="p-2 rounded-full transition-colors duration-300" style={{
                                background: 'rgba(229, 59, 47, 0.15)'
                            }}>
                                <Users className="h-4 w-4" style={{ color: '#E53B2F' }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-black dark:text-white">Active Deals</p>
                                <p className="text-lg font-bold text-black dark:text-white">{pipeline._count.deals || 0}</p>
                            </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 shadow-sm bg-white dark:bg-white/10">
                                <div className="p-2 rounded-full transition-colors duration-300" style={{ background: "rgba(95, 166, 90, 0.15)" }}>
                                    <Target className="h-4 w-4" style={{ color: "#5FA65A" }} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-black dark:text-white">Sales Target</p>
                                    <p className="text-lg font-bold text-black dark:text-white">
                                    {currency === "USD"
                                        ? `$${pipeline.sale_target?.[0]?.monthly_target_usd?.toLocaleString() ?? '0'}`
                                        : `${pipeline.sale_target?.[0]?.monthly_target_khr?.toLocaleString() ?? '0'} ៛`}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 shadow-sm bg-white dark:bg-white/10">
                            <div className="p-2 rounded-full transition-colors duration-300" style={{
                                background: 'rgba(252, 138, 39, 0.15)'
                            }}>
                                <Layers className="h-4 w-4" style={{ color: '#FC8A27' }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-black dark:text-white">Stages</p>
                                <p className="text-lg font-bold text-black dark:text-white">{pipeline.totalStages}</p>
                            </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 shadow-sm bg-white dark:bg-white/10">
                            <div className="p-2 rounded-full transition-colors duration-300" style={{
                                background: 'rgba(1, 181, 188, 0.15)'
                            }}>
                                <Clock className="h-4 w-4" style={{ color: '#01B5BC' }} />
                            </div>
                           <div>
                                <p className="text-xs font-medium text-black dark:text-white">Last Updated</p>
                                <p className="text-sm font-semibold text-black dark:text-white">
                                    {pipeline.sale_target && pipeline.sale_target.length > 0 && pipeline.sale_target[0].updatedAt
                                        ? format(new Date(pipeline.sale_target[0].updatedAt), "MMM dd, yyyy")
                                        : "N/A"
                                    }
                                </p>
                            </div>

                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    })}
                </div>

                {/* Add Pipeline Dialog */}
                <Dialog open={addPipelineOpen} onOpenChange={setAddPipelineOpen}>
                    <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Pipeline</DialogTitle>
                            <DialogDescription>
                                Create a new pipeline to manage your sales process.
                            </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" value={newPipeline.name} onChange={e => setNewPipeline({
                                ...newPipeline,
                                name: e.target.value
                            })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea id="description" value={newPipeline.description || ""} onChange={e => setNewPipeline({
                                ...newPipeline,
                                description: e.target.value
                            })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setAddPipelineOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={handleAddPipeline}>Add Pipeline</Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Pipeline Dialog */}
                <Dialog open={editPipelineOpen} onOpenChange={setEditPipelineOpen}>
                    <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Pipeline</DialogTitle>
                        <DialogDescription>
                            Edit the details and sales targets of the selected pipeline.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={newPipeline.name} onChange={e => setNewPipeline({...newPipeline, name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea id="description" value={newPipeline.description || ""} onChange={e => setNewPipeline({...newPipeline, description: e.target.value})} className="col-span-3"/>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Sales Targets</Label>
                        
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="period-type" className="text-right">Period Type</Label>
                                <Select 
                                    value={typeof newPipeline.salesTarget === 'object' ? newPipeline.salesTarget?.periodType || "monthly" : "monthly"}
                                    onValueChange={(value: "monthly" | "quarterly" | "yearly") => 
                                        setNewPipeline({
                                        ...newPipeline,
                                        salesTarget: {
                                            ...(typeof newPipeline.salesTarget === 'object' ? newPipeline.salesTarget : { monthly: 0, quarterly: 0, yearly: 0 }),
                                            periodType: value
                                        }
                                        })
                                    }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="monthly-target" className="text-right">Monthly Target ({currency})</Label>
                                <Input
                                    id="monthly-target"
                                    type="number"
                                    value={
                                        typeof newPipeline.salesTarget === 'object' && newPipeline.salesTarget?.monthly !== undefined
                                            ? newPipeline.salesTarget.monthly === 0
                                                ? ''
                                                : newPipeline.salesTarget.monthly
                                            : ''
                                    }
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        const monthly = inputValue === '' ? 0 : Number(inputValue);
                                        setNewPipeline({
                                            ...newPipeline,
                                            salesTarget: {
                                                ...(typeof newPipeline.salesTarget === 'object'
                                                    ? newPipeline.salesTarget
                                                    : { periodType: "monthly" }),
                                                monthly,
                                                quarterly: monthly * 3,
                                                yearly: monthly * 12,
                                            },
                                        });
                                    }}
                                    className="col-span-3"
                                    placeholder={`Enter monthly target (${currency})`}
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quarterly-target" className="text-right">
                                    Quarterly Target ({currency})
                                </Label>
                                <Input
                                    id="quarterly-target"
                                    type="number"
                                    value={
                                    typeof newPipeline.salesTarget === 'object' && newPipeline.salesTarget?.quarterly !== undefined
                                        ? newPipeline.salesTarget.quarterly === 0
                                        ? ''
                                        : newPipeline.salesTarget.quarterly
                                        : ''
                                    }
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        const quarterly = inputValue === '' ? 0 : Number(inputValue);
                                        setNewPipeline({
                                            ...newPipeline,
                                            salesTarget: {
                                                ...(typeof newPipeline.salesTarget === 'object'
                                                    ? newPipeline.salesTarget
                                                    : { periodType: "monthly" }),
                                                monthly: quarterly / 3,
                                                quarterly,
                                                yearly: quarterly * 4,
                                            },
                                        });
                                    }}
                                    className="col-span-3"
                                    placeholder={`Enter quarterly target (${currency})`}
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="yearly-target" className="text-right">
                                    Yearly Target ({currency})
                                </Label>
                                <Input
                                    id="yearly-target"
                                    type="number"
                                    value={
                                    typeof newPipeline.salesTarget === 'object' && newPipeline.salesTarget?.yearly !== undefined
                                        ? newPipeline.salesTarget.yearly === 0
                                        ? ''
                                        : newPipeline.salesTarget.yearly
                                        : ''
                                    }
                                   onChange={(e) => {
                                        const inputValue = e.target.value;
                                        const yearly = inputValue === '' ? 0 : Number(inputValue);
                                        setNewPipeline({
                                            ...newPipeline,
                                            salesTarget: {
                                                ...(typeof newPipeline.salesTarget === 'object'
                                                    ? newPipeline.salesTarget
                                                    : { periodType: "monthly" }),
                                                monthly: yearly / 12,
                                                quarterly: yearly / 4,
                                                yearly,
                                            },
                                        });
                                    }}
                                    className="col-span-3"
                                    placeholder={`Enter yearly target (${currency})`}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setEditPipelineOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={handleUpdatePipeline}>Update Pipeline</Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Pipeline Confirmation Dialog */}
                <AlertDialog open={deletePipelineOpen} onOpenChange={setDeletePipelineOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                pipeline and all associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletePipelineOpen(false)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmDeletePipeline}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Pipeline Share Settings */}
                {selectedPipelineForSharing && (
                    <PipelineShareSettings 
                        pipelineId={selectedPipelineForSharing} 
                        pipelineName={dataPipelines.find(p => p.id.toString() === selectedPipelineForSharing)?.name || ""} 
                        isOpen={isShareSettingsOpen} 
                        onClose={() => {
                            setIsShareSettingsOpen(false);
                            setSelectedPipelineForSharing(null);
                        }} 
                        handleSaveSettings={handleSaveSettings}
                        handleSharingLevelChange={handleSharingLevelChange}
                        setSharing={setSharing}
                        sharing={sharing}
                        onInviteUser={onInviteUser}
                        inviteForm={inviteForm}
                        dataUserInvite={dataUserInvite}
                        handleRemoveUser={handleRemoveUser}
                        handlePermissionChange={handlePermissionChange}
                    />
                )}
            </div>
        </main>
    )

};

export default Pipelines;
