
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
}

interface DealUsersWidgetProps {
    dealId: number;
    disabled?: boolean;
    onSave?: (users: User[]) => void;
    handleAssignUsers;
    DealUsers;
    setUserAssigns;
    userAssigns;
    setAddUserDialogOpen;
    addUserDialogOpen;
    selectedUserId;
    setSelectedUserId;
    setSearchUser;
    searchUser;
    handleSearchAssignUsers;
    selectedDealForEdit;
    handleRemoveUser
}


export const DealUsersWidget = ({ 
    dealId, 
    disabled = false,
    onSave,
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
    selectedDealForEdit,
    handleRemoveUser

}: DealUsersWidgetProps) => {
    
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
  
    // Filter users not already added to the deal
    const availableUsers = DealUsers.filter(user => 
        !userAssigns.some(dealUser => dealUser.id === user.id) &&
        (searchTerm === "" || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const getInitials = (name: string) => {
        return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    };

    useEffect(() => {
        if (selectedDealForEdit?.deal_teams) {
            const prefilledUsers = selectedDealForEdit.deal_teams.map((team) => ({
                id: team.id,
                name: team.name,
                email: team.email ?? "",
                avatar_url: team.avatarUrl ?? null,
                role_name: team.role_name ?? null,
            }));
            setUserAssigns(prefilledUsers);
        }
    }, [selectedDealForEdit, setUserAssigns]);
    
  
    return (
        <Card className="w-full">
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Deal Team
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {userAssigns.length > 0 ? (
                <div className="space-y-2">
                    {userAssigns.map(user => (
                    <div key={user.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url} alt={user.name} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="text-sm font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {user.role_name && <Badge variant="outline">{user.role_name}</Badge>}
                            {!disabled && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveUser(user.id)} >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <p className="text-sm">No users assigned to this deal</p>
                    </div>
                )}
                
                {!disabled && (
                    <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setAddUserDialogOpen(true)} className="mt-3 w-full" size="sm">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign Users
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Assign Users to Deal</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search Users</label>
                                    <Input 
                                        placeholder="Search by name or email" 
                                        value={searchUser} 
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchAssignUsers(searchUser);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select User</label>
                                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableUsers.length > 0 ? (
                                                availableUsers.map(user => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                            </Avatar>
                                                            <span>{user.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                                    {searchTerm ? "No matching users found" : "All users are already assigned"}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>Cancel</Button>
                                <Button onClick={() => handleAssignUsers(dealId)}>Add User</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    );
};
