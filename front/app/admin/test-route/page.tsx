'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TestRoutePage() {
  const router = useRouter();
  const params = useParams();
  const [resolvedParams, setResolvedParams] = useState<any>(null);

  useEffect(() => {
    const getParams = async () => {
      try {
        const resolved = await params;
        setResolvedParams(resolved);
        console.log('Resolved params:', resolved);
        console.log('Current URL:', window.location.href);
      } catch (error) {
        console.error('Error resolving params:', error);
        setResolvedParams({
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    getParams();
  }, [params]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">ルーティングテスト</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">現在の情報:</h2>
        <p>
          <strong>URL:</strong>{' '}
          {typeof window !== 'undefined' ? window.location.href : 'N/A'}
        </p>
        <p>
          <strong>Pathname:</strong>{' '}
          {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Params情報:</h2>
        <pre className="text-sm">{JSON.stringify(resolvedParams, null, 2)}</pre>
      </div>

      <div className="space-x-2">
        <button
          onClick={() => router.push('/admin')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          管理者ページに戻る
        </button>

        <button
          onClick={() => router.push('/admin/123/submit')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          /admin/123/submit に移動
        </button>
      </div>
    </div>
  );
}
