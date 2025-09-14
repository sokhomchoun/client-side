import { DEFAULT_PERMISSIONS } from '@/types/roles';
import { Permission } from '@/types/roles';

export const MOCK_PERMISSIONS: Permission[] = DEFAULT_PERMISSIONS.map((perm, index) => ({
    ...perm,
    id: (index + 1).toString(),
    
}));