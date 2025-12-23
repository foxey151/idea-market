import { supabase } from './client';

// ログの種類
export type LogType = 'access' | 'error' | 'system' | 'login' | 'blog_view';

// ログデータの型定義（audit_logsテーブルの実際の構造に合わせる）
export interface LogEntry {
  id: number | string;
  actor_id?: string | null;
  action?: string;
  entity?: string;
  entity_id?: string | null;
  payload?: any;
  created_at: string;
  // ログイン履歴用
  user_id?: string | null;
  user_display_name?: string | null;
  user_email?: string | null;
  login_status?: 'success' | 'failed';
  ip_address?: string | null;
  user_agent?: string | null;
  failure_reason?: string | null;
  login_at?: string;
  // ブログ閲覧履歴用
  blog_id?: string;
  session_id?: string | null;
  view_date?: string;
}

// ログデータを取得する関数（API経由でダウンロードするため、空配列を返す）
export const getLogs = async (
  logType: LogType,
  startDate?: string,
  endDate?: string,
  limit: number = 1000
): Promise<{ data: LogEntry[] | null; error: any }> => {
  // loginとblog_viewの場合はAPI経由でダウンロードするため、空配列を返す
  return { data: [], error: null };
};

// 監査ログを記録する関数
export const createAuditLog = async (
  action: string,
  entity: string,
  entityId?: string,
  payload?: any
): Promise<{ data: LogEntry | null; error: any }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const logData = {
      actor_id: user?.id || null,
      action,
      entity,
      entity_id: entityId || null,
      payload: payload || {},
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(logData)
      .select()
      .single();

    if (error) {
      console.error('監査ログ作成エラー:', error);
      return { data: null, error };
    }

    return { data: data as LogEntry, error: null };
  } catch (error) {
    console.error('監査ログ作成で予期しないエラー:', error);
    return { data: null, error };
  }
};

// システムログを記録する関数（将来的な拡張用）
export const createSystemLog = async (
  level: 'info' | 'warn' | 'error',
  message: string,
  component?: string,
  details?: any
): Promise<{ success: boolean; error: any }> => {
  try {
    // 現在はaudit_logsテーブルにシステムログとして記録
    const logData = {
      actor_id: null, // システムによる自動記録
      action: `SYSTEM_${level.toUpperCase()}`,
      entity: 'system',
      entity_id: component || null,
      payload: {
        message,
        level,
        component,
        details,
      },
    };

    const { error } = await supabase.from('audit_logs').insert(logData);

    if (error) {
      console.error('システムログ作成エラー:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('システムログ作成で予期しないエラー:', error);
    return { success: false, error };
  }
};
