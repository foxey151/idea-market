import { supabase } from './client';

// ログの種類
export type LogType = 'access' | 'error' | 'audit' | 'system';

// ログデータの型定義（audit_logsテーブルの実際の構造に合わせる）
export interface LogEntry {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  payload: any;
  created_at: string;
}

// ログデータを取得する関数
export const getLogs = async (
  logType: LogType,
  startDate?: string,
  endDate?: string,
  limit: number = 1000
): Promise<{ data: LogEntry[] | null; error: any }> => {
  try {
    let query = supabase
      .from('audit_logs') // 既存のaudit_logsテーブルを使用
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // 日付フィルター
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // ログタイプフィルター（現在はaudit_logsのみ対応）
    // 将来的に他のログテーブルを追加する際はここで分岐
    if (logType !== 'audit') {
      // 現在はaudit_logsのみ対応のため、audit以外の場合は空の結果を返す
      return { data: [], error: null };
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return { data: data as LogEntry[], error: null };
  } catch (error) {
    return { data: null, error };
  }
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
