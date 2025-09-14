
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TUsers, TRoles } from '@/types';
import { usePermission } from '@/hooks/usePermission';

const editUserSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Please enter a valid email address'),
    role: z.string().min(1, 'Please select a role'),
    status: z.string(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;
interface UserEditFormProps {
    user: TUsers;
    roles: TRoles[];
    onSubmit: (data: Partial<TUsers>) => void;
}

export const UserEditForm: React.FC<UserEditFormProps> = ({ user, roles, onSubmit }) => {

    const { handleSubmitEditUser } = usePermission();
    
    const form = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status.toLowerCase(),
        }
    });

    const onFormSubmit = async (data: EditUserFormValues) => {
        await handleSubmitEditUser(data as TUsers);
        onSubmit(data as TUsers);
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="user@example.com" {...field} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                            </FormControl>
                           <SelectContent>
                            {roles.filter((role) => role.role_name.toLowerCase() !== "admin").map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                    <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
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
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-3 pt-4">
                <Button type="submit">
                    Update User
                </Button>
                </div>
            </form>
        </Form>
    );
};
