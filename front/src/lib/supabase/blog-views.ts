import { supabase } from './client';

// 閲覧記録を追加
export async function recordBlogView(blogId: string, sessionId?: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // セッションIDが提供されていない場合は生成
    const finalSessionId = sessionId || generateSessionId();

    // API Route経由で閲覧記録を追加
    const response = await fetch('/api/blog/record-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blogId,
        userId: user?.id || null,
        sessionId: finalSessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '閲覧記録の追加に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('閲覧記録エラー:', error);
    throw error;
  }
}

// ブログ記事の閲覧数を取得
export async function getBlogViewCount(blogId: string) {
  try {
    const { data, error } = await supabase
      .from('blog_view_counts')
      .select('view_count, unique_view_count, last_viewed_at')
      .eq('blog_id', blogId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // データが見つからない場合以外はエラー
      console.error('閲覧数取得エラー:', error);
      throw error;
    }

    return (
      data || { view_count: 0, unique_view_count: 0, last_viewed_at: null }
    );
  } catch (error) {
    console.error('閲覧数取得エラー:', error);
    return { view_count: 0, unique_view_count: 0, last_viewed_at: null };
  }
}

// 複数のブログ記事の閲覧数を一括取得
export async function getBlogViewCounts(blogIds: string[]) {
  try {
    const { data, error } = await supabase
      .from('blog_view_counts')
      .select('blog_id, view_count, unique_view_count, last_viewed_at')
      .in('blog_id', blogIds);

    if (error) {
      console.error('閲覧数一括取得エラー:', error);
      throw error;
    }

    // blogIds配列の順序に合わせて結果を整理
    return blogIds.map(blogId => {
      const viewData = data?.find(
        (item: BlogViewCountRecord) => item.blog_id === blogId
      );
      return {
        blog_id: blogId,
        view_count: viewData?.view_count || 0,
        unique_view_count: viewData?.unique_view_count || 0,
        last_viewed_at: viewData?.last_viewed_at || null,
      };
    });
  } catch (error) {
    console.error('閲覧数一括取得エラー:', error);
    // エラーの場合はデフォルト値で配列を返す
    return blogIds.map(blogId => ({
      blog_id: blogId,
      view_count: 0,
      unique_view_count: 0,
      last_viewed_at: null,
    }));
  }
}

// 人気記事を取得（閲覧数順）
export async function getPopularBlogs(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('blog_view_counts')
      .select('blog_id, view_count, unique_view_count')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('人気記事取得エラー:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('人気記事取得エラー:', error);
    return [];
  }
}

// セッションIDを生成
function generateSessionId(): string {
  // ブラウザ環境でのみ実行
  if (typeof window === 'undefined') {
    // サーバーサイドではランダムなIDを生成（通常は呼ばれないはず）
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // セッションストレージから既存のIDを取得、なければ新規作成
  let sessionId = sessionStorage.getItem('blog_session_id');

  if (!sessionId) {
    sessionId =
      'sess_' +
      Math.random().toString(36).substr(2, 9) +
      Date.now().toString(36);
    sessionStorage.setItem('blog_session_id', sessionId);
  }

  return sessionId;
}

// 型定義
export interface BlogViewData {
  blog_id: string;
  view_count: number;
  unique_view_count: number;
  last_viewed_at: string | null;
}

export interface BlogViewCountRecord {
  blog_id: string;
  view_count: number;
  unique_view_count: number;
  last_viewed_at: string | null;
}
