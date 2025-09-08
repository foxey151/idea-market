'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    addLog('TestPage mounted');

    // 環境変数チェック
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    addLog(`Supabase URL: ${url ? 'あり' : 'なし'}`);
    addLog(`Supabase Key: ${key ? 'あり' : 'なし'}`);

    return () => {
      addLog('TestPage unmounted');
    };
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">シンプルテストページ</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">基本動作テスト</h2>
          <button
            onClick={() => setCount(c => c + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            カウント: {count}
          </button>
          <button
            onClick={() => addLog('手動ログ追加')}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            ログ追加
          </button>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">環境変数</h2>
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

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">実行ログ</h2>
          <div className="bg-gray-100 p-2 rounded max-h-60 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
