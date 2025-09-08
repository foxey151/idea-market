'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, ArrowRight, User } from 'lucide-react';
import { useAuth } from '@/contexts/StableAuthContext';

export default function EmailConfirmed() {
  const [loading, setLoading] = useState(true);
  const { user, hasCompleteProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ユーザー情報の読み込みを待つ
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleCompleteProfile = () => {
    router.push('/profile');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                アカウントを準備しています...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>メール確認完了</CardTitle>
          <CardDescription>アカウントの作成が完了しました</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>ようこそ、アイデアマーケットへ！</p>
            <p className="mt-2">
              メールアドレスの確認が完了し、アカウントが有効になりました。
            </p>
          </div>

          {user && !hasCompleteProfile && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    プロフィールを完成させましょう
                  </p>
                  <p className="text-blue-700 mt-1">
                    アイデアの売買を開始するために、プロフィール情報を入力してください。
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {user && !hasCompleteProfile ? (
              <>
                <Button onClick={handleCompleteProfile} className="w-full">
                  プロフィールを完成させる
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full"
                >
                  後でプロフィールを設定
                </Button>
              </>
            ) : (
              <Button onClick={handleGoHome} className="w-full">
                アイデアマーケットを始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="text-center">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              アイデアマーケットについて詳しく見る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
