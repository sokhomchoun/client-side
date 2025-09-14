
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermission } from '@/hooks/usePermission';

const inviteSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    password_hash: z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().min(1, 'Please select a role')
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface UserInviteFormProps {
    onSubmit: (data: InviteFormValues) => void;
    onSuccess?: () => void;
}

export const UserInviteForm: React.FC<UserInviteFormProps> = ({ onSubmit, onSuccess }) => {

    const { dataRoles, handleSubmitRoles } = usePermission();

    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: '',
            name: '',
            password_hash: '',
            role: ''
        }
    });

    const onSubmitHandler = async (data: InviteFormValues) => {
        await handleSubmitRoles({ 
                email: data.email,
                name: data.name,
                password_hash: data.password_hash,
                role: data.role

            }, () => {
                onSubmit(data);
                form.reset();  
                if (onSuccess) onSuccess();
            },
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input 
                                    type="email"
                                    placeholder="user@example.com" 
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="John Doe" 
                                    {...field} 
                                    />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="password_hash"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Password" 
                                    {...field} 
                                    />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {dataRoles.filter((role) => role.role_name.toLowerCase() !== 'admin').map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: role.color }}
                                    />
                                    <span>{role.role_name}</span>
                                </div>
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4">
                <Button type="submit">
                    Send Invitation
                </Button>
                </div>
            </form>
        </Form>
    );
};
