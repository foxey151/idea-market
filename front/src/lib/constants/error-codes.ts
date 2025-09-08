// エラーコード定数
export const ERROR_CODES = {
  // 認証関連
  AUTH_001: 'AUTH_001', // 認証失敗
  AUTH_002: 'AUTH_002', // 権限不足
  AUTH_003: 'AUTH_003', // セッション期限切れ

  // データベース関連
  DB_001: 'DB_001', // 接続エラー
  DB_002: 'DB_002', // クエリエラー
  DB_003: 'DB_003', // データ整合性エラー

  // API関連
  API_001: 'API_001', // バリデーションエラー
  API_002: 'API_002', // 外部API通信エラー
  API_003: 'API_003', // レート制限エラー

  // ビジネスロジック関連
  BIZ_001: 'BIZ_001', // 業務制約違反
  BIZ_002: 'BIZ_002', // データ不整合
  BIZ_003: 'BIZ_003', // 期限切れ

  // システム関連
  SYS_001: 'SYS_001', // 予期しないエラー
  SYS_002: 'SYS_002', // メンテナンス中
  SYS_003: 'SYS_003', // サービス停止
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// エラーメッセージマッピング
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.AUTH_001]: '認証に失敗しました',
  [ERROR_CODES.AUTH_002]: 'この操作を実行する権限がありません',
  [ERROR_CODES.AUTH_003]: 'セッションが期限切れです。再ログインしてください',

  [ERROR_CODES.DB_001]: 'データベース接続エラーが発生しました',
  [ERROR_CODES.DB_002]: 'データベース操作エラーが発生しました',
  [ERROR_CODES.DB_003]: 'データの整合性に問題があります',

  [ERROR_CODES.API_001]: '入力データに誤りがあります',
  [ERROR_CODES.API_002]: '外部サービスとの通信に失敗しました',
  [ERROR_CODES.API_003]:
    'アクセス頻度が上限に達しました。しばらくお待ちください',

  [ERROR_CODES.BIZ_001]: '業務ルールに違反しています',
  [ERROR_CODES.BIZ_002]: 'データに不整合があります',
  [ERROR_CODES.BIZ_003]: '有効期限が切れています',

  [ERROR_CODES.SYS_001]: 'システムエラーが発生しました',
  [ERROR_CODES.SYS_002]: 'メンテナンス中です',
  [ERROR_CODES.SYS_003]: 'サービスが一時的に利用できません',
};

// エラー情報の型定義
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}

// エラー作成ヘルパー関数
export function createError(code: ErrorCode, details?: any): AppError {
  return {
    code,
    message: ERROR_MESSAGES[code],
    details,
    timestamp: new Date().toISOString(),
  };
}
