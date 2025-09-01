"use client"

import { useAuth } from '@/contexts/StableAuthContext'

export default function DebugPage() {
  const { user, loading, hasCompleteProfile, userDetails } = useAuth()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">デバッグページ</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">認証状態</h2>
          <p>Loading: {loading ? 'true' : 'false'}</p>
          <p>User: {user ? user.email : 'null'}</p>
          <p>Has Complete Profile: {hasCompleteProfile ? 'true' : 'false'}</p>
          <p>User Details: {userDetails ? 'あり' : 'なし'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">環境変数</h2>
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定'}</p>
          <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">詳細情報</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify({
              user: user ? { id: user.id, email: user.email } : null,
              userDetails: userDetails,
              loading,
              hasCompleteProfile
            }, null, 2)}
          </pre>
        </div>

        {loading && (
          <div className="p-4 border border-yellow-500 rounded bg-yellow-50">
            <p>認証状態を確認中...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mt-2"></div>
          </div>
        )}

        {!loading && (
          <div className="p-4 border border-green-500 rounded bg-green-50">
            <p className="text-green-700">AuthContext が正常に動作しています！</p>
          </div>
        )}
      </div>
    </div>
  )
}
