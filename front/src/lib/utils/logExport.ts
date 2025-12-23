import { LogEntry, LogType } from '@/lib/supabase/logs';

// CSVエスケープ関数
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

// CSVヘッダー（各ログタイプに合わせる）
const CSV_HEADERS = {
  access: 'Timestamp,User ID,Action,Entity,Entity ID,Details',
  error: 'Timestamp,User ID,Action,Entity,Entity ID,Details',
  system: 'Timestamp,User ID,Action,Entity,Entity ID,Details',
  login: 'ID,ユーザーID,ユーザー表示名,ユーザーメールアドレス,ログインステータス,IPアドレス,User-Agent,失敗理由,ログイン日時,作成日時',
  blog_view: 'ID,ブログID,ユーザーID,ユーザー表示名,ユーザーメールアドレス,セッションID,IPアドレス,User-Agent,閲覧日,作成日時',
};

// ログデータをCSV形式に変換
export const convertLogsToCSV = (
  logs: LogEntry[],
  logType: LogType
): string => {
  const headers = CSV_HEADERS[logType] || CSV_HEADERS.login;

  const csvRows = logs.map((log) => {
    switch (logType) {
      case 'login':
        return [
          log.id || '',
          log.user_id || '',
          log.user_display_name || '',
          log.user_email || '',
          log.login_status || '',
          log.ip_address || '',
          log.user_agent || '',
          log.failure_reason || '',
          log.login_at || '',
          log.created_at || '',
        ]
          .map(escapeCSV)
          .join(',');

      case 'blog_view':
        return [
          log.id || '',
          log.blog_id || '',
          log.user_id || '',
          log.user_display_name || '',
          log.user_email || '',
          log.session_id || '',
          log.ip_address || '',
          log.user_agent || '',
          log.view_date || '',
          log.created_at || '',
        ]
          .map(escapeCSV)
          .join(',');

      default:
        return `"${log.created_at || ''}"`;
    }
  });

  return [headers, ...csvRows].join('\n');
};

// ファイル名を生成
export const generateLogFileName = (
  logType: LogType,
  startDate?: string,
  endDate?: string
): string => {
  const now = new Date().toISOString().split('T')[0];
  const dateRange =
    startDate && endDate ? `_${startDate}_to_${endDate}` : `_${now}`;
  return `${logType}_logs${dateRange}.csv`;
};
