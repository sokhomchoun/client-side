import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, User, Shield, CreditCard, Clock, History, LogOut, DollarSign, Settings as SettingsIcon, Mail, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

const Settings = () => {
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();

    // Settings state
    const [userType, setUserType] = useState("admin");
    const { currency, setCurrency } = useCurrency();

    const [timezone, setTimezone] = useState("UTC+7");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [dataExport, setDataExport] = useState(true);

    // Security settings state
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorEmail, setTwoFactorEmail] = useState(user?.email || "");
    const [isEnabling2FA, setIsEnabling2FA] = useState(false);


  // Mock data for demonstration
    const userTypes = [{
        value: "admin",
        label: "Administrator"
    }, {
        value: "manager",
        label: "Manager"
    }, {
        value: "user",
        label: "Standard User"
    }, {
        value: "viewer",
        label: "Viewer Only"
    }];
    const currencies = [{
        value: "USD",
        label: "USD ($)",
        rate: 1
    }, {
        value: "KHR",
        label: "Khmer Riel (៛)",
        rate: 4000
    }];
    const timezones = [{
        value: "UTC+7",
        label: "Cambodia/Phnom Penh (UTC+7)"
    }, {
        value: "UTC+0",
        label: "UTC/GMT"
    }, {
        value: "UTC-5",
        label: "US Eastern (UTC-5)"
    }, {
        value: "UTC-8",
        label: "US Pacific (UTC-8)"
    }];
    const activityLogs = [{
        date: "2024-01-15",
        action: "Login",
        details: "Successful login from Chrome browser"
    }, {
        date: "2024-01-14",
        action: "Profile Update",
        details: "Updated profile information"
    }, {
        date: "2024-01-13",
        action: "Settings Change",
        details: "Changed language preference"
    }, {
        date: "2024-01-12",
        action: "Export Data",
        details: "Exported deal data to CSV"
    }];
  
    const handleLogout = () => {
        logout();
        navigate("/auth");
    };

    const handleEnable2FA = async () => {
        if (!twoFactorEmail) {
        toast({ title: "Error", description: "Please enter a valid email address for 2FA", variant: "destructive",});
            return;
        }
        setIsEnabling2FA(true);
        try {
            // Simulate API call to enable 2FA
            await new Promise(resolve => setTimeout(resolve, 2000));
            setTwoFactorEnabled(true);
            toast({ title: "2FA Enabled", description: `Two-factor authentication has been enabled for ${twoFactorEmail}`,});
        } catch (error) {
            toast({ title: "Error", description: "Failed to enable 2FA. Please try again.", variant: "destructive",});
        } finally {
            setIsEnabling2FA(false);
        }
    };

    const handleDisable2FA = () => {
        setTwoFactorEnabled(false);
        toast({ title: "2FA Disabled", description: "Two-factor authentication has been disabled",});
    };

    if (!user) {
        navigate("/auth");
        return null;
    }

    return <div className="container max-w-6xl py-10">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <SettingsIcon className="h-8 w-8" />
                    Settings
                </h1>
                <p className="text-muted-foreground mt-2">Manage your application preferences and account settings</p>
            </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                {/* <TabsTrigger value="billing">Billing</TabsTrigger> */}
                <TabsTrigger value="currency">Currency</TabsTrigger>
                <TabsTrigger value="timezone">Timezone</TabsTrigger>
                {/* <TabsTrigger value="history">History</TabsTrigger> */}
            </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Language & Localization
                    </CardTitle>
                    <CardDescription>
                        Configure your language preferences and regional settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Application Language</Label>
                            <div className="text-sm text-muted-foreground">
                                Choose your preferred language for the interface
                            </div>
                        </div>
                            <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="kh">ខ្មែរ (Khmer)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                        Manage how you receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <div className="text-sm text-muted-foreground">
                                Receive updates via email
                            </div>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Push Notifications</Label>
                            <div className="text-sm text-muted-foreground">
                                Receive browser push notifications
                            </div>
                        </div>
                        <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                        Add an extra layer of security to your account with email-based 2FA
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Enable 2FA</Label>
                            <div className="text-sm text-muted-foreground">
                                Secure your account with two-factor authentication
                            </div>
                        </div>
                        <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                            {twoFactorEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                    </div>
                {!twoFactorEnabled ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="2fa-email">Email Address for 2FA</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="2fa-email"
                                        type="email"
                                        placeholder="Enter email for 2FA codes"
                                        value={twoFactorEmail}
                                        onChange={(e) => setTwoFactorEmail(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={handleEnable2FA} disabled={isEnabling2FA || !twoFactorEmail}>
                                    {isEnabling2FA ? "Enabling..." : "Enable 2FA"}
                                </Button>
                            </div>
                        </div>
                    <div className="text-sm text-muted-foreground">
                        You'll receive a verification code via email whenever you sign in
                    </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <Key className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-800">
                                2FA is enabled for {twoFactorEmail}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleDisable2FA}>
                                Disable 2FA
                            </Button>
                            <Button variant="outline">
                                Change Email
                            </Button>
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security Information</CardTitle>
                    <CardDescription>
                        Important security details about your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Last Login</Label>
                            <p className="text-sm">January 15, 2024 at 2:30 PM</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Login Location</Label>
                            <p className="text-sm">Phnom Penh, Cambodia</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label>Active Sessions</Label>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 border rounded">
                                <div>
                                    <span className="text-sm font-medium">Current Session</span>
                                    <p className="text-xs text-muted-foreground">Chrome on Windows • This device</p>
                                </div>
                                <Badge variant="outline">Active</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* User Type & Permissions */}
        <TabsContent value="permissions" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        User Type & Role
                    </CardTitle>
                    <CardDescription>
                        Your current user role and permissions within the application
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Current User Type</Label>
                        <div className="text-sm text-muted-foreground">
                            Your access level in the system
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        {userTypes.find(type => type.value === userType)?.label}
                    </Badge>
                </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Billing & Invoices */}
        <TabsContent value="billing" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Billing Information
                    </CardTitle>
                    <CardDescription>
                        Manage your subscription and payment details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label>Current Plan</Label>
                        <div>
                            <Badge variant="default">Professional Plan</Badge>
                        </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Next Billing Date</Label>
                            <p className="text-sm">February 15, 2024</p>
                        </div>
                    </div>
                <Separator />
                <div className="space-y-2">
                    <Label>Recent Invoices</Label>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 border rounded">
                            <span className="text-sm">Invoice #INV-2024-001</span>
                            <span className="text-sm text-muted-foreground">$29.99 - Paid</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                            <span className="text-sm">Invoice #INV-2023-012</span>
                            <span className="text-sm text-muted-foreground">$29.99 - Paid</span>
                        </div>
                    </div>
                </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Currency Preferences
                    </CardTitle>
                    <CardDescription>
                        Configure your preferred currency for displaying amounts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Display Currency</Label>
                            <div className="text-sm text-muted-foreground">
                                All monetary values will be shown in this currency
                            </div>
                        </div>
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="w-60">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map(curr => (
                                    <SelectItem key={curr.value} value={curr.value}>
                                        {curr.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label>Exchange Rate Information</Label>
                        <div className="text-sm text-muted-foreground">
                            Current rate: 1 USD = 4,000 KHR
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Rates are updated daily and may vary
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>


        {/* Timezone Settings */}
        <TabsContent value="timezone" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Timezone Settings
                    </CardTitle>
                    <CardDescription>
                        Configure your timezone for accurate date and time display
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Your Timezone</Label>
                        <div className="text-sm text-muted-foreground">
                            All dates and times will be displayed in this timezone
                        </div>
                    </div>
                    <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="w-80">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {timezones.map(tz => <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
                            </SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                    <Label>Current Time</Label>
                    <div className="text-sm">
                        {new Date().toLocaleString('en-US', {
                        timeZone: timezone === 'UTC+7' ? 'Asia/Phnom_Penh' : 'UTC',
                        dateStyle: 'full',
                        timeStyle: 'long'
                        })}
                    </div>
                </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Activity History */}
        <TabsContent value="history" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Activity History & Logs
                    </CardTitle>
                    <CardDescription>
                        View your recent activity and system logs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {activityLogs.map((log, index) => <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                            <div className="font-medium">{log.action}</div>
                            <div className="text-sm text-muted-foreground">{log.details}</div>
                        </div>
                            <div className="text-sm text-muted-foreground">
                            {log.date}
                        </div>
                    </div>)}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        Showing last 4 activities
                    </span>
                    <Button variant="outline" size="sm">
                        View All History
                    </Button>
                </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Settings;
