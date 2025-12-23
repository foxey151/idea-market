import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// リクエストスキーマ
const recordLoginSchema = z.object({
  loginStatus: z.enum(['success', 'failed']),
  failureReason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // リクエストボディを取得
    const body = await request.json();
    const validation = recordLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '無効なリクエストパラメータです', details: validation.error },
        { status: 400 }
      );
    }

    const { loginStatus, failureReason } = validation.data;

    // IPアドレスとUser-Agentを取得
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0]
      : request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    // ユーザー情報を取得（ログイン成功時のみ）
    let userId: string | null = null;
    if (loginStatus === 'success') {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    // ログイン成功/失敗時は新規レコードを作成
    const { data, error } = await supabase
      .from('login_history')
      .insert({
        user_id: userId,
        login_status: loginStatus,
        ip_address: ip,
        user_agent: userAgent,
        failure_reason: failureReason || null,
        login_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('ログイン履歴記録エラー:', error);
      // エラーが発生してもログイン処理自体は続行するため、エラーを返さない
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('ログイン履歴記録で予期しないエラー:', error);
    // エラーが発生してもログイン処理自体は続行するため、エラーを返さない
    return NextResponse.json({ success: false, error: error.message });
  }
}

