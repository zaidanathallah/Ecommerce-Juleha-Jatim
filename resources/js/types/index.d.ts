export type UserRole = 'user' | 'admin_ekop' | 'super_admin';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    juleha_id?: string | null;
    region_code?: string | null;
    region_name?: string | null;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
    is_verified?: boolean;
    phone?: string | null;
    avatar_url?: string | null;
    email_verified_at?: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
}

export interface BuyerProduct {
    id: number;
    title: string;
    slug: string;
    description: string;
    image_url: string;
    gallery?: string[];
    price: number;
    stock: number;
    weight_gram: number;
    region_name: string;
    region_code: string;
    seller: {
        id: number;
        name: string;
        region_name: string;
        is_verified: boolean;
        lat?: number | null;
        lng?: number | null;
    };
    category?: {
        id: number;
        name: string;
        slug: string;
    };
    created_at?: string;
}

export interface ManagementProduct {
    id: number;
    user_id: number;
    seller_name: string;
    title: string;
    slug: string;
    description: string;
    image_url: string;
    stock: number;
    weight_gram: number;
    region_code: string;
    region_name: string;
    status: 'pending' | 'approved_ekop' | 'live' | 'rejected';
    rejection_reason?: string | null;
    base_price: number;
    ekop_margin?: number | null;
    super_margin?: number | null;
    final_price: number;
    category?: {
        id: number;
        name: string;
    };
    created_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
        info?: string | null;
    };
    appName?: string;
};
