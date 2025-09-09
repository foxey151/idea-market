'use client';

import { useAuth } from '@/contexts/StableAuthContext';
import { useState } from 'react';
import { testMicroCMSConnection, validateMicroCMSConfig } from '@/lib/microcms';

export default function DebugPage() {
  const { user, loading, hasCompleteProfile, userDetails } = useAuth();
  const [microCMSTest, setMicroCMSTest] = useState<{
    testing: boolean;
    result?: { success: boolean; error?: string };
  }>({ testing: false });
  
  const microCMSConfig = validateMicroCMSConfig();

  const handleTestMicroCMS = async () => {
    setMicroCMSTest({ testing: true });
    try {
      const result = await testMicroCMSConnection();
      setMicroCMSTest({ testing: false, result });
    } catch (error) {
      setMicroCMSTest({
        testing: false,
        result: { success: false, error: 'テスト実行中にエラーが発生しました' }
      });
    }
  };

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
          <div className="space-y-2">
            <p>
              Supabase URL:{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定'}
            </p>
            <p>
              Supabase Key:{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定'}
            </p>
            <hr className="my-3" />
            <h3 className="font-medium">microCMS設定</h3>
            <p>
              設定状態: {' '}
              <span className={microCMSConfig.isValid ? 'text-green-600' : 'text-red-600'}>
                {microCMSConfig.isValid ? '✅ 正常' : '❌ エラー'}
              </span>
            </p>
            <p>Service Domain: {microCMSConfig.config.serviceDomain || '未設定'}</p>
            <p>API Key: {microCMSConfig.config.apiKeyPrefix || '未設定'}</p>
            {microCMSConfig.errors.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700 font-medium">設定エラー:</p>
                <ul className="text-sm text-red-600 mt-1">
                  {microCMSConfig.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-4">microCMS接続テスト</h2>
          <button
            onClick={handleTestMicroCMS}
            disabled={microCMSTest.testing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {microCMSTest.testing ? 'テスト中...' : 'microCMS接続テスト'}
          </button>
          
          {microCMSTest.result && (
            <div className={`mt-4 p-3 rounded ${
              microCMSTest.result.success 
                ? 'bg-green-100 border border-green-500 text-green-700'
                : 'bg-red-100 border border-red-500 text-red-700'
            }`}>
              <p className="font-semibold">
                {microCMSTest.result.success ? '✅ 接続成功' : '❌ 接続失敗'}
              </p>
              {microCMSTest.result.error && (
                <p className="text-sm mt-2">{microCMSTest.result.error}</p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">詳細情報</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(
              {
                user: user ? { id: user.id, email: user.email } : null,
                userDetails: userDetails,
                loading,
                hasCompleteProfile,
              },
              null,
              2
            )}
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
            <p className="text-green-700">
              AuthContext が正常に動作しています！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
