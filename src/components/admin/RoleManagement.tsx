
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleForm } from './RoleForm';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { Role } from '@/types/roles';
import { usePermission } from '@/hooks/usePermission';
import { TRoles, TPermissions, TUsers, TClient } from '@/types';
import { Pagination } from '../Pagination';
import { toast } from '@/components/ui/sonner';
interface RoleProps {
    data
    handleGetRoles, 
    handleDeleteRole, 
    dataRoles: TRoles[]
    dataUsers: TUsers[]
    currentPage?: number;
    itemsPerPage?: number;
    countPagination?: number;
    setCurrentPage?: (page: number) => void;
    dataClient: TClient[];
}

export const RoleManagement = ({ 
    data,
    handleGetRoles,
    handleDeleteRole,
    dataRoles,
    dataUsers,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    countPagination,
    dataClient

}: RoleProps ) => {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [delRole, setDelRole] = useState<TRoles | null>(null);

    const handleCreateRole = (roleData: Partial<Role>) => {
        setIsCreateDialogOpen(false);
        handleGetRoles();
    };

    const isValidPermission = (p: unknown): p is TPermissions => {
        return (typeof p === 'object' &&
            p !== null &&
            'url' in p &&
            'name' in p
        );
    };  

    const openEditDialog = (role: TRoles) => {
        const mappedRole: Role = {
            isEditing: true,
            id: role.id.toString(),
            name: role.role_name,
            description: role.description || '',
            color: role.color || '#6b7280',
            permissions: Array.isArray(role.permissions)
            ? role.permissions.filter(isValidPermission).map((p) => {
                    return {
                        id: p.id?.toString() ?? '',
                        user_id: p.user_id,
                        role_id: p.role_id,
                        name: p.name,
                        description: p.url,
                        category: p.category, 
                    };
                })
            : [],
        };
        setSelectedRole(mappedRole);
        setIsEditDialogOpen(true);
    };
    
    const handleEditRole = (updatedRole: Partial<Role>) => {
        if (!selectedRole) return;
        setIsEditDialogOpen(false);
        handleGetRoles();
    };

    const openDeleteDialog = (role: TRoles) => {
        setDelRole(role);
        setIsDeleteDialogOpen(true);
    };

    // count role by name
    const userCountByRoleId: Record<number, number> = {};
    dataRoles.forEach(role => {
        userCountByRoleId[role.id] = 0;
    });
    dataUsers.forEach(user => {
        if (userCountByRoleId[user.role] !== undefined) {
            userCountByRoleId[user.role]++;
        }
    });
    const userCountByRoleName: Record<string, number> = {};
    dataRoles.forEach(role => {
        if (role.role_name.toLowerCase() !== "admin") {
            userCountByRoleName[role.role_name] = userCountByRoleId[role.id] || 0;
        }
    });

    const countRoleByName = (name: string): number => {
        return userCountByRoleName[name] || 0;
    };

    return (
        <main> 
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Role Management</h2>
                        <p className="text-muted-foreground">
                            Create and manage user roles and permissions
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <Button
                            onClick={() => {
                            if (dataClient?.[0].limited_user === "1") {
                                toast.error("You cannot create role. Limit reached.");
                                return;
                            }
                            setIsCreateDialogOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Role
                        </Button>

                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>
                                Define a new role with specific permissions
                            </DialogDescription>
                            </DialogHeader>
                            <RoleForm onSubmit={handleCreateRole} />
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data.slice(0,3).map((role) => (
                        <Card key={role.id} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                                    <CardTitle className="text-lg">{role.role_name.trim()}</CardTitle>
                                </div>
                                <CardDescription>{role.description}</CardDescription>
                            </CardHeader>
                            <CardContent>   
                                <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    {role.role_name.toLowerCase() !== "admin" && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {countRoleByName(role.role_name)} users
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Shield className="h-4 w-4" />
                                    {role._count.permissions || 0} permissions
                                </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(role)} className="flex-1">
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button disabled={ role.role_name.toLowerCase() === "admin" || countRoleByName(role.role_name) > 0 }
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openDeleteDialog(role)}
                                        className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

            {/* Roles Table */}
            <Card>
                <CardHeader>
                <CardTitle>All Roles</CardTitle>
                <CardDescription>
                    Complete list of system roles
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {data.map((role) => (
                        <TableRow key={role.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div  className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                                <span className="font-medium">{role.role_name}</span>
                            </div>
                        </TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                           <Badge variant="secondary">
                            {role.role_name.toLowerCase() === "admin"
                                ? "admin"
                                : `${countRoleByName(role.role_name)} users`}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">
                            {role._count.permissions || 0} permissions
                            </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {new Date(role.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(role)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm"
                                onClick={() => openDeleteDialog(role)}
                                className="text-destructive hover:text-destructive"
                                disabled={ role.role_name.toLowerCase() === "admin" || countRoleByName(role.role_name) > 0 }>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

            {/* Edit Role Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Role</DialogTitle>
                    <DialogDescription>
                    Update role details and permissions
                    </DialogDescription>
                </DialogHeader>
                {selectedRole && (
                    <RoleForm
                        initialData={selectedRole}
                        onSubmit={handleEditRole}
                    />
                )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
           <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={() => {
                    if (delRole?.id) {
                        handleDeleteRole(delRole.id);
                    }
                }}
                title="Delete Role"
                description={`Are you sure you want to delete the role "${delRole?.role_name}"? This action cannot be undone.`}
                confirmText="Delete Role"
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