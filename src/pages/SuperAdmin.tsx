
import React, { useState } from 'react';
import { Shield, Users, Bell, Settings, Database, HardDrive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientList } from '@/components/super-admin/ClientList';
import { ClientPortalAccess } from '@/components/super-admin/ClientPortalAccess';
import { BillingManagement } from '@/components/super-admin/BillingManagement';
import { FeatureLimits } from '@/components/super-admin/FeatureLimits';
import { NotificationCenter } from '@/components/super-admin/NotificationCenter';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { LoadingComponent } from '@/components/LoadingComponent';
import { AuthLoadingComponent } from '@/components/AuthLoadingComponent';

const SuperAdmin = () => {

    const { 
        dataClient,
        loading,
        handleBlockAccess,
        handleUpGradeToPro,
        handleSaveLimits,
        editingLimits,
        setEditingLimits,
        handleSearchClient,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        totalCount,
        totals,
        blockLoading

    } = useSuperAdmin();

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedClient, setSelectedClient] = useState<string | null>(null);

    return (
        <main>
            <LoadingComponent isActive={loading} />
            <AuthLoadingComponent isActive={blockLoading} />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage all client portals, billing, and system configurations
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="clients">Clients</TabsTrigger>
                        <TabsTrigger value="portal">Portal Access</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                        <TabsTrigger value="limits">Feature Limits</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totals?.totalClients ?? 0}</div>   
                                    <p className="text-xs text-muted-foreground">
                                        +3 from last month
                                    </p>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                                    <div className="h-4 w-4 bg-green-500 rounded-full" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totals?.activeClients ?? 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {Math.round((totals?.activeClients / totals?.totalClients) * 100)}% of total
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Unpaid Clients</CardTitle>
                                    <div className="h-4 w-4 bg-red-500 rounded-full" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totals?.unpaidClients ?? 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Require attention
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        $ {totals?.monthlyRevenue?._sum?.amount ?? 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        +12% from last month
                                    </p>
                                </CardContent>

                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="clients">
                        <ClientList 
                            handleSearchClient={handleSearchClient}
                            onSelectClient={setSelectedClient} 
                            dataClient={dataClient}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalCount={totalCount}
                        />
                    </TabsContent>

                    <TabsContent value="portal">
                        <ClientPortalAccess selectedClient={selectedClient} />
                    </TabsContent>

                    <TabsContent value="billing">
                        <BillingManagement 
                            dataClient={dataClient} 
                            handleBlockAccess={handleBlockAccess} 
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalCount={totalCount}
                            totals={totals}
                        />
                    </TabsContent>

                    <TabsContent value="limits">
                        <FeatureLimits 
                            handleUpGradeToPro={handleUpGradeToPro} 
                            dataClient={dataClient} 
                            handleSaveLimits={handleSaveLimits} 
                            editingLimits={editingLimits}
                            setEditingLimits={setEditingLimits}
                            selectedClient={selectedClient}
                            setSelectedClient={setSelectedClient}
                            handleSearchClient={handleSearchClient}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalCount={totalCount}
                        />
                    </TabsContent>

                    <TabsContent value="notifications">
                        <NotificationCenter />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    
    );
};

export default SuperAdmin;
