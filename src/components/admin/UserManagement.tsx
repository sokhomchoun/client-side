
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Mail, MoreHorizontal, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { UserInviteForm } from './UserInviteForm';
import { UserEditForm } from './UserEditForm';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { TClient, TRoles, TUsers } from '@/types';
import { Pagination } from '../Pagination';

interface UserProps {
    dataUsers: TUsers[];
    dataRoles: TRoles[];
    handleGetPermission
    handleDeleteUser
    currentPage?: number;
    itemsPerPage?: number;
    countPagination?: number;
    setCurrentPage?: (page: number) => void;
    dataClient: TClient[]
}

export const UserManagement = ({ 
    dataUsers,
    dataRoles,
    handleGetPermission,
    handleDeleteUser,
    currentPage,
    itemsPerPage,
    countPagination,
    setCurrentPage,
    dataClient

}: UserProps) => {
    const [selectedUser, setSelectedUser] = useState<TUsers | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleInviteUser = async () => {
        await handleGetPermission();
    };

    const convertRoleName = (roleId: string): string => {
        const role = dataRoles.find((r) => r.id.toString() === roleId);
        return role ? role.role_name : 'Unknown';
    };

    const convertColor = (roleId: string): string => {
        const role = dataRoles.find((r) => r.id.toString() === roleId);
        return role ? role.color : 'Color';
    };
    
    const handleEditUser = async (userData: Partial<TUsers>) => {
        if (!selectedUser) return;
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        await handleGetPermission();
    };

    const handleResendInvite = (user: TUsers) => {
        toast.success('Invitation resent not responsible.');
    };

    const openEditDialog = (user: TUsers) => {
        const userForForm = {
            id: user.id.toString(),
            name: user.name || '',
            email: user.email,
            status: user.status,
            role: user.role
        };
        setSelectedUser(userForForm);
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (user: TUsers) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const filteredUsers = dataUsers.filter((user) => {
        const userRole = dataRoles.find(role => role.id.toString() === user.role);
        const userRoleName = userRole?.role_name?.toLowerCase() || '';

        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole =roleFilter === 'all' || userRoleName === roleFilter.toLowerCase();
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });
    
    return (
        <main>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">User Management</h2>
                        <p className="text-muted-foreground">
                            Manage users, roles, and send invitations
                        </p>
                    </div>
                   <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <Button 
                                onClick={() => { if (dataClient?.[0].limited_user === "1") {
                                    toast.error("You cannot invite user. Limit reached.");
                                    return;
                                }
                                setIsInviteDialogOpen(true);
                                }}>
                            <Mail className="h-4 w-4 mr-2" />
                            Invite User
                        </Button>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite New User</DialogTitle>
                                <DialogDescription>
                                    Create a new user account
                                </DialogDescription>
                            </DialogHeader>
                            <UserInviteForm 
                                onSubmit={handleInviteUser}
                                onSuccess={() => setIsInviteDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {dataRoles.filter(role => role.role_name.toLowerCase() !== 'admin').map(role => (
                                    <SelectItem key={role.id} value={role.role_name}>
                                        {role.role_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users ({filteredUsers.length})</CardTitle> 
                    <CardDescription>
                        Manage your organization's users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell> 
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: convertColor(user.role) }} />
                                            <span>{convertRoleName(user.role)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-3 py-[2px] rounded-full font-semibold border
                                            ${user.status === 'active' ? 'bg-red-500 text-white border-transparent' : 'border'}`}>
                                            {user.status.toLocaleLowerCase()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(user.joined).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit User
                                                </DropdownMenuItem>
                                                {user.status.toLowerCase() === 'pending' && (
                                                    <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Resend Invite
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="text-destructive">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user information and role
                    </DialogDescription>
                </DialogHeader>
                {selectedUser && (
                   <UserEditForm 
                        user={selectedUser} 
                        roles={dataRoles} 
                        onSubmit={handleEditUser} 
                    />
                )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={() => handleDeleteUser(selectedUser?.id)}
                title="Delete User"
                description={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
                confirmText="Delete User"
            />
            </div>
            {/* Pagination  */}
            <Pagination
                currentPage={currentPage}
                totalCount={countPagination}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </main>
    );
};
