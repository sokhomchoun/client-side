
export interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
    url?: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    color: string;
    permissions: Permission[] | string[];
    isEditing: boolean,
}

export interface User {
    id: string;
    email: string;
    name: string;
    role_id: string;
    role: Role;
    status: 'active' | 'pending' | 'suspended';
    invited_at?: string;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
}

export interface UserInvitation {
    id: string;
    email: string;
    role_id: string;
    role: Role;
    invited_by: string;
    invited_by_user: User;
    status: 'pending' | 'accepted' | 'expired';
    expires_at: string;
    created_at: string;
}

export const PERMISSION_CATEGORIES = {
    PIPELINES: 'Pipeline Management',
    DEALS: 'Deals Management',
    CONTACTS: 'Contacts Management',
    TASKS: 'Tasks Management',
    PRODUCTS: 'Products Management',
    NOTES: 'Notes Management',
    LIBRARY: 'Library Management',
    // CHAT: 'Chat Management',
    ANALYTICS: 'Analytics & Reports',
    ADMIN: 'Administration',
    SETTINGS: 'Settings',
    PROFILE: 'Profiles',
    CONTACTARCHIVE: 'Contact Archive',
    PRODUCTARCHIVE: 'Product Archive'

} as const;

export const PERMISSION_URL = {
    PIPELINES: 'pipelines',
    DEALS: 'pipelines/deals',
    CONTACTS: 'pipelines/contacts',
    TASKS: 'pipelines/tasks',
    PRODUCTS: 'pipelines/products',
    PRODUCTSTRASH: 'pipelines/products-trash',
    NOTES: 'pipelines/notes',
    LIBRARY: 'library',
    CHAT: 'chat',
    ANALYTICS: 'pipelines/sales',
    ADMIN: 'admin',
    SETTINGS: 'settings',
    PROFILE: 'profile',
    CONTACTARCHIVE: 'pipelines/archive-contacts',
    PRODUCTARCHIVE: 'pipelines/archive-products'
}

