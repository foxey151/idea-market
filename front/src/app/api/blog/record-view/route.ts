import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ERROR_CODES, createError } from '@/lib/constants/error-codes';

// バリデーションスキーマ
const BlogViewSchema = z.object({
  blogId: z.string().min(1, 'ブログIDが必要です'),
  userId: z.string().nullable(),
  sessionId: z.string().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    // バリデーション
    const validation = BlogViewSchema.safeParse(requestBody);
    if (!validation.success) {
      const error = createError(ERROR_CODES.API_001, validation.error.issues);
      return NextResponse.json(error, { status: 400 });
    }

    const { blogId, userId, sessionId } = validation.data;

    const supabase = await createClient();

    // IPアドレスとUser-Agentを取得
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0]
      : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // データベースのユニークインデックス条件に合わせてデータを準備
    // user_idが設定されている場合、session_idはnullにする（ユニークインデックスの条件）
    // user_idがnullの場合、session_idを設定する（セッションベースの重複防止）
    // user_idもsession_idもnullの場合、IPアドレスベースの重複防止を使用
    const finalUserId = userId || null;
    const finalSessionId = finalUserId ? null : (sessionId || null);
    // IPアドレスは常に記録（統計目的）、ただし'unknown'の場合はnullにする
    const finalIpAddress = ip !== 'unknown' ? ip : null;

    // 閲覧記録を追加（view_dateを追加）
    const { data, error } = await supabase
      .from('blog_views')
      .insert({
        blog_id: blogId,
        user_id: finalUserId,
        session_id: finalSessionId,
        ip_address: finalIpAddress,
        user_agent: userAgent,
        view_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
      })
      .select()
      .single();

    if (error) {
      // 重複エラーの場合は無視（同日の重複閲覧）
      if (error.code === '23505') {
        console.log('閲覧記録: 既に記録済み（重複閲覧）', { blogId, userId: finalUserId, sessionId: finalSessionId });
        return NextResponse.json({ 
          success: true,
          message: '既に記録済み',
          duplicate: true 
        });
      }
      console.error('閲覧記録保存エラー詳細:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        blogId,
        userId: finalUserId,
        sessionId: finalSessionId,
      });
      throw error;
    }

    // blog_view_countsテーブルを直接更新（トリガーが動作しない場合のフォールバック）
    // RLSポリシーが修正されていない場合、エラーが発生する可能性がある
    try {
      // まず現在の閲覧数を取得
      const { data: currentCount, error: countError } = await supabase
        .from('blog_view_counts')
        .select('view_count, unique_view_count')
        .eq('blog_id', blogId)
        .single();

      if (countError && countError.code !== 'PGRST116') {
        // データが見つからない場合以外はエラーをログに記録
        console.warn('閲覧数取得エラー（RLSポリシーが設定されていない可能性があります）:', countError);
      }

      // ユニーク閲覧数を計算
      const { data: uniqueViews } = await supabase
        .from('blog_views')
        .select('user_id, session_id, ip_address')
        .eq('blog_id', blogId);

      const uniqueCount = new Set(
        uniqueViews?.map(v => 
          v.user_id || v.session_id || v.ip_address || 'unknown'
        ) || []
      ).size;

      // blog_view_countsテーブルを更新または作成
      const newViewCount = (currentCount?.view_count || 0) + 1;
      const { error: updateError } = await supabase
        .from('blog_view_counts')
        .upsert({
          blog_id: blogId,
          view_count: newViewCount,
          unique_view_count: uniqueCount,
          last_viewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'blog_id'
        });

      if (updateError) {
        // RLSポリシーエラーの場合は警告をログに記録
        if (updateError.message?.includes('row-level security')) {
          console.warn('閲覧数更新エラー: RLSポリシーが設定されていません。以下のSQLをSupabaseダッシュボードで実行してください:', {
            error: updateError.message,
            sql: `
DROP POLICY IF EXISTS "blog_view_counts_update_policy" ON public.blog_view_counts;
DROP POLICY IF EXISTS "blog_view_counts_insert_policy" ON public.blog_view_counts;
CREATE POLICY "blog_view_counts_insert_policy" ON public.blog_view_counts FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_view_counts_update_policy" ON public.blog_view_counts FOR UPDATE USING (true);
            `
          });
        } else {
          console.error('閲覧数更新エラー:', updateError);
        }
      }
    } catch (updateErr: any) {
      // 更新エラーはログに記録するが、閲覧記録自体は成功しているので続行
      console.warn('閲覧数更新でエラーが発生しました（閲覧記録は正常に保存されています）:', updateErr);
    }

    console.log('閲覧記録成功:', { blogId, userId: finalUserId, sessionId: finalSessionId, viewId: data?.id });
    
    return NextResponse.json({
      success: true,
      message: '閲覧記録を追加しました',
      data,
    });
  } catch (error: any) {
    console.error('閲覧記録保存エラー:', error);
    
    // エラーの詳細を返す（開発環境のみ）
    const errorMessage =
      process.env.NODE_ENV === 'development'
        ? `閲覧記録の保存に失敗しました: ${error?.message || error?.code || 'Unknown error'}`
        : '閲覧記録の保存に失敗しました';

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' 
          ? {
              message: error?.message,
              code: error?.code,
              details: error?.details,
              hint: error?.hint,
            }
          : undefined,
      },
      { status: 500 }
    );
  }
}
