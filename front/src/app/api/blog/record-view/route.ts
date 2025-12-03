import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
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

    const supabase = createClient();

    // IPアドレスとUser-Agentを取得
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0]
      : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 閲覧記録を追加（view_dateを追加）
    const { data, error } = await supabase
      .from('blog_views')
      .insert({
        blog_id: blogId,
        user_id: userId,
        session_id: sessionId,
        ip_address: ip,
        user_agent: userAgent,
        view_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
      })
      .select()
      .single();

    if (error) {
      // 重複エラーの場合は無視（同日の重複閲覧）
      if (error.code === '23505') {
        return NextResponse.json({ message: '既に記録済み' });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '閲覧記録を追加しました',
      data,
    });
  } catch (error) {
    // エラーの詳細を返す（開発環境のみ）
    const errorMessage =
      process.env.NODE_ENV === 'development'
        ? `閲覧記録の保存に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
        : '閲覧記録の保存に失敗しました';

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
