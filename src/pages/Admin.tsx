
import React, { useState } from 'react';
import { Shield, Users, UserPlus, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RoleManagement } from '@/components/admin/RoleManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { LoadingComponent } from '@/components/LoadingComponent';
import { usePermission } from '@/hooks/usePermission';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from "react-i18next";

const Admin = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { t } = useTranslation();
    const { 
        dataRoles, 
        dataUsers, 
        data, 
        count, 
        loading,
        handleGetPermission,
        handleDeleteUser,
        currentPage,
        itemsPerPage,
        countPagination,
        setCurrentPage,
        handleGetRoles,
        handleDeleteRole,
        dataClient

    } = usePermission();

    // Mock stats
    const stats = {
        totalUsers: dataUsers.length,
        activeUsers: dataUsers.filter(user => user.status === 'active').length,
        pendingInvites: dataUsers.filter(user => user.status === 'pending').length,
        totalRoles: dataRoles.length
    };

    const getRoleDetails = (roleId: number) => {
        return data.find((role) => role.id === roleId);
    };

    const recentUserActivities = (dataUsers ?? []).slice().sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime()).slice(0, 5).map((user) => ({
        name: user.name,
        status: user.status,
        joinedAgo: formatDistanceToNow(new Date(user.joined), { addSuffix: true }),
    }));

    return (
        <main>
            {/* <LoadingComponent isActive={loading} /> */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Administration</h1>
                    <p className="text-muted-foreground">
                        Manage users, roles, and system permissions
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="roles">Roles</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{count}</div>
                                    <p className="text-xs text-muted-foreground">
                                    +2 from last month
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <div className="h-4 w-4 bg-green-500 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
                                </p>
                            </CardContent>
                            </Card>

                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingInvites}</div>
                                <p className="text-xs text-muted-foreground">
                                Awaiting acceptance
                                </p>
                            </CardContent>
                            </Card>

                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Roles</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalRoles}</div>
                                <p className="text-xs text-muted-foreground">
                                Custom roles configured
                                </p>
                            </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Recent Activity
                                    </CardTitle>
                                    <CardDescription>
                                        Latest user management activities
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentUserActivities.map((activity, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{activity.name} was {activity.status === 'pending' ? 'invited' : 'updated'}</p>
                                                <p className="text-sm text-muted-foreground">{activity.joinedAgo}</p>
                                            </div>
                                            <Badge variant={activity.status === 'pending' ? 'outline' : 'default'}>
                                                {activity.status === 'pending' ? 'Pending' : 'Updated'}
                                            </Badge>
                                        </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Permission Summary
                                </CardTitle>
                                    <CardDescription>
                                    Overview of role permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dataRoles.map((role) => {
                                        const roleDetails = getRoleDetails(role.id);
                                        const permissionCount = roleDetails?._count?.permissions || 0;
                                        const color = roleDetails?.color || '#ccc';
                                        return (
                                            <div key={role.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}/>
                                                    <span>{role.role_name}</span>
                                                </div>
                                                {role.role_name.toLowerCase() === 'admin' ? (
                                                    <Badge variant="destructive">Full Access</Badge>
                                                    ) : (
                                                    <Badge variant="default">{permissionCount} permissions</Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="users">
                        <UserManagement
                            dataUsers={dataUsers}
                            dataRoles={dataRoles}
                            handleGetPermission={handleGetPermission}
                            handleDeleteUser={handleDeleteUser}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            countPagination={countPagination}
                            setCurrentPage={setCurrentPage}
                            dataClient={dataClient}
                        />
                    </TabsContent>

                    <TabsContent value="roles">
                        <RoleManagement
                            dataClient={dataClient}
                            data={data}
                            handleGetRoles={handleGetRoles}
                            handleDeleteRole={handleDeleteRole}
                            dataRoles={dataRoles}
                            dataUsers={dataUsers}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </main>

    );
};

export default Admin;
