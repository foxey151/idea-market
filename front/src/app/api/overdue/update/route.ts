import { NextRequest, NextResponse } from 'next/server';
import { updateAllOverdueIdeas } from '@/lib/supabase/ideas';

// このエンドポイントは認証を必要とするため、セキュリティのため本番環境では適切な認証を実装してください
export async function POST(_request: NextRequest) {
  try {
    // 期限切れアイデアの更新を実行
    const { data, error } = await updateAllOverdueIdeas();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: '期限切れアイデアの更新に失敗しました',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '期限切れアイデアの更新が完了しました',
      data: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: '予期しないエラーが発生しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GETリクエストでも実行可能にする（手動実行用）
export async function GET(request: NextRequest) {
  return POST(request);
}
