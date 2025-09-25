'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { AdminGuard } from '@/components/AdminGuard';

interface OverdueUpdateResult {
  success: boolean;
  message: string;
  data?: {
    updatedCount: number;
    updatedIdeas: Array<{
      id: string;
      title: string;
      deadline: string;
      author_id: string;
    }>;
    timestamp: string;
  };
  error?: string;
}

export default function AdminOverduePage() {
  const [updating, setUpdating] = useState(false);
  const [lastResult, setLastResult] = useState<OverdueUpdateResult | null>(
    null
  );

  const handleUpdateOverdue = async () => {
    try {
      setUpdating(true);
      setLastResult(null);

      const response = await fetch('/api/overdue/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: OverdueUpdateResult = await response.json();

      if (response.ok && result.success) {
        setLastResult(result);
        toast({
          title: '成功',
          description: `${result.data?.updatedCount || 0}件の期限切れアイデアを更新しました`,
        });
      } else {
        toast({
          title: 'エラー',
          description: result.message || '期限切れアイデアの更新に失敗しました',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('期限切れ更新エラー:', error);
      toast({
        title: 'エラー',
        description: '予期しないエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* ヘッダー */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  期限切れアイデア管理
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                期限切れのアイデアを自動的に検出し、ステータスを更新します
              </p>
            </div>

            {/* 実行ボタン */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  手動実行
                </CardTitle>
                <CardDescription>
                  期限切れアイデアのステータスを今すぐ更新します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleUpdateOverdue}
                    disabled={updating}
                    className="flex items-center gap-2"
                  >
                    {updating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        更新中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        期限切れアイデアを更新
                      </>
                    )}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 inline mr-1" />
                    自動実行: 6時間ごと
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 実行結果 */}
            {lastResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {lastResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    実行結果
                  </CardTitle>
                  <CardDescription>
                    {new Date(lastResult.data?.timestamp || '').toLocaleString(
                      'ja-JP'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">ステータス:</span>
                      <Badge
                        variant={lastResult.success ? 'default' : 'destructive'}
                      >
                        {lastResult.success ? '成功' : '失敗'}
                      </Badge>
                    </div>

                    {lastResult.data && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            更新されたアイデア数:
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {lastResult.data.updatedCount}件
                          </span>
                        </div>

                        {lastResult.data.updatedCount > 0 && (
                          <div className="space-y-2">
                            <span className="font-medium">
                              更新されたアイデア:
                            </span>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {lastResult.data.updatedIdeas.map(idea => (
                                <div
                                  key={idea.id}
                                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                >
                                  <span className="truncate flex-1">
                                    {idea.title}
                                  </span>
                                  <span className="text-muted-foreground ml-2">
                                    {idea.deadline
                                      ? new Date(
                                          idea.deadline
                                        ).toLocaleDateString('ja-JP')
                                      : '期限なし'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {lastResult.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800 text-sm">
                          {lastResult.error}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 情報カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">自動実行設定</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 実行間隔: 6時間ごと</li>
                    <li>• 実行時間: 毎時0分</li>
                    <li>• 対象: 公開中の期限切れアイデア</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">対象となるアイデア</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• ステータス: published</li>
                    <li>• 期限切れ: deadline 現在時刻</li>
                    <li>• または: deadlineがnull</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
