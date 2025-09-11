// アイデア関連の型定義

import { Database } from '@/lib/supabase/types';

/** アイデアページのProps型 */
export type IdeaPageProps = Record<string, never>;

/** アイデア詳細ページのProps型 */
export type IdeaDetailPageProps = {
  params: Promise<{ id: string }>;
};

/** アイデア編集ページのProps型 */
export type IdeaEditPageProps = {
  params: Promise<{ id: string }>;
};

/** アイデア最終ページのProps型 */
export type IdeaFinalPageProps = {
  params: Promise<{ id: string }>;
};

/** マイアイデアページのProps型 */
export type MyIdeasPageProps = Record<string, never>;

/** 基本的なアイデア型（Supabaseのテーブル型を拡張） */
export type IdeaDetail = Database['public']['Tables']['ideas']['Row'] & {
  profiles: {
    display_name: string;
    role: string;
  } | null;
};

/** アイデア一覧用の型（コメント数を含む） */
export type Idea = Database['public']['Tables']['ideas']['Row'] & {
  profiles: {
    display_name: string;
    role: string;
  } | null;
  commentCount?: number;
};

/** コメント型 */
export type Comment = {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  profiles: {
    display_name: string;
  } | null;
};

/** 添付ファイル情報型 */
export interface AttachmentInfo {
  path: string;
  url: string;
  isImage: boolean;
  fileName: string;
}

/** アイデアフィルター設定 */
export interface IdeaFilter {
  searchTerm: string;
  status?: string;
  category?: string;
  sortBy: 'created_at' | 'updated_at' | 'deadline';
  sortOrder: 'asc' | 'desc';
}

/** アイデア作成フォームの型 */
export interface IdeaFormData {
  title: string;
  summary: string;
  deadline?: string;
  attachments?: File[];
}
