import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface AuthCodeErrorProps {
  searchParams: {
    error?: string
  }
}

export default function AuthCodeError({ searchParams }: AuthCodeErrorProps) {
  const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null
  
  const getErrorDescription = (error: string | null) => {
    switch (error) {
      case 'no_code':
        return '認証コードが受信されませんでした。'
      case 'no_user_data':
        return 'ユーザー情報の取得に失敗しました。'
      case 'unexpected_error':
        return '予期しないエラーが発生しました。'
      default:
        return error || 'ログイン処理中にエラーが発生しました'
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>認証エラー</CardTitle>
          <CardDescription>
            ログイン処理中にエラーが発生しました
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>申し訳ございませんが、認証に失敗しました。</p>
            <p className="mt-2 font-medium text-destructive">
              {getErrorDescription(errorMessage)}
            </p>
            <p className="mt-2">再度ログインをお試しください。</p>
            {errorMessage && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer">技術的な詳細</summary>
                <p className="mt-2 p-2 bg-muted rounded text-left break-all">
                  {errorMessage}
                </p>
              </details>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">お問い合わせ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
