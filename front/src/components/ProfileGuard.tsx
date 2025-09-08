'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/StableAuthContext';

interface ProfileGuardProps {
  children: React.ReactNode;
}

/**
 * ユーザーのプロフィール完了状況をチェックし、
 * 未完了の場合はプロフィール登録ページにリダイレクトするコンポーネント
 */
export default function ProfileGuard({ children }: ProfileGuardProps) {
  const { user, hasCompleteProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  // プロフィール登録関連のページはリダイレクト対象外
  const excludedPaths = [
    '/profile',
    '/login',
    '/signup',
    '/auth',
    '/about',
    '/debug',
  ];

  useEffect(() => {
    if (loading) return; // 認証状態の読み込み中は何もしない
    if (hasRedirected) return; // 既にリダイレクト済みの場合は何もしない

    // ユーザーがログインしている場合のみチェック
    if (user && !hasCompleteProfile) {
      // 除外対象のパスでない場合のみリダイレクト
      const isExcludedPath = excludedPaths.some(path =>
        pathname.startsWith(path)
      );

      if (!isExcludedPath && pathname !== '/profile' && !hasRedirected) {
        setHasRedirected(true);
        router.push('/profile');
      }
    }
  }, [user, hasCompleteProfile, loading, pathname, hasRedirected, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // パスが変更されたらリダイレクトフラグをリセット
  useEffect(() => {
    setHasRedirected(false);
  }, [pathname]);

  // 認証状態読み込み中の場合はローディング表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  // ログインしているがプロフィールが未完了で、除外対象でないパスの場合は何も表示しない
  // （リダイレクト処理が実行される）
  if (user && !hasCompleteProfile && !hasRedirected) {
    const isExcludedPath = excludedPaths.some(path =>
      pathname.startsWith(path)
    );
    if (!isExcludedPath) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>プロフィール登録ページに移動中...</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
