import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AuthCodeErrorProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AuthCodeError({
  searchParams,
}: AuthCodeErrorProps) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams.error
    ? decodeURIComponent(resolvedSearchParams.error)
    : null;

  const getErrorDescription = (error: string | null) => {
    switch (error) {
      case 'no_code':
        return 'メール認証リンクが正しく機能していません。メールの有効期限が切れているか、すでに使用済みの可能性があります。新しい認証メールをリクエストしてください。';
      case 'email_link_invalid':
        return 'メール認証リンクが無効であるか期限切れです。既にアカウントが登録済みの場合は、ログインページからログインしてください。';
      case 'no_user_data':
        return 'ユーザー情報の取得に失敗しました。';
      case 'unexpected_error':
        return '予期しないエラーが発生しました。';
      default:
        return error || 'ログイン処理中にエラーが発生しました';
    }
  };

  const getSuggestedAction = (error: string | null) => {
    switch (error) {
      case 'no_code':
        return {
          title: '新規登録をやり直す',
          href: '/signup',
          description: '新しい認証メールを送信します',
        };
      case 'email_link_invalid':
        return {
          title: 'ログインページへ',
          href: '/login',
          description: '既にアカウントが登録済みの場合はこちら',
        };
      default:
        return {
          title: 'ログインページへ',
          href: '/login',
          description: '既存アカウントでログイン',
        };
    }
  };
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
                <div className="mt-2 p-2 bg-muted rounded text-left">
                  <p className="break-all mb-2">
                    <strong>エラー:</strong> {errorMessage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    現在時刻: {new Date().toLocaleString('ja-JP')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    URL:{' '}
                    {typeof window !== 'undefined'
                      ? window.location.href
                      : 'Server-side'}
                  </p>
                </div>
              </details>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href={getSuggestedAction(errorMessage).href}>
                {getSuggestedAction(errorMessage).title}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
            {(errorMessage === 'no_code' ||
              errorMessage === 'email_link_invalid') && (
              <p className="text-xs text-muted-foreground text-center">
                {getSuggestedAction(errorMessage).description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
