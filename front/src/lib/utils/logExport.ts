import { LogEntry, LogType } from '@/lib/supabase/logs';

// CSVヘッダー（audit_logsテーブルの実際の構造に合わせる）
const CSV_HEADERS = {
  access: 'Timestamp,User ID,Action,Entity,Entity ID,Details',
  error: 'Timestamp,User ID,Action,Entity,Entity ID,Details',
  audit: 'Timestamp,User ID,Action,Entity,Entity ID,Details',
  system: 'Timestamp,User ID,Action,Entity,Entity ID,Details',
};

// ログデータをCSV形式に変換（audit_logsテーブルの実際の構造に合わせる）
export const convertLogsToCSV = (
  logs: LogEntry[],
  logType: LogType
): string => {
  const headers = CSV_HEADERS[logType];

  const csvRows = logs.map(log => {
    // 現在はaudit_logsテーブルの構造に合わせて統一
    return `"${log.created_at}","${log.actor_id || ''}","${log.action}","${log.entity}","${log.entity_id || ''}","${JSON.stringify(log.payload || '')}"`;
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
