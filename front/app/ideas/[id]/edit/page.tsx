"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { IdeaEditForm } from "@/components/forms/IdeaEditForm";
import { useAuth } from "@/contexts/StableAuthContext";

export default function IdeaEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const ideaId = params.id as string;

  useEffect(() => {
    if (!user && !loading) {
      router.push(`/login?redirect=${encodeURIComponent(`/ideas/${ideaId}/edit`)}`);
      return;
    }
  }, [user, loading, router, ideaId]);

  // 認証チェック中またはログインしていない場合
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? "認証状態を確認中..." : "ログインページにリダイレクト中..."}
          </p>
        </div>
      </div>
    );
  }

  // IDが無効な場合
  if (!ideaId || typeof ideaId !== 'string') {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">無効なアイデアID</h1>
          <p className="text-muted-foreground mb-6">
            指定されたアイデアが見つかりません。
          </p>
          <button
            onClick={() => router.push('/ideas')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            アイデア一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-8">
        <IdeaEditForm ideaId={ideaId} />
      </div>
    </div>
  );
}
