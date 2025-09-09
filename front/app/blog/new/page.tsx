'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

interface BlogCreateData {
  title: string;
  content: string;
  publishedAt?: string;
  status: 'PUBLISH' | 'DRAFT';
}

export default function BlogNewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BlogCreateData>({
    title: '',
    content: '',
    status: 'DRAFT',
  });
  const [preview, setPreview] = useState(false);

  const handleSubmit = async (status: 'PUBLISH' | 'DRAFT') => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'エラー',
        description: 'タイトルと内容は必須です',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        status,
        publishedAt: status === 'PUBLISH' ? new Date().toISOString() : undefined,
      };

      console.log('送信データ:', submitData);

      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      console.log('APIレスポンス:', result);

      if (!response.ok) {
        throw new Error(result.error || 'ブログ記事の作成に失敗しました');
      }

      toast({
        title: '成功',
        description: `ブログ記事が${status === 'PUBLISH' ? '公開' : '下書き保存'}されました`,
      });

      // 作成された記事の詳細ページにリダイレクト
      if (result.blogId) {
        router.push(`/blog/${result.blogId}`);
      } else {
        router.push('/blog');
      }
    } catch (error: any) {
      console.error('ブログ作成エラー:', error);
      toast({
        title: 'エラー',
        description: error.message || 'ブログ記事の作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BlogCreateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ブログ一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新しい記事を作成</h1>
          <p className="text-gray-600 mt-2">新しいブログ記事を作成しましょう</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* メインフォーム */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>記事の詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* タイトル */}
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="記事のタイトルを入力してください"
                    className="text-lg"
                  />
                </div>

                {/* 内容 */}
                <div className="space-y-2">
                  <Label htmlFor="content">内容 *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="記事の内容をHTMLで入力してください..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500">
                    HTMLタグを使用して記事を書くことができます。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-4 space-y-6">
            {/* プレビュー */}
            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle>プレビュー</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="text-xl font-bold mb-3">
                      {formData.title || 'タイトルなし'}
                    </h3>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: formData.content || '<p>内容がありません</p>',
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* アクション */}
            <Card>
              <CardHeader>
                <CardTitle>アクション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setPreview(!preview)}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {preview ? 'プレビューを閉じる' : 'プレビューを表示'}
                </Button>

                <Button
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? '保存中...' : '下書き保存'}
                </Button>

                <Button
                  onClick={() => handleSubmit('PUBLISH')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? '公開中...' : '公開する'}
                </Button>
              </CardContent>
            </Card>

            {/* 記事情報 */}
            <Card>
              <CardHeader>
                <CardTitle>記事情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">文字数:</span>
                    <span>{formData.content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ステータス:</span>
                    <span className="capitalize">{formData.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
