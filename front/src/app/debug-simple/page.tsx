'use client';

import { useAuth } from '@/contexts/StableAuthContext';

export default function DebugSimplePage() {
  const { loading, user } = useAuth();
  const error = null; // StableAuthContextではerrorプロパティはないため

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">認証デバッグページ</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">認証状態 (Stable)</h2>
          <p>Loading: {loading ? 'true' : 'false'}</p>
          <p>User: {user ? 'あり' : 'なし'}</p>
          <p>Error: {error || 'なし'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">環境変数</h2>
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
          <p>
            Supabase URL:{' '}
            {process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定'}
          </p>
          <p>
            Supabase Key:{' '}
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定'}
          </p>
        </div>

        {loading && (
          <div className="p-4 border border-yellow-500 rounded bg-yellow-50">
            <p>初期化中...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mt-2"></div>
          </div>
        )}

        {error && (
          <div className="p-4 border border-red-500 rounded bg-red-50">
            <h3 className="font-semibold text-red-700">エラー</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="p-4 border border-green-500 rounded bg-green-50">
            <p className="text-green-700">
              初期化完了！無限ループは発生していません。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
