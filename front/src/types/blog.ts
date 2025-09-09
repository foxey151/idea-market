// ブログページ関連の型定義

/** ブログ詳細ページのProps型 */
export type BlogDetailPageProps = {
  params: Promise<{ id: string }>;
};

/** ブログカテゴリページのProps型 */
export type BlogCategoryPageProps = {
  params: Promise<{ id: string }>;
};

/** ブログコンテンツ処理用の設定型 */
export interface BlogContentProcessingConfig {
  /** 読了時間計算の1分あたりの文字数 */
  wordsPerMinute: number;
  /** HTMLタグ除去時の正規表現パターン */
  htmlTagPattern: RegExp;
  /** メタデータ用description の最大文字数 */
  maxDescriptionLength: number;
}

/** ブログ詳細ページで使用する処理済みコンテンツ */
export interface ProcessedBlogContent {
  /** 処理済みHTMLコンテンツ */
  html: string;
  /** 読了時間（分） */
  readingTime: number;
  /** メタデータ用のクリーンなテキスト */
  cleanText: string;
}

/** ブログメタデータ生成用の設定 */
export interface BlogMetadataConfig {
  /** サイト名 */
  siteName: string;
  /** デフォルトのOGイメージURL */
  defaultOgImage?: string;
  /** ページタイトルのテンプレート */
  titleTemplate: string;
}

/** ブログ詳細ページで使用する閲覧数データ */
export interface BlogViewData {
  view_count: number;
  last_viewed?: string;
}
