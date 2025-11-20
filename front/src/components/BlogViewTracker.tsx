'use client';

import { useEffect } from 'react';
import { recordBlogView } from '@/lib/supabase/blog-views';

interface BlogViewTrackerProps {
  blogId: string;
}

export function BlogViewTracker({ blogId }: BlogViewTrackerProps) {
  useEffect(() => {
    // セッションストレージから既読チェック
    const viewedKey = `blog_viewed_${blogId}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasViewed) {
      // 少し遅延させて閲覧記録
      const timer = setTimeout(async () => {
        try {
          await recordBlogView(blogId);
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
