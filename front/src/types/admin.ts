// 管理者・システム関連の型定義

/** 管理者ページのProps型 */
export type AdminPageProps = Record<string, never>;

/** 編集可能なドキュメント種別 */
export type EditableDocument = 'terms' | 'privacy' | 'commerce' | 'company';

/** ドキュメント編集フォームデータ型 */
export interface DocumentFormData {
  title: string;
  content: string;
  lastModified: string;
}

/** システム情報型 */
export interface SystemInfo {
  version: string;
  environment: 'development' | 'staging' | 'production';
  databaseStatus: 'connected' | 'disconnected' | 'error';
  cacheStatus: 'active' | 'inactive' | 'error';
  lastBackup?: string;
}

/** ログエントリ型 */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/** ユーザー管理用のユーザー型 */
export interface AdminUser {
  id: string;
  email: string;
  display_name?: string;
  role: 'admin' | 'member';
  created_at: string;
  last_login?: string;
  is_active: boolean;
  idea_count: number;
  comment_count: number;
}

/** 統計データ型 */
export interface AdminStats {
  totalUsers: number;
  totalIdeas: number;
  totalComments: number;
  totalBlogViews: number;
  activeUsersToday: number;
  newUsersThisWeek: number;
  popularIdeas: Array<{
    id: string;
    title: string;
    views: number;
    comments: number;
  }>;
}
