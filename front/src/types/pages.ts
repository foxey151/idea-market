// 一般ページ・静的ページ関連の型定義

/** ホームページのProps型 */
export type HomePageProps = Record<string, never>;

/** 検索ページのProps型 */
export type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    type?: 'ideas' | 'blogs' | 'all';
    page?: string;
  }>;
};

/** 利用規約ページのProps型 */
export type TermsPageProps = Record<string, never>;

/** プライバシーポリシーページのProps型 */
export type PrivacyPageProps = Record<string, never>;

/** 会社概要ページのProps型 */
export type CompanyPageProps = Record<string, never>;

/** コマースページのProps型 */
export type CommercePageProps = Record<string, never>;

/** About ページのProps型 */
export type AboutPageProps = Record<string, never>;

/** 403エラーページのProps型 */
export type ForbiddenPageProps = Record<string, never>;

/** テストページのProps型 */
export type TestPageProps = Record<string, never>;

/** デバッグページのProps型 */
export type DebugPageProps = Record<string, never>;

/** 検索結果型 */
export interface SearchResult {
  type: 'idea' | 'blog';
  id: string;
  title: string;
  excerpt?: string;
  category?: string;
  author?: string;
  publishedAt: string;
  score: number;
}

/** 検索設定型 */
export interface SearchConfig {
  resultsPerPage: number;
  maxResults: number;
  highlightEnabled: boolean;
  fuzzySearch: boolean;
}

/** パンくずリストアイテム型 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

/** ページメタデータ型 */
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}
