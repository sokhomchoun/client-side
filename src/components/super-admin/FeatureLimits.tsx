
import React, { useState } from 'react';
import { Users, HardDrive, Save, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Shield, Ban, CheckCircle } from 'lucide-react';
import { TClient } from '@/types';
import { Pagination } from '../Pagination';

interface ClientListProps {
    dataClient: TClient[];
    handleUpGradeToPro;
    handleSaveLimits: (editingLimits: TClient) => void;
    editingLimits: {
        id: number | null;
        contactsLimit: string;
        storageLimit: string;
        amount?: number;
    };
    setEditingLimits: React.Dispatch<React.SetStateAction<{
        id: number | null;
        contactsLimit: string;
        storageLimit: string;
    }>>;
    selectedClient: string;
    setSelectedClient: React.Dispatch<React.SetStateAction<string>>;
    handleSearchClient
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalCount: number;
}

export const FeatureLimits: React.FC<ClientListProps> = ({ 
    handleSaveLimits, 
    handleUpGradeToPro, 
    dataClient, 
    editingLimits, 
    setEditingLimits,
    handleSearchClient,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalCount,
}) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<string>('');

    const handleClientSelect = (clientId: string) => {
        setSelectedClient(clientId);
        const client = dataClient.find(c => c.id === Number(clientId));
        if (client) {
            setEditingLimits({
                id: client.id,
                contactsLimit: client.limited_contact ?? '',
                storageLimit: client.limited_storage?.toString() ?? ''
            });
        }
    };
    
    const getUsageColor = (used: number, limit: number) => {
        const percentage = (used / limit) * 100;
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getContactsPercentage = (used: number, limit: number) => {
        return Math.min((used / limit) * 100, 100);
    };

    const getStoragePercentage = (used: number, limit: number) => {
        return Math.min((used / limit) * 100, 100);
    };

    const hanldeCustomStorage = async (clientId: number) => {
        setSelectedClient(clientId.toString());
        const client = dataClient.find(c => c.id === Number(clientId));
        if (client) {
            setEditingLimits({
                id: client.id,
                contactsLimit: client.limited_contact ?? '',
                storageLimit: client.limited_storage?.toString() ?? ''
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Feature Limits Management
                    </CardTitle>
                    <CardDescription>
                        Set and manage feature limits for client accounts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                        <Label htmlFor="client-select">Select Client</Label>
                        <Select value={selectedClient} onValueChange={handleClientSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a client to modify" />
                            </SelectTrigger>
                            <SelectContent>
                                {dataClient.map((client) => (
                                    <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name} - {client.company}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>
                    </div>

                    {selectedClient && (
                        <div className="grid gap-4 md:grid-cols-2 p-4 border rounded-lg">
                        <div className="space-y-2">
                            <Label htmlFor="contacts-limit">Contacts Limit</Label>
                            {editingLimits.contactsLimit === "Unlimited" ? (
                                <Input 
                                disabled
                                    id="contacts-limit"
                                    type="text"
                                    value={editingLimits.contactsLimit}
                                    onChange={(e) =>
                                        setEditingLimits(prev => ({
                                            ...prev,
                                            contactsLimit: e.target.value,
                                        }))
                                    }
                                    placeholder="Currently Unlimited, enter new limit"
                                />
                            ) : (
                                <Input
                                    id="contacts-limit"
                                    type="text"
                                    value={editingLimits.contactsLimit}
                                    onChange={(e) =>
                                        setEditingLimits(prev => ({
                                            ...prev,
                                            contactsLimit: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter contacts limit"
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="storage-limit">Storage Limit (GB)</Label>
                            <Input
                                id="storage-limit"
                                type="text"
                                step="0.1"
                                value={editingLimits.storageLimit}
                                onChange={(e) => setEditingLimits(prev => ({ ...prev, storageLimit: e.target.value }))}
                                placeholder="Enter storage limit"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="storage-limit">Amount Per Month</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.1"
                                value={editingLimits.amount ?? ''}
                                onChange={(e) => setEditingLimits(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="Enter storage limit"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Button onClick={() => handleSaveLimits(editingLimits)} className="w-full">
                                <Save className="h-4 w-4 mr-2" />
                                Save Limits
                                </Button>
                        </div>
                        </div>
                    )}  
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Usage & Limits</CardTitle>
                    <CardDescription>
                        Monitor client usage against their limits
                    </CardDescription>
                     <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchClient(searchTerm);
                                }
                            }}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>   
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Contacts Usage</TableHead>
                            <TableHead>Storage Usage</TableHead>
                            <TableHead>Status</TableHead>
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
                            <TableCell>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">
                                            {client.client_usage?.length ? (
                                                client.client_usage.map((usage, index) => {
                                                    const contactUsed = parseInt(usage.contact_usage || '0');
                                                    const isUnlimited = client.limited_contact === 'Unlimited';
                                                    return (
                                                        <div key={index}>
                                                            {contactUsed.toLocaleString()} / {isUnlimited ? 'Unlimited' : Number(client.limited_contact).toLocaleString()}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div>{client.limited_contact === 'Unlimited' ? 'Unlimited' : Number(client.limited_contact || 0).toLocaleString()}</div>
                                            )}
                                        </span>
                                    </div>
                                    {/* Show progress bar always, adapt based on Unlimited or not */}
                                    {client.client_usage?.[0] && (
                                        <Progress
                                            value={
                                                client.limited_contact === 'Unlimited'
                                                    ? 100 // or undefined for indeterminate style
                                                    : getContactsPercentage(
                                                        parseInt(client.client_usage[0].contact_usage || '0'),
                                                        Number(client.limited_contact)
                                                    )
                                            }
                                            className="w-full"
                                        />
                                    )}

                                    {client.limited_contact === 'Unlimited' && (
                                        <span className="text-xs text-muted-foreground italic">Unlimited contacts</span>
                                    )}
                                </div>
                            </TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <HardDrive className="h-4 w-4" />
                                            <span className="text-sm">
                                                {parseFloat(client.client_usage?.[0]?.storage_usage || '0') < 0.01
                                                    ? '0.01'
                                                    : parseFloat(client.client_usage?.[0]?.storage_usage || '0').toFixed(2)
                                                } GB / {client.limited_storage} GB
                                            </span>
                                        </div>
                                        
                                        {/* Progress bar */}
                                        {client.limited_storage !== undefined && client.limited_storage !== 0 && (
                                            <Progress value={getStoragePercentage( parseFloat(client.client_usage?.[0]?.storage_usage || '0'),  client.limited_storage )}
                                                className="w-full"
                                            />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        const contactUsed = parseInt(client?.client_usage?.[0]?.contact_usage || '0');
                                        const storageUsed = parseFloat(client?.client_usage?.[0]?.storage_usage || '0');

                                        const contactLimit = client.limited_contact === 'Unlimited' ? null : Number(client.limited_contact || 0);
                                        const storageLimit = String(client.limited_storage) === 'Unlimited' ? null : Number(client.limited_storage || 0);

                                        const contactPercent = contactLimit ? getContactsPercentage(contactUsed, contactLimit) : 0;
                                        const storagePercent = storageLimit ? getStoragePercentage(storageUsed, storageLimit) : 0;

                                        if (contactPercent >= 90 || storagePercent >= 90) {
                                            return <Badge variant="destructive">Near Limit</Badge>;
                                        } else if (contactPercent >= 75 || storagePercent >= 75) {
                                            return <Badge variant="secondary">Warning</Badge>;
                                        } else {
                                            return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
                                        }
                                        
                                    })()}
                                </TableCell>
                             <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {client.plan?.toLowerCase() !== 'pro' && (
                                            <DropdownMenuItem onClick={() => handleUpGradeToPro(client.id)}>
                                                Upgrade to Pro
                                            </DropdownMenuItem>
                                        )}
                                        
                                        <DropdownMenuItem onClick={() => hanldeCustomStorage(client.id)}>
                                            Custom
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
