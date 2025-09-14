
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Role, Permission, DEFAULT_PERMISSIONS, PERMISSION_CATEGORIES } from '@/types/roles';
import { usePermission } from '@/hooks/usePermission';

const roleSchema = z.object({
    id: z.string().optional(),
    isEditing: z.boolean().optional(),
    name: z.string().min(1, 'Role name is required').max(50, 'Role name too long'),
    description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    permissions: z.array(z.string()).default([])
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
    initialData?: Role;
    onSubmit: (data: Partial<Role>) => void;
    onSuccess?: () => void;
}

// Mock permissions for demonstration
const MOCK_PERMISSIONS: Permission[] = DEFAULT_PERMISSIONS.map((perm, index) => ({
    ...perm,
    id: (index + 1).toString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
}));

const ROLE_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#6b7280', '#374151', '#111827'
];

export const RoleForm: React.FC<RoleFormProps> = ({ initialData, onSubmit, onSuccess }) => {

    const { handleSubmit } = usePermission();

    const getInitialPermissionIds = () => {
        if (!initialData?.permissions) return [];
        return initialData.permissions.map(p => {
            const name = typeof p === 'string' ? p : p.name;
            const matched = MOCK_PERMISSIONS.find(mp => mp.name === name);
            return matched?.id ?? '';
        }).filter(Boolean);
    };

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            isEditing: initialData?.isEditing,
            id: initialData?.id || '',
            name: initialData?.name || '',
            description: initialData?.description || '',
            color: initialData?.color || '#6b7280',
            permissions: getInitialPermissionIds() || (initialData?.permissions || []).map(p =>
                typeof p === 'string' ? p : p?.id?.toString?.() ?? ''
            )
        }
    });

    const selectedPermissions = form.watch('permissions');

    const togglePermission = (permissionId: string) => {
        const current = selectedPermissions;
        const updated = current.includes(permissionId)
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId];
        
        form.setValue('permissions', updated);
    };

    const toggleCategoryPermissions = (category: string) => {
        const categoryPermissions = MOCK_PERMISSIONS.filter(p => p.category === category).map(p => p.id);
        const allSelected = categoryPermissions.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            // Remove all category permissions
            const updated = selectedPermissions.filter(id => 
                !categoryPermissions.includes(id)
            );
            form.setValue('permissions', updated);
        } else {
            // Add all category permissions
            const updated = [...new Set([...selectedPermissions, ...categoryPermissions])];
            form.setValue('permissions', updated);
        }
    };

    const onSubmitHandler = async (data: RoleFormValues) => {
        const isEditing = data.isEditing ?? false;
        await handleSubmit({
                id: data.id || '',
                name: data.name,
                description: data.description,
                color: data.color,  
                permissions: data.permissions,
            }, () => {
                if (onSuccess) onSuccess();
                onSubmit({
                    id: data.id || '',
                    name: data.name,
                    description: data.description,
                    color: data.color,
                    permissions: MOCK_PERMISSIONS.filter(p => data.permissions.includes(p.id)),
                });
            },
            isEditing
        );
    };
    const groupedPermissions = Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => ({
        category,
        permissions: MOCK_PERMISSIONS.filter(p => p.category === category)
    }));

    return (
        <main>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Sales Manager" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role Color</FormLabel>
                                <div className="space-y-2">
                                    <FormControl>
                                        <Input type="color" {...field} className="h-10 w-20" />
                                    </FormControl>
                                    <div className="flex flex-wrap gap-2">
                                        {ROLE_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: color }}
                                                onClick={() => form.setValue('color', color)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Describe the role and its responsibilities..."
                                        className="resize-none"
                                        rows={3}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div>
                        <h3 className="text-lg font-medium mb-4">Permissions</h3>
                        <div className="space-y-4">
                            {groupedPermissions.map(({ category, permissions }) => {
                            const categoryPermissionIds = permissions.map(p => p.id);
                            const selectedInCategory = categoryPermissionIds.filter(id => selectedPermissions.includes(id)).length;
                            const allSelected = selectedInCategory === permissions.length;
                            const someSelected = selectedInCategory > 0 && selectedInCategory < permissions.length;
                            
                            return (
                                <Card key={category}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">{category}</CardTitle>
                                            <CardDescription>
                                            {selectedInCategory} of {permissions.length} permissions selected
                                            </CardDescription>
                                        </div>
                                        <CategoryCheckbox
                                            checked={allSelected}
                                            indeterminate={someSelected}
                                            onCheckedChange={() => toggleCategoryPermissions(category)}
                                        />
                                    </div>
                                </CardHeader>
                                
                                {permissions.length > 0 && (
                                    <CardContent className="pt-0">
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={permission.id}
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onCheckedChange={() => togglePermission(permission.id)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                <label
                                                    htmlFor={permission.id}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {permission.description}
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    {permission.name}
                                                </p>
                                                </div>
                                            </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                                </Card>
                            );
                            })}
                        </div>
                    </div>
                    <Separator />

                    <div className="flex justify-end gap-3">
                    <Button type="submit">
                        {initialData ? 'Update Role' : 'Create Role'}
                    </Button>
                    </div>
                </form>
            </Form>
        </main>
    );
};

const CategoryCheckbox: React.FC<{
    checked: boolean;
    indeterminate: boolean;
    onCheckedChange: () => void;
    }> = ({ checked, indeterminate, onCheckedChange }) => {
    const checkboxRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (checkboxRef.current) {
            const checkboxElement = checkboxRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
            if (checkboxElement) {
                checkboxElement.indeterminate = indeterminate;
            }
        }
    }, [indeterminate]);

    return (
        <Checkbox
            ref={checkboxRef}
            checked={checked}
            onCheckedChange={onCheckedChange}
        />
    );
};


