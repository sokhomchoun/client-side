import { boolean, number } from "zod";

export interface TClient {
    id: number;
    email?: string;
    password?: string;
    domain?: string;
    company?: string;
    location?: string;
    phone_number?: string;
    name?: string;
    plan?: string;
    limited_contact?: string;
    amount?:  number;
    limited_storage?: number;
    revenue?: string;
    last_login?: string;
    status?: string;
    due_date?: string;
    auto_block?: boolean;
    limited_user?: string;
    limited_pipeline?: string;
    is_block?: boolean;
    pipeline: boolean;
    deal_tracking?: string;
    user?: {
        email: string;
        last_login: string;
    }[];
    client_usage?: {
        client_id?: number;
        user_usage?: string;
        pipeline_usage?: string;
        contact_usage?: string;
        deal_usage?: string;
        library_usage?: string;
        storage_usage?: string;
        user_id?: string;
    }[];
    contactsLimit:? string;
    storageLimit?: string;

  totalClients?: number;
  activeClients?: number;
  unpaidClients?: number;
  monthlyRevenue?: {
    _sum: {
      amount: number;
    };
  };
  sub_clients?: {
    client_id: number;
    email: string;
    role: string;
  }[];
}

export interface TUsers {
    id?: string;
    email: string;
    password_hash?: string;
    name?: string;
    avatar_url?: string;
    role?: string;
    joined?: string;
    last_login?: string;
    status?: string;
    joined?: string;
    role_id?: string;
    created_at?: string;
    updated_at?: string;
    
    shared_contacts_sharing?: {
        contact: {
        id: number;
        is_shared: boolean;
        }[];
    }[];
}

export interface TClientStats {
  totalClients: number;
  activeClients: number;
  unpaidClients: number;
  monthlyRevenue: {
    _sum: {
      amount: number;
    };
  };
}
export interface TUser {
    id?: string;
    email: string;
    password_hash?: string;
    name?: string;
    avatar_url?: string;
    role?: string;
    joined?: string;
    last_login?: string;
    status?: string;
    role_id?: string;
    created_at?: string;
    updated_at?: string;
}


