import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// リクエストスキーマ
const downloadLogsSchema = z.object({
  logType: z.enum(['login', 'blog_view']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// 管理者権限チェック関数
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: '認証が必要です', supabase: null } as const;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return { error: '管理者権限が必要です', supabase: null } as const;
  }

  return { supabase } as const;
}

// CSVエスケープ関数
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // ダブルクォートをエスケープ
  return `"${str.replace(/"/g, '""')}"`;
}

// ログイン履歴をCSV形式に変換
function convertLoginHistoryToCSV(data: any[]): string {
  const headers = [
    'ID',
    'ユーザーID',
    'ユーザー表示名',
    'ユーザーメールアドレス',
    'ログインステータス',
    'IPアドレス',
    'User-Agent',
    '失敗理由',
    'ログイン日時',
    '作成日時',
  ];

  const rows = data.map((log) => [
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
  ]);

  const csvRows = rows.map((row) => row.map(escapeCSV).join(','));
  return [headers.map(escapeCSV).join(','), ...csvRows].join('\n');
}

// ブログ閲覧履歴をCSV形式に変換
function convertBlogViewHistoryToCSV(data: any[]): string {
  const headers = [
    'ID',
    'ブログID',
    'ユーザーID',
    'ユーザー表示名',
    'ユーザーメールアドレス',
    'セッションID',
    'IPアドレス',
    'User-Agent',
    '閲覧日',
    '作成日時',
  ];

  const rows = data.map((log) => [
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
  ]);

  const csvRows = rows.map((row) => row.map(escapeCSV).join(','));
  return [headers.map(escapeCSV).join(','), ...csvRows].join('\n');
}


export async function POST(request: NextRequest) {
  try {
    // 管理者権限チェック
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }
    const supabase = adminCheck.supabase!;

    // リクエストボディを取得
    const body = await request.json();
    const validation = downloadLogsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '無効なリクエストパラメータです', details: validation.error },
        { status: 400 }
      );
    }

    const { logType, startDate, endDate } = validation.data;

    let data: any[] = [];
    let csvContent = '';

    // ログタイプに応じてデータを取得
    switch (logType) {
      case 'login': {
        // ログイン履歴を取得（関数を使用）
        const startDateTime = startDate ? new Date(startDate).toISOString() : null;
        const endDateTime = endDate
          ? new Date(endDate + 'T23:59:59.999Z').toISOString()
          : null;

        const { data: loginData, error: loginError } = await supabase.rpc(
          'get_login_history_admin',
          {
            p_start_date: startDateTime,
            p_end_date: endDateTime,
          }
        );

        if (loginError) {
          console.error('ログイン履歴取得エラー:', loginError);
          // 関数が存在しない場合はビューから取得を試みる
          let query = supabase
            .from('login_history_admin')
            .select('*')
            .order('login_at', { ascending: false })
            .limit(10000);

          if (startDate) {
            query = query.gte('login_at', startDate);
          }
          if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            query = query.lte('login_at', endDateTime.toISOString());
          }

          const { data: fallbackData, error: fallbackError } = await query;

          if (fallbackError) {
            return NextResponse.json(
              { error: 'ログイン履歴の取得に失敗しました', details: fallbackError },
              { status: 500 }
            );
          }

          data = fallbackData || [];
        } else {
          data = loginData || [];
        }

        csvContent = convertLoginHistoryToCSV(data);
        break;
      }

      case 'blog_view': {
        // ブログ閲覧履歴を取得（関数を使用）
        const startDateTime = startDate ? new Date(startDate).toISOString() : null;
        const endDateTime = endDate
          ? new Date(endDate + 'T23:59:59.999Z').toISOString()
          : null;

        const { data: blogViewData, error: blogViewError } = await supabase.rpc(
          'get_blog_view_history_admin',
          {
            p_start_date: startDateTime,
            p_end_date: endDateTime,
          }
        );

        if (blogViewError) {
          console.error('ブログ閲覧履歴取得エラー:', blogViewError);
          // 関数が存在しない場合はビューから取得を試みる
          let query = supabase
            .from('blog_view_history_admin')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10000);

          if (startDate) {
            query = query.gte('created_at', startDate);
          }
          if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endDateTime.toISOString());
          }

          const { data: fallbackData, error: fallbackError } = await query;

          if (fallbackError) {
            return NextResponse.json(
              { error: 'ブログ閲覧履歴の取得に失敗しました', details: fallbackError },
              { status: 500 }
            );
          }

          data = fallbackData || [];
        } else {
          data = blogViewData || [];
        }

        csvContent = convertBlogViewHistoryToCSV(data);
        break;
      }

      default:
        return NextResponse.json(
          { error: 'サポートされていないログタイプです' },
          { status: 400 }
        );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: '指定された条件に一致するログがありません' },
        { status: 404 }
      );
    }

    // CSVファイルとして返す
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${logType}_logs_${startDate || 'all'}_${endDate || 'all'}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('ログダウンロードエラー:', error);
    return NextResponse.json(
      { error: 'ログのダウンロードに失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

