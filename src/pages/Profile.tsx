
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Mail, User, Building, Lock, Settings as SettingsIcon, FileText, Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "@/components/ui/sonner";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
    const navigate = useNavigate();

    const { 
        onProfileSubmit,
        profileSchema,
        passwordSchema,
        profileForm,
        passwordForm,
        user,
        avatarUrl,
        setAvatarUrl,
        handleImageChange,
        onPasswordSubmit

    } = useProfile();

    // Update form values when user changes
    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.name,
                email: user.email,
                position: user.role || "",
                company: user.company || "",
                avatarUrl: user.avatarUrl || ""
            });
            setAvatarUrl(user.avatarUrl || "/profile-placeholder.jpg");
        }
    }, [user, profileForm]);

    if (!user) {
        navigate("/auth");
        return null;
    }

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase();
    };

    return (
        <div className="container max-w-6xl py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <User className="h-8 w-8" />
                    My Profile
                </h1>
                <p className="text-muted-foreground mt-2">Manage your account information and security settings</p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile Information</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="legal">Terms & Privacy</TabsTrigger>
                </TabsList>

                {/* Profile Information Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal information and profile picture
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Profile Picture Section */}
                                <div className="lg:w-1/3 flex flex-col items-center space-y-4">
                                    <Avatar className="h-32 w-32">
                                        <AvatarImage src={avatarUrl} alt={user.name} />
                                        <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold">{user.name}</h3>
                                        {user.position && <p className="text-sm text-muted-foreground">{user.position}</p>}
                                        {user.company && <p className="text-sm text-muted-foreground">{user.company}</p>}
                                    </div>
                                    <ImageUpload currentImage={avatarUrl} onImageChange={handleImageChange} />
                                </div>

                                {/* Profile Form Section */}
                                <div className="lg:w-2/3">
                                <Form {...profileForm}>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                    {/* <form className="space-y-6"> */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={profileForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-10" placeholder="John Doe" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            
                                            <FormField
                                                control={profileForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-10" placeholder="john@example.com" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                disabled
                                                control={profileForm.control}
                                                name="position"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Position</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-10" placeholder="Sales Manager" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            
                                            <FormField
                                                control={profileForm.control}
                                                name="company"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Company</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-10" placeholder="Acme Inc" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    
                                        <Button type="submit" className="w-full md:w-auto">
                                            Save Changes
                                        </Button>
                                    </form>
                                </Form>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                {/* <form className="space-y-6"> */}
                                <FormField
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => {
                                        const [showPassword, setShowPassword] = useState(false)
                                        return (
                                            <FormItem>
                                                <FormLabel>Current Password</FormLabel>
                                                <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input 
                                                        type={showPassword ? "text" : "password"}
                                                        className="pl-10" 
                                                        placeholder="Enter current password" 
                                                        {...field} 
                                                    />
                                                     <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                                        {showPassword ? (
                                                            <Eye className="h-5 w-5" />
                                                        ) : (
                                                            <EyeOff className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => {
                                            const [showPassword, setShowPassword] = useState(false)
                                            return (
                                                <FormItem>
                                                    <FormLabel>New Password</FormLabel>
                                                    <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input 
                                                            type={showPassword ? "text" : "password"}
                                                            className="pl-10" 
                                                            placeholder="Enter new password" 
                                                            {...field} 
                                                        />
                                                        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                                            {showPassword ? (
                                                                <Eye className="h-5 w-5" />
                                                            ) : (
                                                                <EyeOff className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )
                                        }}
                                    />
                                    
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => {
                                            const [showPassword, setShowPassword] = useState(false)
                                            return (
                                                <FormItem>
                                                    <FormLabel>Confirm New Password</FormLabel>
                                                    <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input 
                                                            type={showPassword ? "text" : "password"}
                                                            className="pl-10" 
                                                            placeholder="Confirm new password" 
                                                            {...field} 
                                                        />
                                                        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                                            {showPassword ? (
                                                                <Eye className="h-5 w-5" />
                                                            ) : (
                                                                <EyeOff className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )
                                        }}
                                    />
                                </div>
                                
                                <Button type="submit" className="w-full md:w-auto">
                                    Update Password
                                </Button>
                                </form>
                            </Form>
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
                                    <FormLabel>Last Login</FormLabel>
                                    <p className="text-sm text-muted-foreground">January 15, 2024 at 2:30 PM</p>
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>Login Location</FormLabel>
                                    <p className="text-sm text-muted-foreground">Phnom Penh, Cambodia</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Terms & Privacy Tab */}
                <TabsContent value="legal" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Terms of Service
                            </CardTitle>
                            <CardDescription>
                                Review our terms and conditions for using this platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground mb-4">
                                    By using this platform, you agree to comply with our terms of service. 
                                    Please review the full terms to understand your rights and responsibilities.
                                </p>
                                <Button variant="outline" asChild>
                                <a 
                                    href="https://sellmeapp.com/terms-conditions/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Terms of Service
                                </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Privacy Policy
                            </CardTitle>
                            <CardDescription>
                                Learn how we protect and handle your personal information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground mb-4">
                                    Your privacy is important to us. Our privacy policy explains how we collect, 
                                    use, and protect your personal information when you use our platform.
                                </p>
                                <Button variant="outline" asChild>
                                <a 
                                    href="https://sellmeapp.com/privacy-policy/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                >
                                    <Shield className="h-4 w-4" />
                                    View Privacy Policy
                                </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Platform Guidelines</CardTitle>
                        <CardDescription>
                            Important information about using our platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <FormLabel>Last Updated</FormLabel>
                                <p className="text-sm text-muted-foreground">September 04, 2025</p>
                            </div>
                            <div className="space-y-2">
                                <FormLabel>Version</FormLabel>
                                <p className="text-sm text-muted-foreground">1.0</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <FormLabel>Contact Support</FormLabel>
                            <p className="text-sm text-muted-foreground">
                                For privacy concerns, please contact us: Phnom Penh, Cambodia, contact us at{" "}
                                <a 
                                    href="mailto:info@mangrovestudio.net"
                                    className="text-primary hover:underline">
                                    info@mangrovestudio.net 
                                </a>
                                <span> Or</span>
                                <a className="text-primary hover:underline" href="https://t.me/Mangrove_Studio"> Telegram Support</a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Profile;
