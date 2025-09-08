'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IdeaCreateForm } from '@/components/forms/IdeaCreateForm';
import { useAuth } from '@/contexts/StableAuthContext';

export default function IdeaCreatePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login?redirect=' + encodeURIComponent('/ideas/new'));
      return;
    }
  }, [user, loading, router]);

  // 認証チェック中またはログインしていない場合
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading
              ? '認証状態を確認中...'
              : 'ログインページにリダイレクト中...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-8">
        <IdeaCreateForm />
      </div>
    </div>
  );
}
