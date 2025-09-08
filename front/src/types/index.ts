// 共通型定義
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ユーザー関連
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

// ブログ関連
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  category?: string;
  tags?: string[];
  publishedAt: string;
  updatedAt: string;
  viewCount?: number;
}

export interface BlogViewRecord {
  id: string;
  blogId: string;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  viewDate: string;
  createdAt: string;
}
