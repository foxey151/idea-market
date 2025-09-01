"use client"

import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EnvCheck() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (hasSupabaseUrl && hasSupabaseKey) {
    return null // 環境変数が正しく設定されている場合は何も表示しない
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4 text-destructive">環境変数の設定が必要です</h2>
        
        <Alert className="mb-4">
          <AlertDescription>
            Supabaseの環境変数が設定されていません。以下の手順で設定してください。
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-medium">手順:</h3>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>プロジェクトルートに <code className="bg-muted px-1 rounded">.env.local</code> ファイルを作成</li>
              <li>以下の内容をファイルに追加:</li>
            </ol>
          </div>

          <div className="bg-muted p-3 rounded text-xs font-mono">
            <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</div>
          </div>

          <div>
            <h3 className="font-medium">現在の状態:</h3>
            <ul className="space-y-1 mt-2">
              <li className={hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}>
                NEXT_PUBLIC_SUPABASE_URL: {hasSupabaseUrl ? '✓ 設定済み' : '✗ 未設定'}
              </li>
              <li className={hasSupabaseKey ? 'text-green-600' : 'text-red-600'}>
                NEXT_PUBLIC_SUPABASE_ANON_KEY: {hasSupabaseKey ? '✓ 設定済み' : '✗ 未設定'}
              </li>
            </ul>
          </div>

          <div className="text-xs text-muted-foreground">
            設定後、開発サーバーを再起動してください。
          </div>
        </div>
      </div>
    </div>
  )
}
