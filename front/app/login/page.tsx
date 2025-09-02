"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/StableAuthContext";

// useSearchParamsを使用する部分を分離
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    // ローディング中は何もしない
    if (loading) return;

    // 既にログイン済みの場合はリダイレクト
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  // ローディング中またはログイン済みの場合は表示しない
  if (loading || user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? "認証状態を確認中..." : "リダイレクト中..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">ページを読み込み中...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
