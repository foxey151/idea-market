// 一般ページ・静的ページ関連の型定義

/** ホームページのProps型 */
export type HomePageProps = {
  // ホームページは引数なし
};

/** 検索ページのProps型 */
export type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    type?: 'ideas' | 'blogs' | 'all';
    page?: string;
  }>;
};

/** 利用規約ページのProps型 */
export type TermsPageProps = {
  // 利用規約ページは引数なし
};

/** プライバシーポリシーページのProps型 */
export type PrivacyPageProps = {
  // プライバシーポリシーページは引数なし
};

/** 会社概要ページのProps型 */
export type CompanyPageProps = {
  // 会社概要ページは引数なし
};

/** コマースページのProps型 */
export type CommercePageProps = {
  // コマースページは引数なし
};

/** About ページのProps型 */
export type AboutPageProps = {
  // Aboutページは引数なし
};

/** 403エラーページのProps型 */
export type ForbiddenPageProps = {
  // 403ページは引数なし
};

/** テストページのProps型 */
export type TestPageProps = {
  // テストページは引数なし
};

/** デバッグページのProps型 */
export type DebugPageProps = {
  // デバッグページは引数なし
};

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
