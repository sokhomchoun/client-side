
import React, { useState } from 'react';
import { Search, MoreHorizontal, Shield, Ban, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TClient } from '@/types';
import { Pagination } from '../Pagination';

interface ClientListProps {
    onSelectClient: (clientId: string) => void;
    dataClient: TClient[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalCount: number;
    handleSearchClient
}

export const ClientList: React.FC<ClientListProps> = ({ 
    onSelectClient, 
    dataClient,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalCount,
    handleSearchClient

}) => {
    const [searchTerm, setSearchTerm] = useState('');
      const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [subClientData, setSubClientData] = useState<Record<string, TClient[]>>({});

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            return (
                <Badge className="!bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />Active
                </Badge>
            );  
            case 'unpaid':
            return (
                <Badge className="!bg-red-500 text-white">
                <Ban className="w-3 h-3 mr-1" />Unpaid
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

    const handleAccessPortal = (clientId: number) => {
        console.log(`Accessing portal for client: ${clientId}`);
        // onSelectClient(clientId);
    };

    const handleSuspendClient = (clientId: number) => {
        console.log(`Suspending client: ${clientId}`);
        // Implementation would update client status
    };

    const handleBlockAccess = (clientId: number) => {
        console.log(`Blocking access for client: ${clientId}`);
        // Implementation would block client access
    };

    const handleToggleSubClients = async (clientId: string) => {
        if (expandedClientId === clientId) {
            setExpandedClientId(null);
        } else {
            setExpandedClientId(clientId);
            if (!subClientData[clientId]) {
                setSubClientData(prev => ({ ...prev}));
            }
        }
    };


    return (
        <main>
            <Card>
                <CardHeader>
                    <CardTitle>Client Management</CardTitle>
                    <CardDescription>
                    Manage all client accounts and access their portals
                    </CardDescription>
                    <div className="flex items-center space-x-2">
                    {/* <Search className="w-4 h-4 text-muted-foreground" /> */}
                    <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchClient(searchTerm);
                            }
                        }}
                    />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Contacts</TableHead>
                            <TableHead>Storage (GB)</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dataClient.map((client) => (
                            <React.Fragment key={client.id}>
                            {/* Parent Client Row */}
                            <TableRow>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://avatar.vercel.sh/${client.user?.[0].email}`} />
                                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{client.name}</div>
                                            <div className="text-sm text-muted-foreground">{client.company}</div>
                                            <div className="text-xs text-muted-foreground">{client.user?.[0].email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(client.status)}</TableCell>
                                <TableCell>{client.phone_number}</TableCell>
                                <TableCell><Badge variant="outline">{client.plan}</Badge></TableCell>
                                <TableCell>{client.limited_contact.toLocaleString()}</TableCell>
                                <TableCell>{client.limited_storage}</TableCell>
                                <TableCell>$ {client.revenue}/mo</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {client.user?.[0]?.last_login ? new Date(client.user?.[0]?.last_login).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {client.sub_clients.length > 0 && (
                                            <DropdownMenuItem onClick={() => handleToggleSubClients(client.id.toString())}>
                                                <Users className="w-4 h-4 mr-2" />
                                                Sub Clients
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => handleAccessPortal(client.id)}>
                                            Access Portal
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSuspendClient(client.id)}>
                                            Suspend Account
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleBlockAccess(client.id)}>
                                            Block Access
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>

                        {/* Sub Clients Rows */}
                        {expandedClientId === client.id.toString() && client.sub_clients && (
                            client.sub_clients.map((sub, index) => {
                                return (
                                    <TableRow key={`sub-${client.id}-${sub.email}`} className="bg-muted/50">
                                        <TableCell className="pl-12">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarImage src={`https://avatar.vercel.sh/${sub.email}`} />
                                                    <AvatarFallback>{sub.email[0]?.toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{sub.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                                            <TableCell><Badge variant="outline">{client.plan}</Badge></TableCell>
                                            <TableCell>{client.limited_contact.toLocaleString()}</TableCell>
                                        <TableCell>{client.limited_storage}</TableCell>
                                        <TableCell>$ 0/mo</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {client.user?.[0]?.last_login ? new Date(client.user?.[0]?.last_login).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">Sub-Client</span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                        </React.Fragment>
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
        </main>        
    );
};
