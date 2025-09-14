
import React from 'react';
import { ExternalLink, Shield, User, Settings, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClientPortalAccessProps {
  selectedClient: string | null;
}

export const ClientPortalAccess: React.FC<ClientPortalAccessProps> = ({ selectedClient }) => {
  if (!selectedClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Portal Access</CardTitle>
          <CardDescription>
            Select a client from the Clients tab to access their portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Please select a client to access their portal with full administrative privileges.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Mock client data based on selected client
  const clientData = {
    name: 'Acme Corp',
    plan: 'Premium',
    status: 'active',
    lastAccess: '2 hours ago'
  };

  const handleAccessPortal = (section: string) => {
    console.log(`Accessing ${section} for client ${selectedClient}`);
    // Implementation would redirect to client portal with admin privileges
  };

  const portalSections = [
    { id: 'deals', name: 'Deals Management', icon: Database, description: 'Access and manage client deals' },
    { id: 'contacts', name: 'Contacts', icon: User, description: 'View and edit client contacts' },
    { id: 'settings', name: 'Settings', icon: Settings, description: 'Modify client configuration' },
    { id: 'admin', name: 'User Management', icon: Shield, description: 'Manage client users and roles' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Client Portal Access
        </CardTitle>
        <CardDescription>
          Access {clientData.name}'s portal with full administrative privileges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">{clientData.name}</h3>
            <p className="text-sm text-muted-foreground">Last access: {clientData.lastAccess}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{clientData.plan}</Badge>
            <Badge variant="default">{clientData.status}</Badge>
          </div>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You are accessing this portal as Super Admin with full privileges. All actions will be logged.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          {portalSections.map((section) => (
            <Card key={section.id} className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <section.icon className="h-4 w-4" />
                  {section.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => handleAccessPortal(section.id)}
                  className="w-full"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Access {section.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
