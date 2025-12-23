'use client';

import { useEffect } from 'react';
import { recordBlogView } from '@/lib/supabase/blog-views';

interface BlogViewTrackerProps {
  blogId: string;
}

// セッションIDを生成または取得
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    // サーバーサイドでは実行されないはずだが、念のため
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  let sessionId = sessionStorage.getItem('blog_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    sessionStorage.setItem('blog_session_id', sessionId);
  }
  return sessionId;
}

export function BlogViewTracker({ blogId }: BlogViewTrackerProps) {
  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined') {
      return;
    }

    // セッションストレージから既読チェック
    const viewedKey = `blog_viewed_${blogId}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasViewed) {
      // セッションIDを取得
      const sessionId = getOrCreateSessionId();

      // 少し遅延させて閲覧記録
      const timer = setTimeout(async () => {
        try {
          await recordBlogView(blogId, sessionId);
          sessionStorage.setItem(viewedKey, 'true');
        } catch (error) {
          console.error('閲覧記録失敗:', error);
          // エラーが発生してもユーザー体験に影響しないよう、セッションストレージには記録
          sessionStorage.setItem(viewedKey, 'error');
        }
      }, 2000); // 2秒後に記録

      return () => clearTimeout(timer);
    }
  }, [blogId]);

  return null; // UIは表示しない
}
