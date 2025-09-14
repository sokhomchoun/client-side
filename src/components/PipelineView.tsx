import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Eye, Pencil, Trash2, Calendar as CalendarIcon, MoreVertical, User, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TDeals, TPipelineState, TUsers } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type PipelineStage = {
    id: string;
    name: string;
    color: string;
    customColor?: string;
    probability?: number;
};

type Pipeline = {
    id: string;
    name: string;
    description?: string;
};

interface PipelineViewProps {
    pipelines: Pipeline[];
    pipelineStages: PipelineStage[];
    onStagesChange: (stages: TPipelineState[]) => void;
    onDealClick?: (deal: TDeals) => void;
    dataDeal: TDeals[];
    currency: string;
    handleDrop;
    handleDragStart;
    dataPipelineStage: TPipelineState[];
    selectedPipeline;
    selectedStage;
    role;
    handleChangeUserAssgin?: (user: TUsers) => void;
    DealUsers: TUsers[];
    setSearchUser;
    searchUser;
    handleSearchAssignUsers;
    handleDisplayUser;
    handleChangeAssignDate;
    setCustomizePipelineOpen;
    showOnlyWonStage?: boolean;
}

const PipelineView: React.FC<PipelineViewProps> = ({
    onDealClick,
    dataDeal,
    currency,
    handleDrop,
    handleDragStart,
    dataPipelineStage,
    selectedPipeline,
    selectedStage,
    role,
    handleChangeUserAssgin,
    DealUsers,
    setSearchUser,
    searchUser,
    handleSearchAssignUsers,
    handleDisplayUser,
    handleChangeAssignDate,
    setCustomizePipelineOpen,
    showOnlyWonStage = false 

}) => {

    // Edit deal state - Updated to use TDeals type
    const [editingDeal, setEditingDeal] = React.useState<TDeals | null>(null);
    const [editDealOpen, setEditDealOpen] = React.useState(false);

    // Handle drag over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Allow drop
        e.dataTransfer.dropEffect = 'move';
    };

    // Handle deal click
    const handleDealCardClick = (deal: TDeals) => {
        if (onDealClick) {
            onDealClick(deal);
        }
    };

    // Handle save edited deal
    const handleSaveEditedDeal = () => {
        if (!editingDeal) return;
        const updatedDeals = dataDeal.map(deal => deal.id === editingDeal.id ? editingDeal : deal);
        // onDealsChange(updatedDeals);
        setEditDealOpen(false);
        setEditingDeal(null);
        toast.success("Deal updated successfully!");
    };

    const uniqueStages = Array.from(
        new Map(dataDeal.map(deal => [deal.stage_id, deal.pipeline_stage])).entries()).map(([id, pipeline_stage]) => ({
        id,
        pipeline_stage,
    }));

    const selectedStageNum = selectedStage === "all" ? null : Number(selectedStage);
    const filteredPipeline = selectedStageNum === null ? dataDeal : dataDeal.filter(deal => deal.stage_id === selectedStageNum );

    const getDealsForStage = (stageId: number) => {
        const selectedStageNum = selectedStage === "all" ? null : Number(selectedStage);
        const filtered = selectedStageNum === null ? dataDeal : dataDeal.filter(d => d.stage_id === selectedStageNum);
        return filtered.filter(d => d.pipeline_stage?.id === stageId);
    };

    const getInitials = (name?: string) => {
        if (!name) return "";
        return name.split(" ").map(p => p[0]).join("").toUpperCase();
    };

    // Extract pipeline stages from deals data
    const pipelineStagesFromDeals = dataDeal.map(deal => deal.pipeline_stage).filter(Boolean);
    
    // Combine stages from both sources and remove duplicates
    const allAvailableStages = [...dataPipelineStage,...pipelineStagesFromDeals].reduce((unique, stage) => {
        const exists = unique.find(s => s.id === stage.id);
        if (!exists) {
            unique.push(stage);
        }
        return unique;
    }, []);
    
    // Find specific stages
    const wonStage = allAvailableStages.find(s => s.name === "Won");
    const lostStage = allAvailableStages.find(s => s.name === "Lost");
    
    // FIXED: Conditional stage filtering
    let stagesToDisplay = [...dataPipelineStage];

    dataDeal.forEach(deal => {
        if (deal.pipeline_stage && !stagesToDisplay.find(s => s.id === deal.pipeline_stage.id)) {
            stagesToDisplay.push(deal.pipeline_stage);
        }
    });

    if (wonStage && !stagesToDisplay.find(s => s.id === wonStage.id)) {
        stagesToDisplay.push(wonStage);
    }

    if (lostStage && !stagesToDisplay.find(s => s.id === lostStage.id)) {
        stagesToDisplay.push(lostStage);
    }

    if (showOnlyWonStage) {
        stagesToDisplay = wonStage ? [wonStage] : [];
    }

    stagesToDisplay = stagesToDisplay.sort((a, b) => (a.order_stage ?? 0) - (b.order_stage ?? 0));

    const hasPermanentStages = stagesToDisplay.some(stage => stage.is_permanent !== true);
    
    return (
        <div className="space-y-6">
            {/* Horizontally Scrollable Kanban View */}
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4" style={{ width: `${stagesToDisplay.length * 320}px` }}>
                    {!hasPermanentStages && (
                        <div className="min-h-[500px] w-80 flex-shrink-0">
                            <Card className="h-full w-full">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="text-xs">
                                                Get Started
                                            </Badge>
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 p-3 flex flex-col items-center justify-center h-full">
                                    <div className="text-center space-y-4">
                                        <Button onClick={() => setCustomizePipelineOpen(true)} className="flex items-center gap-2 h-[34px] text-sm" size="lg">
                                            <Plus className="h-4 w-4" />
                                            Create Stage
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {stagesToDisplay.map(stage => {
                        const stageDeals = getDealsForStage(stage.id);
                        const isSpecialStage = stage.name === "Won" || stage.name === "Lost";
                        return (
                            <div key={stage.id} className="min-h-[500px] w-80 flex-shrink-0" onDragOver={handleDragOver} 
                                onDrop={(e) => { 
                                    handleDrop(stage.id.toString(), e)
                                }}>
                                <Card className="h-full w-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                                  <Badge variant="secondary" className={`${stage.color} text-xs`}>
                                                    {stage.name || stage.name}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">    
                                                    ({stageDeals.length})
                                                </span>
                                                {role === 'admin' && (() => {
                                                    const dealForStage = dataDeal.find(deal => deal.stage_id === stage.id);
                                                    return (
                                                        <p className="text-xs text-muted-foreground break-words flex gap-2 items-center">
                                                            <User className="h-4 w-4" style={{ color: '#E53B2F' }} />
                                                            <span>{stage?.user?.name ?? dealForStage?.user?.name ?? "Unknown"}</span>
                                                        </p>
                                                    );
                                                })()}
                                            </CardTitle>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {stageDeals.length > 0 ? (
                                                currency === "USD" ? (
                                                    <>Total: USD {stageDeals.reduce((sum, deal) => sum + (deal.value_usd || 0), 0).toLocaleString()}</>
                                                ) : (
                                                    <>Total: KHR {stageDeals.reduce((sum, deal) => sum + (deal.value_khr || 0), 0).toLocaleString()}</>
                                                )
                                            ) : (
                                                <>Total: USD 0</>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 p-3">
                                    {stageDeals.length === 0 ? (
                                        <div className="text-muted-foreground text-sm text-center py-6 select-none cursor-default">
                                            {/* No deals yet */}
                                            {isSpecialStage ? "No deals yet" : "No deals yet"}
                                        </div>
                                    ) : ( stageDeals.map(deal => (
                                            <ContextMenu key={deal.id}>
                                                <ContextMenuTrigger>
                                                    <Card className="cursor-pointer hover:shadow-md transition-all duration-300 bg-background border-2 border-transparent hover:border-transparent relative overflow-hidden group w-full" 
                                                        draggable={true}
                                                        onDragStart={(e) => handleDragStart(deal, e)} 
                                                        onClick={() => handleDealCardClick(deal)}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[2px] rounded-lg">
                                                            <div className="w-full h-full bg-background rounded-[calc(0.5rem-2px)]"></div>
                                                        </div>
                                                        <CardContent className="p-3 relative z-10">
                                                            <div className="space-y-2">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <h4 className="font-medium text-sm leading-tight break-words flex-1">
                                                                        {deal.title}
                                                                    </h4>
                                                                </div>
                                                               <p className="text-lg font-semibold text-primary">
                                                                    {currency === "USD" && deal?.value_usd != null && (`$ ${deal.value_usd.toLocaleString()}`)}
                                                                    {currency === "KHR" && deal?.value_khr != null && (`៛ ${deal.value_khr.toLocaleString()}`)}
                                                                </p>

                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-muted-foreground break-words">{deal.contact?.name}</p>
                                                                    <p className="text-xs text-muted-foreground break-words">{deal.contact?.email}</p>
                                                                    {deal.expected_close_date && 
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Expected: {new Date(deal.expected_close_date).toLocaleDateString()}
                                                                        </p>
                                                                    }
                                                                    {deal.product && 
                                                                        <p className="text-xs text-muted-foreground break-words">
                                                                            Product: {deal.product.name}
                                                                        </p>
                                                                    }
                                                                    {deal.user && 
                                                                        <p className="text-xs text-muted-foreground break-words">
                                                                            Created By: {deal.user.name}
                                                                        </p>
                                                                    }
                                                                    {deal.deal_teams && deal.deal_teams.length > 0 && (
                                                                        <div onClick={(e) => e.stopPropagation() } className="flex flex-wrap gap-2 pt-2">
                                                                            {deal.deal_teams.map(team => (
                                                                                <div key={team.id} className="flex items-center gap-3">
                                                                                    <Popover >
                                                                                        <PopoverTrigger asChild>
                                                                                            <Avatar  onClick={(e) => { e.stopPropagation(); handleDisplayUser(team); }} className="h-5 w-5 text-sm cursor-pointer">
                                                                                                <AvatarFallback>{getInitials(team.name)}</AvatarFallback>
                                                                                            </Avatar>
                                                                                        </PopoverTrigger>
                                                                                        <PopoverContent className="w-80 p-2">
                                                                                            <Input type="search" placeholder="Search..."
                                                                                                value={searchUser} 
                                                                                                onChange={e => setSearchUser(e.target.value)} 
                                                                                                className="w-full h-[30px]" 
                                                                                                onKeyDown={(e) => {
                                                                                                    if (e.key === 'Enter') {
                                                                                                        handleSearchAssignUsers(searchUser);
                                                                                                    }
                                                                                                }}
                                                                                            />
                                                                                           <div className="space-y-1 mt-3">
                                                                                                {DealUsers.map((user) => (
                                                                                                    <div
                                                                                                        onClick={() => handleChangeUserAssgin(user)}
                                                                                                        key={user.id}
                                                                                                        className="flex items-center gap-2 p-1 cursor-pointer hover:bg-[#1F2C4D] dark:hover:bg-[#1F2C4D] rounded-md"
                                                                                                    >
                                                                                                        <Avatar className="h-5 w-5">
                                                                                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                                                                        </Avatar>
                                                                                                        <span className="text-xs text-muted-foreground">{user.name}</span>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </PopoverContent>
                                                                                    </Popover>
                                                                                    <Popover>
                                                                                        <PopoverTrigger asChild>
                                                                                            <span className="text-xs text-muted-foreground cursor-pointer hover:underline hover:text-primary transition-colors">
                                                                                            {team.createdAt
                                                                                                    ? new Date(team.createdAt).toLocaleDateString("en-US", {
                                                                                                        year: "numeric",
                                                                                                        month: "short",
                                                                                                        day: "numeric",
                                                                                                    })
                                                                                                    : "N / A"   
                                                                                                }
                                                                                            </span>
                                                                                        </PopoverTrigger>
                                                                                        <PopoverContent className="w-auto p-2">
                                                                                            <Calendar
                                                                                                mode="single"
                                                                                                selected={team.createdAt ? new Date(team.createdAt) : undefined}
                                                                                                onSelect={(newDate) => { handleChangeAssignDate(newDate, team) }}
                                                                                            />
                                                                                        </PopoverContent>
                                                                                    </Popover>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}                           
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent>
                                                </ContextMenuContent>
                                            </ContextMenu>
                                        ))
                                    )}
                                    </CardContent>
                                </Card>
                            </div> 
                        );
                    })}
                    
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Edit Deal Dialog */}
            <Dialog open={editDealOpen} onOpenChange={setEditDealOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Deal</DialogTitle>
                    </DialogHeader>
                    {editingDeal && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input id="edit-title" value={editingDeal.title} onChange={e => setEditingDeal({ ...editingDeal, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-value-usd">Value (USD)</Label>
                                <Input id="edit-value-usd" type="number" value={editingDeal.value_usd} onChange={e => setEditingDeal({ ...editingDeal, value_usd: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-value-khr">Value (KHR)</Label>
                                <Input id="edit-value-khr" type="number" value={editingDeal.value_khr} onChange={e => setEditingDeal({ ...editingDeal, value_khr: Number(e.target.value) })}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-contact-name">Contact Name</Label>
                                <Input id="edit-contact-name" value={editingDeal.contact?.name || ''} onChange={e => setEditingDeal({ ...editingDeal,
                                        contact: {
                                            ...editingDeal.contact,
                                            name: e.target.value
                                        }
                                    })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-contact-email">Contact Email</Label>
                                <Input 
                                    id="edit-contact-email" value={editingDeal.contact?.email || ''} onChange={e => setEditingDeal({...editingDeal,
                                        contact: {
                                            ...editingDeal.contact,
                                            email: e.target.value
                                        }
                                    })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-product">Product</Label>
                                <Input id="edit-product" value={editingDeal.product?.name || ''} onChange={e => setEditingDeal({...editingDeal,
                                        product: {
                                            ...editingDeal.product,
                                            name: e.target.value
                                        }
                                    })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Expected Close Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn( "w-full justify-start text-left font-normal", !editingDeal.expected_close_date && "text-muted-foreground" )} >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editingDeal.expected_close_date ? 
                                                format(new Date(editingDeal.expected_close_date), "PPP") : 
                                                "Pick a date"
                                            }
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar 
                                            mode="single" 
                                            selected={editingDeal.expected_close_date ? new Date(editingDeal.expected_close_date) : undefined} 
                                            onSelect={date => setEditingDeal({
                                                ...editingDeal,
                                                expected_close_date: date?.toISOString()
                                            })} 
                                            initialFocus 
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Stage</Label>
                                <Select value={editingDeal.stage_id?.toString()} onValueChange={value => setEditingDeal({...editingDeal, stage_id: parseInt(value)})} >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uniqueStages.map(stage => (
                                            <SelectItem key={stage.id} value={stage.id.toString()}>
                                                {stage.pipeline_stage.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDealOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEditedDeal}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PipelineView;