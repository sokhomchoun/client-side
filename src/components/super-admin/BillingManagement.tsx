
import React, { useState } from 'react';
import { CreditCard, AlertTriangle, CheckCircle, Ban, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TClient, TClientStats } from '@/types';
import { Pagination } from '../Pagination';

interface ClientListProps {
    dataClient: TClient[];
    handleBlockAccess,
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalCount: number;
    totals: TClientStats
}

export const BillingManagement: React.FC<ClientListProps> = ({ 
    handleBlockAccess, 
    dataClient,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalCount,
    totals
}) => {

    const getStatusBadge = (client: TClient) => {
        if (!client.due_date && !client.is_block) {
            return (
                <Badge className="!bg-blue-500 text-white">
                    Free
                </Badge>
            );
        }

        const status = client.status?.toLowerCase();
        const effectiveStatus = client.is_block ? 'suspended' : status;

        switch (effectiveStatus) {
            case 'active':
                return (
                    <Badge className="!bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />Paid
                    </Badge>
                );
            case 'unpaid':
                return (
                    <Badge className="!bg-red-500 text-white">
                        <Ban className="w-3 h-3 mr-1" />Overdue
                    </Badge>
                );
            case 'suspended':
                return (
                    <Badge className="!bg-gray-500 text-white">
                        <Shield className="w-3 h-3 mr-1" />Suspended
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };


    // const autoBlockEnabled = dataClient.filter(client => client.auto_block).length;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{totals.unpaidClients}</div>
                        <p className="text-xs text-muted-foreground">
                            Require immediate attention
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$ {totals?.monthlyRevenue?._sum?.amount ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Total recurring revenue
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auto-Block Enabled</CardTitle>
                        <Ban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                        {/* {clients.filter(c => c.autoBlock).length} */}
                        {/* {autoBlockEnabled} */}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Clients with auto-block
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Billing Management</CardTitle>
                    <CardDescription>
                        Manage client billing status and access control
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Auto-Block</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {dataClient.map((client) => (
                        <TableRow key={client.id}>
                        <TableCell>
                            <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatar.vercel.sh/${client.email}`} />
                                <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-muted-foreground">{client.company}</div>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{client.plan}</Badge>
                        </TableCell>
                        <TableCell>$ {client.amount}/mo</TableCell>
                        <TableCell>{getStatusBadge(client)}</TableCell>

                        <TableCell className="text-sm">
                            { client.due_date ? new Date(client.due_date).toLocaleDateString() : 'N/A' }
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center space-x-2">
                            <Switch
                                id={`auto-block-${client.id}`}
                                checked={client.auto_block}
                                // onCheckedChange={() => handleToggleAutoBlock(client.id)}
                            />
                            <Label htmlFor={`auto-block-${client.id}`} className="text-sm">
                                {client.auto_block ? 'On' : 'Off'}
                            </Label>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                {client.is_block ? (
                                    <Button size="sm" variant="outline" onClick={() => handleBlockAccess(client.id)}>
                                        Unblock
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="destructive" onClick={() => handleBlockAccess(client.id)}>
                                        Block
                                    </Button>
                                )}
                            </div>
                        </TableCell>

                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            {/* Pagination  */}
            <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
};
