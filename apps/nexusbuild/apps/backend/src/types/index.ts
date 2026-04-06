/**
 * Shared TypeScript Types for NexusBuild API
 * Use these types in both backend and frontend for type safety
 */

// ==================== USER TYPES ====================

export interface User {
    id: number;
    username: string;
    email: string;
    bio?: string;
    profileImage?: string;
    isAdmin: boolean;
    isModerator: boolean;
    isSuspended: boolean;
    avatarFrame: string;
    showcaseBuildId?: number;
    isPublicProfile: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    bio?: string;
    profileImage?: string;
    avatarFrame: string;
    showcaseBuildId?: number;
    isPublicProfile: boolean;
}

// ==================== BUILD TYPES ====================

export interface Build {
    id: number;
    userId: number;
    name: string;
    description?: string;
    totalPrice: number;
    imageUrl?: string;
    performanceScore?: number;
    isPublic: boolean;
    likesCount: number;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface BuildWithParts extends Build {
    parts: Part[];
}

export interface BuildWithUser extends Build {
    user: UserProfile;
}

// ==================== PART TYPES ====================

export interface Part {
    id: number;
    buildId: number;
    name: string;
    category: string;
    price: number;
    url?: string;
    imageUrl?: string;
    specifications?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export type PartCategory =
    | 'CPU'
    | 'GPU'
    | 'RAM'
    | 'Motherboard'
    | 'Storage'
    | 'PSU'
    | 'Case'
    | 'Cooling'
    | 'Monitor'
    | 'Other';

// ==================== BUG REPORT TYPES ====================

export interface BugReport {
    id: number;
    userId?: number;
    email?: string;
    description: string;
    category?: 'bug' | 'feature' | 'other';
    imageUrl?: string;
    images?: string[];
    status: 'pending' | 'in_progress' | 'resolved';
    priority: 'low' | 'medium' | 'high' | 'critical';
    adminNotes?: string;
    createdAt: Date;
}

export interface BugReportWithUser extends BugReport {
    user?: UserProfile;
}

// ==================== ENTITLEMENT TYPES ====================

export interface UserEntitlement {
    id: number;
    userId: number;
    tier: 'free' | 'premium' | 'pro' | 'unlimited';
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== AI USAGE TYPES ====================

export interface DailyAIUsage {
    id: number;
    userId: number;
    date: Date;
    count: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface AIUsageStats {
    count: number;
    limit: number;
    remaining: number;
    tier: string;
    date: Date;
}

// ==================== API REQUEST TYPES ====================

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface CreateBuildRequest {
    name: string;
    description?: string;
    totalPrice?: number;
    imageUrl?: string;
}

export interface UpdateBuildRequest {
    name?: string;
    description?: string;
    totalPrice?: number;
    imageUrl?: string;
}

export interface CreatePartRequest {
    buildId: number;
    name: string;
    category: string;
    price?: number;
    url?: string;
    imageUrl?: string;
    specifications?: Record<string, any>;
}

export interface UpdatePartRequest {
    name?: string;
    category?: string;
    price?: number;
    url?: string;
    imageUrl?: string;
    specifications?: Record<string, any>;
}

export interface SubmitBugReportRequest {
    email?: string;
    description: string;
    category?: 'bug' | 'feature' | 'other';
    imageUrl?: string;
    images?: string[];
}

export interface UpdateBugReportRequest {
    status?: 'pending' | 'in_progress' | 'resolved';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    adminNotes?: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface AuthResponse {
    success: boolean;
    user: User;
    accessToken: string;
    refreshToken: string;
    message?: string;
}

export interface BuildsResponse {
    success: boolean;
    builds: BuildWithParts[];
    count: number;
}

export interface PartsResponse {
    success: boolean;
    parts: Part[];
    count: number;
}

export interface EntitlementsResponse {
    success: boolean;
    entitlements: UserEntitlement[];
    hasPremium: boolean;
    count: number;
}

export interface BugReportsResponse {
    success: boolean;
    reports: BugReportWithUser[];
    count: number;
    totalPages?: number;
    currentPage?: number;
}

export interface AIUsageResponse {
    success: boolean;
    usage: AIUsageStats;
    message?: string;
}

// ==================== ERROR TYPES ====================

export interface ApiError {
    success: false;
    error: string;
    statusCode?: number;
    details?: any;
}

export interface ValidationError {
    field: string;
    message: string;
}

// ==================== UTILITY TYPES ====================

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    count: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