export interface TSessions {
  id?: string;
  user_id: string;
  token: string;
  expires_at: string;
}
export interface TUserPreferences {
  id?: string;
  user_id: string;
  theme: string;
  language: string;
  settings_json: string;
}
export interface AuthContextType {
  user: User | null;
  accessToken: string;
  login: (
    token: string,
    auth_id: string,
    userData: { name: string; email: string; role: string; avatarUrl?: string }
  ) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
export interface TRoles {
  id?: number;
  user_id: number;
  role_name: string;
  color: string;
  description?: string;
  _count: {
    permissions: number;
  };
  permissions: string[] | TPermissions[];
  createdAt: string;
  updatedAt?: string;
}
export interface TPermissions {
  id?: number;
  user_id?: number;
  role_id?: number;
  name: string;
  url: string;
  category?: string;
}
export interface TContactCategories {
    id: number;
    domain?: string;
    client_id?: number;
    user_id: number;
    name: string;
    color: string;
}
export interface TContact {
    id?: number;
    domain?: number;
    client_id?: number;
    name?: string;
    user_id?: number;
    role?: string;
    email: string;
    phone: string;
    company: string;
    position: string;
    category_id: string;
    address?: string;
    map_link?: string;
    website?: string;
    notes?: string;
    attachments?: ContactFile[];
    is_shared?: boolean;
    user?: { name: string };
    contact_category?: { name: string; color: string };
    contact_attachments?:
        | [{ id: number; file_name: string; file_size: number }]
        | { id: number; file_name: string; file_size: number | File }[];
    sharedWith?: string;
    contact_sharing?: {
        contact_id: number;
        shared_with_user_id: number;
        permissions: string;
        shared_with_user?: {
        email: string;
        name: string;
        };
    }[];
    deals: TDeal[]; 
    contact_history: {
        id: number;
        action?: string;
        details?: string;
        createdAt?: string;
        user?: {
            name?: string;
        }
    }[];
}


export interface TContactSharing {
  id: number;
  contact_id: number;
  shared_with_user_id: number;
  permission?: string;
}
export interface TContactAttachments {
  id: number;
  contact_id: number;
  file_name?: string;
  file_url?: string;
  file_size?: string;
  file_type?: string;
}
export interface TNote {
  id: number;
  title: string;
  content: string;
  color: string;
  last_edited_at?: string;
  status: "actived" | "archived" | "trashed";
  is_pinned: boolean;
  is_owner: boolean;
  note_id: number;
  permission: "admin" | "edit" | "view";
  shared_by?:
    | { id: number; email: string; name?: string; avatar_url?: string | null }
    | string
    | null;
  collaborators?: {
    id: number;
    email: string;
    name: string;
    avatar_url: string | null;
    permission: "admin" | "edit" | "view";
    is_owner: boolean;
  }[];
  // Legacy properties for backward compatibility
  is_archived?: boolean;
  is_deleted?: boolean;
  is_shared?: boolean;
  remind_date: string | null;
  remind_time: string | null;
  repeat: string | null;
}
export interface Tag {
  id?: number;
  name?: string;
}
export interface TNotification {
  id: number;
  user_id?: number;
  email?: string;
  message?: string;
  createdAt?: string;
  timestamp?: string;
}
export interface TProductCategories {
  id?: number;
  user_id: number;
  name?: string;
  description?: string;
  _count?: {
    product: string;
  };
}
export interface TProduct {
    domain?: string;
    client_id?: number;
    id?: number;
    category_id?: number;
    user_id?: number;
    name?: string;
    role?: string;
    price?: number
    price_usd?: number;
    price_khr?: number;
    status?: string;
    description?: string;
    link?: string;
    type?: string;
    external_link?: string;
    photoUrl?: string;
    deletedAt?: string;
    thumbnail?: string;
    attachments?: {
        id: number;
        product_id: number;
        file_name: string;
        file_url: string;
        file_size: string;
        file_type: string;
        extention: string;
        external_link: string;
    }[];
    category?: {
        id?: number,
        name?: string;
    },
    deletedByUser?: {
        name;
    },
    user?: {
        name: string;
    },
    images?: string[];
    thumbnails?: TProductThumbnail[];
    
}
export interface TProductAttachments {
    id: number;
    product_id: number;
    file_name?: string;
    file_url?: string;
    file_size?: string;
    extention?: string;
    external_link?: string
} 
export interface TProductThumbnail {
    id: number;
    thumbnail?: string;
}
export interface TPipelines {
    id: number;
    user_id?: number;
    role?: string;
    name?: string;
    description?: string;
    updatedAt?: string;
    sale_target?: TSalesTarget[];
    _count?: {
        deals: number
    }
    totalStages?: number;
    share_pipelines?: {
        pipeline_id: number;
        status_share?: string;
        email?: string; // if you also want to display who it was shared with
        domain?: string; // optional
        permission?: string;
        invited_by?: number;
    }[];
    pipeline_shared;
    user?: {
        id?: number;
        name?: string;
    };
    
}
export interface TSaleTarget {
  id: number;
  pipeline_id?: number;
  user_id?: number;
  period_type?: string;
  monthly_target_usd?: number;
  quarterly_target_usd?: number;
  yearly_target_usd?: number;
  monthly_target_khr?: number;
  quarterly_target_khr?: number;
  yearly_target_khr?: number;
}
export interface TSharePipelines {
  id: number;
  pipeline_id?: number;
  status_share?: string;
  email?: string;
  permission?: string;
}
export interface TPipelineState {
    id: number;
    user_id?: number;
    name?: string;
    pipeline_id?: number;
    role?: string;
    color?: string;
    probability?: number;
    is_permanent?: boolean;
    order_stage?: number; 
    user?: {
        id?: number;
        name?: string
    }
}
export interface TDeals {
    id: number;
    domain?: string;
    client_id?: number;
    pipeline_id?: number;
    user_id?: number;
    contact_id?: number;
    product_id?: number;
    stage_id?: number;
    title?: string;
    value_usd?: number;
    value_khr?: number;
    probability?: number | null;
    expected_close_date?: string;
    notes?: string | null;
    status?: string;
    pipeline_id?: string;
    createdAt?: string;
    updatedAt?: string;
    pipeline_stage?: {
        id: number;
        name?: string;
        color?: string;
        probability?: number;
        is_permanent?: boolean;
    };
    product?: {
        id: number;
        name?: string;
    };
    contact?: {
        id: number;
        name?: string;
        email?: string;
        phone?: string;
    };
    pipeline?: {
        id: number;
        name?: string;
    };
    user?: {
        id: number;
        name?: string;
    }; 
    deal_attachments?: TDealAttachment[];
    deal_teams?: TDealTeam[];
    pipeline_stage: {
        id: number;
        name: string;
        probability: number;
        color: string;
    };

}


export interface TDealAttachments {
  id: number;
  deal_id?: number;
  file_name?: string;
  file_url?: string;
  file_size?: string;
  file_type?: string;
  extention?: string;
}
export interface TDealTeam {
    id: number;
    deal_id?: number;
    user?: string;
    role?: string;
    name?: string;
    createdAt?: Date;
}

export interface TNoteSharing {
  id: number;
  note_id?: number;
  shared_with_user_id?: number;
  permission?: string;
  status?: string;
  is_pinned?: boolean;
}

export interface TProductThumbnail {
    id: number;
    thumbnail: string;
    thumbnail_size: string;
    thumbnail_size_unit: string;
};
