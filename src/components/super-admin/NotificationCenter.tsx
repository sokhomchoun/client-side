
import React, { useState } from 'react';
import { Bell, Send, Users, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'billing' | 'system' | 'feature' | 'general';
  subject: string;
  message: string;
}

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
}

export const NotificationCenter: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [notificationType, setNotificationType] = useState<string>('general');

  const templates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Payment Overdue',
      type: 'billing',
      subject: 'Payment Required - Account Suspension Notice',
      message: 'Your account payment is overdue. Please contact our sales team to resolve this issue and prevent account suspension.'
    },
    {
      id: '2',
      name: 'System Maintenance',
      type: 'system',
      subject: 'Scheduled System Maintenance',
      message: 'We will be performing scheduled maintenance on our systems. During this time, you may experience brief service interruptions.'
    },
    {
      id: '3',
      name: 'Feature Limit Warning',
      type: 'feature',
      subject: 'Feature Limit Warning',
      message: 'You are approaching your account limits. Consider upgrading your plan to continue enjoying all features.'
    }
  ];

  const clients: Client[] = [
    { id: '1', name: 'John Smith', company: 'Acme Corp', email: 'john@acmecorp.com', status: 'active' },
    { id: '2', name: 'Sarah Johnson', company: 'TechStart Inc', email: 'sarah@techstart.io', status: 'overdue' },
    { id: '3', name: 'Mike Wilson', company: 'Big Business LLC', email: 'mike@bigbusiness.com', status: 'active' }
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCustomSubject(template.subject);
      setCustomMessage(template.message);
      setNotificationType(template.type);
    }
  };

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    setSelectedClients(clients.map(c => c.id));
  };

  const handleSelectNone = () => {
    setSelectedClients([]);
  };

  const handleSendNotification = () => {
    if (!customSubject || !customMessage || selectedClients.length === 0) {
      alert('Please fill in all fields and select at least one client');
      return;
    }

    console.log('Sending notification:', {
      subject: customSubject,
      message: customMessage,
      type: notificationType,
      clients: selectedClients
    });

    // Reset form
    setCustomSubject('');
    setCustomMessage('');
    setSelectedClients([]);
    setSelectedTemplate('');
    alert(`Notification sent to ${selectedClients.length} client(s)`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'billing':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'system':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'feature':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      billing: 'bg-red-500',
      system: 'bg-blue-500',
      feature: 'bg-yellow-500',
      general: 'bg-gray-500'
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </CardTitle>
          <CardDescription>
            Send notifications to clients about billing, system updates, or general information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Notification Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or create custom" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        {template.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Enter notification subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Recipients
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleSelectNone}>
                Select None
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Choose which clients should receive this notification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={`client-${client.id}`}
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={() => handleClientToggle(client.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={`client-${client.id}`} className="font-medium cursor-pointer">
                        {client.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{client.company}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                    <Badge variant={client.status === 'active' ? 'default' : 'destructive'}>
                      {client.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {selectedClients.length} client(s) selected
            </p>
            <Button onClick={handleSendNotification} disabled={selectedClients.length === 0}>
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            History of sent notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium">Payment Overdue Notice</p>
                  <p className="text-sm text-muted-foreground">Sent to 3 clients • 2 hours ago</p>
                </div>
              </div>
              {getTypeBadge('billing')}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">System Maintenance Notice</p>
                  <p className="text-sm text-muted-foreground">Sent to all clients • 1 day ago</p>
                </div>
              </div>
              {getTypeBadge('system')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