export const DEFAULT_PERMISSIONS: Omit<Permission, 'id' | 'created_at' | 'updated_at'>[] = [

  // Pipeline Management
  { name: 'pipelines.view', description: 'View pipelines', category: PERMISSION_CATEGORIES.PIPELINES, url: PERMISSION_URL.PIPELINES },
  { name: 'pipelines.create', description: 'Create pipelines', category: PERMISSION_CATEGORIES.PIPELINES, url: PERMISSION_URL.PIPELINES },
  { name: 'pipelines.edit', description: 'Edit pipelines', category: PERMISSION_CATEGORIES.PIPELINES, url: PERMISSION_URL.PIPELINES },
  { name: 'pipelines.delete', description: 'Delete pipelines', category: PERMISSION_CATEGORIES.PIPELINES, url: PERMISSION_URL.PIPELINES },
  { name: 'pipelines.share', description: 'Share pipelines', category: PERMISSION_CATEGORIES.PIPELINES, url: PERMISSION_URL.PIPELINES },

  // Deals Management
  { name: 'deals.view', description: 'View deals', category: PERMISSION_CATEGORIES.DEALS, url: PERMISSION_URL.DEALS },
  { name: 'deals.create', description: 'Create deals', category: PERMISSION_CATEGORIES.DEALS, url: PERMISSION_URL.DEALS },
  { name: 'deals.edit', description: 'Edit deals', category: PERMISSION_CATEGORIES.DEALS, url: PERMISSION_URL.DEALS },
  { name: 'deals.delete', description: 'Delete deals', category: PERMISSION_CATEGORIES.DEALS, url: PERMISSION_URL.DEALS },
  { name: 'deals.export', description: 'Export deals', category: PERMISSION_CATEGORIES.DEALS, url: PERMISSION_URL.DEALS },
  { name: 'deals.import', description: 'Import deals', category: PERMISSION_CATEGORIES.DEALS, url: PERMISSION_URL.DEALS },
  
  // Contacts Management
  { name: 'contacts.view', description: 'View contacts', category: PERMISSION_CATEGORIES.CONTACTS, url: PERMISSION_URL.CONTACTS },
  { name: 'contacts.create', description: 'Create contacts', category: PERMISSION_CATEGORIES.CONTACTS, url: PERMISSION_URL.CONTACTS },
  { name: 'contacts.edit', description: 'Edit contacts', category: PERMISSION_CATEGORIES.CONTACTS, url: PERMISSION_URL.CONTACTS },
  { name: 'contacts.delete', description: 'Delete contacts', category: PERMISSION_CATEGORIES.CONTACTS, url: PERMISSION_URL.CONTACTS },
  { name: 'contacts.share', description: 'Share contacts', category: PERMISSION_CATEGORIES.CONTACTS, url: PERMISSION_URL.CONTACTS },
  { name: 'contacts.import', description: 'Import contacts', category: PERMISSION_CATEGORIES.CONTACTS, url: PERMISSION_URL.CONTACTS },
  { name: 'contacts.export', description: 'Export contacts', category: PERMISSION_CATEGORIES.CONTACTS, url: PERMISSION_URL.CONTACTS },
  
  // Tasks Management
  { name: 'tasks.view', description: 'View tasks', category: PERMISSION_CATEGORIES.TASKS, url: PERMISSION_URL.TASKS },
  { name: 'tasks.create', description: 'Create tasks', category: PERMISSION_CATEGORIES.TASKS, url: PERMISSION_URL.TASKS },
  { name: 'tasks.edit', description: 'Edit tasks', category: PERMISSION_CATEGORIES.TASKS, url: PERMISSION_URL.TASKS },
  { name: 'tasks.delete', description: 'Delete tasks', category: PERMISSION_CATEGORIES.TASKS, url: PERMISSION_URL.TASKS },
  { name: 'tasks.assign', description: 'Assign tasks to users', category: PERMISSION_CATEGORIES.TASKS, url: PERMISSION_URL.TASKS },
  
  // Products Management
  { name: 'products.view', description: 'View products', category: PERMISSION_CATEGORIES.PRODUCTS, url: PERMISSION_URL.PRODUCTS },
  { name: 'products.create', description: 'Create products', category: PERMISSION_CATEGORIES.PRODUCTS, url: PERMISSION_URL.PRODUCTS },
  { name: 'products.edit', description: 'Edit products', category: PERMISSION_CATEGORIES.PRODUCTS, url: PERMISSION_URL.PRODUCTS },
  { name: 'products.delete', description: 'Delete products', category: PERMISSION_CATEGORIES.PRODUCTS, url: PERMISSION_URL.PRODUCTS },
  { name: 'products.trash', description: 'Trash products', category: PERMISSION_CATEGORIES.PRODUCTS, url: PERMISSION_URL.PRODUCTSTRASH },
  { name: 'products.restore', description: 'Restore products', category: PERMISSION_CATEGORIES.PRODUCTS, url: PERMISSION_URL.PRODUCTSTRASH },
  
  // Notes Management
  { name: 'notes.view', description: 'View notes', category: PERMISSION_CATEGORIES.NOTES, url: PERMISSION_URL.NOTES },
  { name: 'notes.create', description: 'Create notes', category: PERMISSION_CATEGORIES.NOTES, url: PERMISSION_URL.NOTES },
  { name: 'notes.edit', description: 'Edit notes', category: PERMISSION_CATEGORIES.NOTES, url: PERMISSION_URL.NOTES },
  { name: 'notes.delete', description: 'Delete notes', category: PERMISSION_CATEGORIES.NOTES, url: PERMISSION_URL.NOTES },
  { name: 'notes.add', description: 'Add collaborator to note', category: PERMISSION_CATEGORIES.NOTES, url: PERMISSION_URL.NOTES },
  { name: 'notes.remove', description: 'Remove collaborator from note', category: PERMISSION_CATEGORIES.NOTES, url: PERMISSION_URL.NOTES },

  // Library Management
  { name: 'library.view', description: 'View library', category: PERMISSION_CATEGORIES.LIBRARY, url: PERMISSION_URL.LIBRARY },
  { name: 'library.upload', description: 'Upload documents', category: PERMISSION_CATEGORIES.LIBRARY, url: PERMISSION_URL.LIBRARY },
  { name: 'library.edit', description: 'Edit documents', category: PERMISSION_CATEGORIES.LIBRARY, url: PERMISSION_URL.LIBRARY },
  { name: 'library.delete', description: 'Delete documents', category: PERMISSION_CATEGORIES.LIBRARY, url: PERMISSION_URL.LIBRARY },
  
  // Chat Management
//   { name: 'chat.view', description: 'View chat', category: PERMISSION_CATEGORIES.CHAT },
//   { name: 'chat.create_rooms', description: 'Create chat rooms', category: PERMISSION_CATEGORIES.CHAT },
//   { name: 'chat.moderate', description: 'Moderate chat messages', category: PERMISSION_CATEGORIES.CHAT },
  
  // Analytics & Reports
  { name: 'analytics.view', description: 'View analytics', category: PERMISSION_CATEGORIES.ANALYTICS, url: PERMISSION_URL.ANALYTICS },
  { name: 'analytics.export', description: 'Export reports', category: PERMISSION_CATEGORIES.ANALYTICS, url: PERMISSION_URL.ANALYTICS },
  
  // Administration
  { name: 'admin.users.view', description: 'View users', category: PERMISSION_CATEGORIES.ADMIN, url: PERMISSION_URL.ADMIN },
  { name: 'admin.users.create', description: 'Create users', category: PERMISSION_CATEGORIES.ADMIN, url: PERMISSION_URL.ADMIN },
  { name: 'admin.users.edit', description: 'Edit users', category: PERMISSION_CATEGORIES.ADMIN, url: PERMISSION_URL.ADMIN },
  { name: 'admin.users.delete', description: 'Delete users', category: PERMISSION_CATEGORIES.ADMIN, url: PERMISSION_URL.ADMIN },
  { name: 'admin.users.invite', description: 'Invite users', category: PERMISSION_CATEGORIES.ADMIN, url: PERMISSION_URL.ADMIN },
  { name: 'admin.roles.view', description: 'View roles', category: PERMISSION_CATEGORIES.ADMIN, url: PERMISSION_URL.ADMIN },
  { name: 'admin.roles.create', description: 'Create roles', category: PERMISSION_CATEGORIES.ADMIN, url: PERMISSION_URL.ADMIN },
  { name: 'admin.roles.edit', description: 'Edit roles', category: PERMISSION_CATEGORIES.ADMIN, url: PERMISSION_URL.ADMIN },
  { name: 'admin.roles.delete', description: 'Delete roles', category: PERMISSION_CATEGORIES.ADMIN, url: PERMISSION_URL.ADMIN },
  
  // Settings
  { name: 'settings.view', description: 'View settings', category: PERMISSION_CATEGORIES.SETTINGS, url: PERMISSION_URL.SETTINGS },
  { name: 'settings.edit', description: 'Edit settings', category: PERMISSION_CATEGORIES.SETTINGS, url: PERMISSION_URL.SETTINGS },

  // Profile
  { name: 'profile.view', description: 'Profile settings', category: PERMISSION_CATEGORIES.PROFILE, url: PERMISSION_URL.PROFILE },
  { name: 'profile.edit', description: 'Profile settings', category: PERMISSION_CATEGORIES.PROFILE, url: PERMISSION_URL.PROFILE },

  { name: 'contact.archive', description: 'Contact Archive', category: PERMISSION_CATEGORIES.CONTACTARCHIVE, url: PERMISSION_URL.CONTACTARCHIVE },
  { name: 'product.archive', description: 'Product Archive', category: PERMISSION_CATEGORIES.PRODUCTARCHIVE, url: PERMISSION_URL.PRODUCTARCHIVE }

];