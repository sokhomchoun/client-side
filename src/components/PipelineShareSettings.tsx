import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, UserX, Globe, Lock, LockKeyhole } from "lucide-react";

export type PipelineUserPermission = "viewer" | "editor" | "admin";
export type PipelineUserAccess = {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    permission: PipelineUserPermission;
};

interface PipelineShareSettingsProps {
    pipelineId: string;
    pipelineName: string;
    isOpen: boolean;
    onClose: () => void;
    handleSaveSettings;
    handleSharingLevelChange;
    setSharing;
    sharing;
    onInviteUser;
    inviteForm;
    dataUserInvite;
    handleRemoveUser;
    handlePermissionChange;

}
const PipelineShareSettings = ({
    pipelineName,
    isOpen,
    onClose,
    handleSaveSettings,
    handleSharingLevelChange,
    setSharing,
    sharing,
    onInviteUser,
    inviteForm,
    dataUserInvite,
    handleRemoveUser,
    handlePermissionChange,
    
}: PipelineShareSettingsProps) => {

    const handleCheckboxChange = (field: "allowCopy" | "allowExport") => {
        setSharing(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
            <DialogHeader>
                <DialogTitle>Share Pipeline</DialogTitle>
                <DialogDescription>
                    Control who can access and edit "{pipelineName}"
                </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="sharing" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sharing">General Access</TabsTrigger>
                    <TabsTrigger value="users">User Permissions</TabsTrigger>
                </TabsList>
            
            {/* Sharing Tab */}
            <TabsContent value="sharing" className="space-y-4 pt-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <FormLabel>Access Level</FormLabel>
                        <div className="grid grid-cols-1 gap-2">
                            <Button type="button" variant={sharing.level === "private" ? "default" : "outline"} className={`justify-start text-left h-auto py-2 ${
                                sharing.level === "private" ? "text-white"  : "text-foreground" }`} onClick={() => handleSharingLevelChange("private")}>
                                <Lock className="h-4 w-4 mr-2" />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">Private</span>
                                    <span className={`text-xs ${sharing.level === "private" ? "text-white/80" : "text-muted-foreground"}`}>
                                        Only you can access this pipeline
                                    </span>
                                </div>
                            </Button>
                        
                            <Button type="button" variant={sharing.level === "team" ? "default" : "outline"} className={`justify-start text-left h-auto py-2 ${
                                sharing.level === "team" ? "text-white" : "text-foreground"}`} onClick={() => handleSharingLevelChange("team")}>
                                <Users className="h-4 w-4 mr-2" />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">Team</span>
                                    <span className={`text-xs ${ sharing.level === "team" ? "text-white/80" : "text-muted-foreground"}`}>
                                        Available to your team members
                                    </span>
                                </div>
                            </Button>
                        
                            <Button type="button" variant={sharing.level === "public" ? "default" : "outline"} className={`justify-start text-left h-auto py-2 ${
                                sharing.level === "public" ? "text-white" : "text-foreground"}`} onClick={() => handleSharingLevelChange("public")}>
                                <Globe className="h-4 w-4 mr-2" />
                                <div className="flex flex-col items-start">
                                <span className="font-medium">Public</span>
                                    <span className={`text-xs ${ sharing.level === "public" ? "text-white/80" : "text-muted-foreground"}`}>
                                        Anyone with the link can access
                                    </span>
                                </div>
                            </Button>
                        </div>
                    </div>

                </div>
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4 pt-4">
                {/* Invite Users Form */}
                <Form {...inviteForm}>
                    <form onSubmit={inviteForm.handleSubmit(onInviteUser)} className="space-y-4">
                        <FormField control={inviteForm.control} name="email" render={({ field }) => <FormItem>
                            <FormLabel>Add People</FormLabel>
                            <div className="flex space-x-2">
                                <FormControl>
                                <Input placeholder="Email address" {...field} />
                                </FormControl>
                                <FormField control={inviteForm.control} name="permission" render={({ field }) => 
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                                <SelectItem value="editor">Editor</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>} />
                                <Button type="submit">Invite</Button>
                            </div>
                            <FormDescription>
                                Enter an email to invite users to this pipeline.
                            </FormDescription>
                            </FormItem>} />
                    </form>
                </Form>
                
                {/* Current Users List */}
                {dataUserInvite && dataUserInvite.some(user => user.email !== "") && (
                    <div className="space-y-2">
                        <FormLabel>People with Access</FormLabel>

                        {dataUserInvite.length > 0 ? (
                            <div className="space-y-2 mt-2">
                                {dataUserInvite.map(element => (
                                <div key={element.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden">
                                            {element.userAvatar ? (
                                                <img src={element.userAvatar} alt={element.user?.name || 'User'} className="h-full w-full object-cover" />
                                                ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                                                    {element.user?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{element.user?.name || 'Unknown User'}</p>
                                            <p className="text-xs text-muted-foreground">{element.email || 'No email'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Created By: {element.users?.name || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                
                                    <div className="flex items-center space-x-2">
                                    <Select value={element.permission} onValueChange={(value: PipelineUserPermission) => handlePermissionChange(element.id, value)}>
                                        <SelectTrigger className="w-20 h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(element.id)}>
                                        <UserX className="h-4 w-4 text-destructive" />
                                    </Button>
                                    </div>
                                </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center border rounded-md">
                                <UserPlus className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No users have been added yet.</p>
                            </div>
                        )}
                    </div>
                )}

            </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSaveSettings}>Save Settings</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>;
};
export default PipelineShareSettings;
