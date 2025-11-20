import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ERROR_CODES, createError } from '@/lib/constants/error-codes';
import { autoCancelOverduePurchases } from '@/lib/supabase/ideas';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 管理者権限チェック（オプション：自動実行の場合はスキップ可能）
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // 認証エラーでも実行可能（cron job用）
    } else {
      // 認証済みの場合は管理者権限をチェック
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && profile.role !== 'admin') {
        return NextResponse.json(
          {
            error: createError(ERROR_CODES.AUTH_002, '管理者権限が必要です'),
          },
          { status: 403 }
        );
      }
    }

    // 期限切れ購入の自動削除を実行
    const { data, error } = await autoCancelOverduePurchases();

    if (error) {
      console.error('期限切れ購入削除エラー:', error);
      return NextResponse.json(
        {
          error: createError(ERROR_CODES.DB_002, error),
          message: '期限切れ購入の削除に失敗しました',
        },
        { status: 500 }
      );
    }

    const cancelledCount = data?.[0]?.cancelled_count || 0;
    const ideaIds = data?.[0]?.idea_ids || [];

    return NextResponse.json({
      success: true,
      message: `${cancelledCount}件の期限切れ購入を取消しました`,
      cancelledCount,
      ideaIds,
    });
  } catch (error) {
    console.error('期限切れ購入削除APIで予期しないエラーが発生:', error);
    return NextResponse.json(
      {
        error: createError(ERROR_CODES.SYS_001, String(error)),
        message: '予期しないエラーが発生しました',
      },
      { status: 500 }
    );
  }
}

