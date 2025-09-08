'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getIdeaById, updateIdea } from '@/lib/supabase/ideas';
import { Database } from '@/lib/supabase/types';
import { Calendar, User, Clock, Upload, X, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/StableAuthContext';
import GoogleAdsense from '@/components/GoogleAdsense';

type IdeaDetail = Database['public']['Tables']['ideas']['Row'] & {
  profiles: {
    display_name: string;
    role: string;
  } | null;
};

export default function FinalIdeaPage() {
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const ideaId = params.id as string;

  const fetchIdea = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getIdeaById(ideaId);

      if (error) {
        console.error('アイデア取得エラー:', error);
        toast({
          title: 'エラー',
          description: 'アイデアの取得に失敗しました。',
          variant: 'destructive',
        });
        router.push('/ideas');
        return;
      }

      if (!data) {
        toast({
          title: 'エラー',
          description: 'アイデアが見つかりませんでした。',
          variant: 'destructive',
        });
        router.push('/ideas');
        return;
      }

      // 作成者チェック
      if (data.author_id !== user?.id) {
        toast({
          title: '権限エラー',
          description: 'このアイデアの最終版作成権限がありません。',
          variant: 'destructive',
        });
        router.push('/ideas');
        return;
      }

      // ステータスチェック（overdueのみ許可）
      if ((data.status as any) !== 'overdue') {
        toast({
          title: 'ステータスエラー',
          description: '期限切れのアイデアのみ最終版を作成できます。',
          variant: 'destructive',
        });
        router.push('/ideas');
        return;
      }

      setIdea(data);
      // 既存のdetailがあれば設定
      if (data.detail) {
        setDetail(data.detail);
      }
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: 'エラー',
        description: '予期しないエラーが発生しました。',
        variant: 'destructive',
      });
      router.push('/ideas');
    } finally {
      setLoading(false);
    }
  }, [ideaId, user, router]);

  useEffect(() => {
    fetchIdea();
  }, [ideaId, fetchIdea]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'ログインが必要です',
        description: '最終アイデアを作成するにはログインしてください。',
        variant: 'destructive',
      });
      return;
    }

    if (!detail.trim()) {
      toast({
        title: 'エラー',
        description: '最終アイデアの詳細を入力してください。',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      // TODO: ファイルアップロード処理を実装
      const attachmentPaths: string[] = [];

      const { data: _data, error } = await updateIdea(ideaId, {
        detail: detail.trim(),
        attachments: attachmentPaths,
        status: 'closed', // 最終版作成後は終了状態に
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('最終アイデア作成エラー:', error);
        toast({
          title: 'エラー',
          description: '最終アイデアの作成に失敗しました。',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '成功',
        description: '最終アイデアを作成しました。',
      });

      router.push(`/ideas/${ideaId}`);
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: 'エラー',
        description: '予期しないエラーが発生しました。',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                アイデア詳細を読み込み中...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">
                アイデアが見つかりません
              </h1>
              <p className="text-muted-foreground mb-6">
                指定されたアイデアは存在しないか、削除された可能性があります。
              </p>
              <Button onClick={() => router.push('/ideas')}>
                アイデア一覧に戻る
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              {/* アイデア詳細 */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {idea.mmb_no}
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800">
                        期限切れ
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(idea.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  <CardTitle className="text-2xl md:text-3xl mb-4">
                    {idea.title}
                  </CardTitle>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>by {idea.profiles?.display_name || 'Unknown'}</span>
                    </div>
                    {idea.deadline && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          議論期限:{' '}
                          {new Date(idea.deadline).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="prose max-w-none mb-6">
                    <h3 className="text-lg font-semibold mb-3">概要</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {idea.summary}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 最終アイデア入力フォーム */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    最終アイデア作成
                  </CardTitle>
                  <CardDescription>
                    期限切れとなったアイデアの最終版を作成してください。詳細な説明と必要に応じてファイルを添付できます。
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* 詳細説明入力 */}
                  <div className="space-y-2">
                    <Label htmlFor="detail">詳細説明 *</Label>
                    <Textarea
                      id="detail"
                      placeholder="最終アイデアの詳細説明を入力してください..."
                      value={detail}
                      onChange={e => setDetail(e.target.value)}
                      rows={10}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      技術仕様、実装方法、ビジネスモデル、収益予測などの詳細情報を記載してください。
                    </p>
                  </div>

                  {/* ファイル添付 */}
                  <div className="space-y-4">
                    <Label>ファイル添付</Label>

                    {/* ファイル選択 */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <div className="space-y-2">
                          <Label
                            htmlFor="file-upload"
                            className="cursor-pointer"
                          >
                            <span className="text-primary hover:text-primary/80">
                              ファイルを選択
                            </span>
                            <span className="text-muted-foreground">
                              {' '}
                              またはドラッグ&ドロップ
                            </span>
                          </Label>
                          <Input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF, Word, PowerPoint, Excel, 画像ファイルなど
                        </p>
                      </div>
                    </div>

                    {/* 添付ファイル一覧 */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        <Label>添付ファイル ({attachments.length})</Label>
                        <div className="space-y-2">
                          {attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 送信ボタン */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={!detail.trim() || submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          作成中...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          最終アイデアを作成
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/ideas/${ideaId}`)}
                    >
                      キャンセル
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* サイドバー（広告エリア） */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* メイン広告 */}
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                    スポンサー
                  </h3>
                  <GoogleAdsense
                    adSlot="7718612763"
                    style={{
                      display: 'block',
                      minHeight: '300px',
                      width: '100%',
                    }}
                  />
                </Card>

                {/* 関連情報カード */}
                <Card className="p-4">
                  <h3 className="text-sm font-medium mb-3">
                    このアイデアについて
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                      投稿日:{' '}
                      {new Date(idea.created_at).toLocaleDateString('ja-JP')}
                    </div>
                    <div>ステータス: 期限切れ</div>
                    {idea.deadline && (
                      <div>
                        議論期限:{' '}
                        {new Date(idea.deadline).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
