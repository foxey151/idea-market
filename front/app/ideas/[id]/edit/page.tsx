"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { IdeaEditForm } from "@/components/forms/IdeaEditForm";
import { useAuth } from "@/contexts/StableAuthContext";
import { getIdeaById } from "@/lib/supabase/ideas";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function IdeaEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const ideaId = params.id as string;
  const [statusCheckLoading, setStatusCheckLoading] = useState(true);
  const [showStatusError, setShowStatusError] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      router.push(`/login?redirect=${encodeURIComponent(`/ideas/${ideaId}/edit`)}`);
      return;
    }

    if (user && ideaId) {
      checkIdeaStatus();
    }
  }, [user, loading, router, ideaId]);

  const checkIdeaStatus = async () => {
    try {
      setStatusCheckLoading(true);
      const { data: idea, error } = await getIdeaById(ideaId);

      if (error) {
        console.error('アイデア取得エラー:', error);
        toast({
          title: "エラー",
          description: "アイデアの取得に失敗しました。",
          variant: "destructive",
        });
        router.push('/ideas');
        return;
      }

      if (!idea) {
        toast({
          title: "エラー",
          description: "アイデアが見つかりませんでした。",
          variant: "destructive",
        });
        router.push('/ideas');
        return;
      }

      // 作成者チェック
      if (idea.author_id !== user?.id) {
        toast({
          title: "権限エラー",
          description: "このアイデアの編集権限がありません。",
          variant: "destructive",
        });
        router.push('/ideas');
        return;
      }

      // ステータスチェック
      if (idea.status !== 'published') {
        setShowStatusError(true);
        return;
      }

      setCanEdit(true);
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました。",
        variant: "destructive",
      });
      router.push('/ideas');
    } finally {
      setStatusCheckLoading(false);
    }
  };

  const handleStatusErrorClose = () => {
    setShowStatusError(false);
    router.back();
  };

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

  // ステータスチェック中
  if (statusCheckLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">アイデアの状態を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ステータスエラーダイアログ */}
      <AlertDialog open={showStatusError} onOpenChange={setShowStatusError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>編集できません</AlertDialogTitle>
            <AlertDialogDescription>
              このアイデアは現在編集できない状態です。期限切れや終了したアイデアは編集することができません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleStatusErrorClose}>
              前のページに戻る
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 編集可能な場合のみ表示 */}
      {canEdit && (
        <div className="min-h-screen bg-gradient-subtle">
          <div className="container mx-auto py-8">
            <IdeaEditForm ideaId={ideaId} />
          </div>
        </div>
      )}
    </>
  );
}
