'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminGuard } from '@/components/AdminGuard';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getIdeaById, adminUpdateIdea } from '@/lib/supabase/ideas';
import { Database } from '@/lib/supabase/types';

type Idea = Database['public']['Tables']['ideas']['Row'] & {
  profiles: {
    display_name: string;
    role: string;
  } | null;
};

// 管理者用アイデア編集フォームスキーマ
const adminIdeaEditSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  summary: z
    .string()
    .min(20, '概要は20文字以上で入力してください')
    .max(300, '概要は300文字以内で入力してください'),
  detail: z.string().optional(),
  status: z.enum(['published', 'closed', 'overdue']),
  price: z
    .union([
      z.string().transform((val) => {
        if (val === 'none' || val === '') {
          return undefined;
        }
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? undefined : parsed;
      }),
      z.number(),
    ])
    .optional()
    .transform((val) => (val === undefined ? undefined : val)) as z.ZodType<
    number | undefined
  >,
  special: z
    .string()
    .max(500, '特別設定は500文字以内で入力してください')
    .optional(),
  deadline: z.string().optional(),
});

type AdminIdeaEditFormData = z.infer<typeof adminIdeaEditSchema>;

export default function AdminIdeaSubmitPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [ideaId, setIdeaId] = useState<string>('');

  // Next.js 15対応：paramsがPromiseの場合
  useEffect(() => {
    const getParams = async () => {
      try {
        const resolvedParams = await params;

        const id =
          typeof resolvedParams.id === 'string'
            ? resolvedParams.id
            : Array.isArray(resolvedParams.id)
              ? resolvedParams.id[0]
              : '';

        setIdeaId(id);
      } catch (error) {
        console.error('Error getting params:', error);
        // fallback: URLから直接取得
        const urlId =
          typeof window !== 'undefined'
            ? window.location.pathname.split('/').pop()
            : '';
        setIdeaId(urlId || '');
      }
    };

    getParams();
  }, [params]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AdminIdeaEditFormData>({
    // @ts-ignore - zodResolverの型推論の問題を回避
    resolver: zodResolver(adminIdeaEditSchema),
    defaultValues: {
      title: '',
      summary: '',
      detail: '',
      status: 'published',
      price: undefined,
      special: '',
      deadline: '',
    },
  });

  // アイデアデータの取得
  useEffect(() => {
    const fetchIdea = async () => {
      if (!ideaId) return;

      try {
        setIsLoading(true);

        const { data: ideaData, error } = await getIdeaById(ideaId);

        if (error) {
          toast({
            title: 'エラー',
            description: 'アイデアの取得に失敗しました。',
            variant: 'destructive',
          });
          router.push('/admin');
          return;
        }

        if (!ideaData) {
          toast({
            title: 'エラー',
            description: 'アイデアが見つかりませんでした。',
            variant: 'destructive',
          });
          router.push('/admin');
          return;
        }

        setIdea(ideaData);

        // フォームに既存データを設定
        reset({
          title: ideaData.title,
          summary: ideaData.summary,
          detail: ideaData.detail || '',
          status: ideaData.status,
          price: ideaData.price ? ideaData.price : undefined,
          special: ideaData.special || '',
          deadline: ideaData.deadline ? ideaData.deadline.split('T')[0] : '',
        });
      } catch (error) {
        console.error('アイデア取得エラー:', error);
        toast({
          title: 'エラー',
          description: '予期しないエラーが発生しました。',
          variant: 'destructive',
        });
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    if (ideaId) {
      fetchIdea();
    }
  }, [ideaId, reset, toast, router]);

  const onSubmit = async (data: AdminIdeaEditFormData) => {
    try {
      setIsSubmitting(true);

      // 更新データの準備
      const updateData = {
        title: data.title,
        summary: data.summary,
        detail: data.detail || null,
        status: data.status,
        price: data.price || null,
        special: data.special || null,
        deadline: data.deadline || null,
        updated_at: new Date().toISOString(),
      };

      // 管理者用APIで更新
      const { data: updatedIdea, error } = await adminUpdateIdea(
        ideaId,
        updateData
      );

      if (error) {
        console.error('管理者更新エラー詳細:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      // 成功メッセージ
      toast({
        title: 'アイデアを更新しました！',
        description: `${updatedIdea?.title || 'アイデア'}を正常に更新しました。`,
      });

      // 管理者ページに戻る
      router.push('/admin');
    } catch (error) {
      console.error('管理者アイデア更新エラー:', error);

      // エラーの詳細を取得
      let errorMessage = 'しばらく時間をおいて再度お試しください。';

      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = String(error.message);
        } else if ('details' in error) {
          errorMessage = String(error.details);
        } else if ('hint' in error) {
          errorMessage = String(error.hint);
        }
      }

      toast({
        title: '更新に失敗しました',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ローディング状態
  if (isLoading) {
    return (
      <AdminGuard>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">アイデア情報を読み込み中...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  // アイデアが見つからない場合
  if (!idea) {
    return (
      // <AdminGuard> {/* 一時的に無効化してデバッグ */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">
                アイデアが見つかりません
              </h3>
              <p className="text-muted-foreground mb-4">
                指定されたIDのアイデアが存在しないか、アクセス権限がありません。
                <br />
                現在のID: {ideaId}
              </p>
              <Button onClick={() => router.push('/admin')}>
                管理者ページに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      // </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                管理者ページに戻る
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Save className="h-8 w-8" />
            管理者：最終アイデア修正
          </h1>
          <p className="text-muted-foreground">
            管理者権限でアイデアの内容を編集します。
          </p>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">アイデアID:</span>
                <span className="ml-2 text-blue-700">{idea.mmb_no}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">作成者:</span>
                <span className="ml-2 text-blue-700">
                  {idea.profiles?.display_name || '不明'}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-900">作成日:</span>
                <span className="ml-2 text-blue-700">
                  {new Date(idea.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-900">
                  現在のステータス:
                </span>
                <span className="ml-2 text-blue-700">{idea.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* @ts-ignore - handleSubmitの型推論の問題を回避 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>
                アイデアの基本的な情報を編集してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* タイトル */}
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  placeholder="アイデアのタイトルを入力"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {String(errors.title?.message || '')}
                  </p>
                )}
              </div>

              {/* 概要 */}
              <div className="space-y-2">
                <Label htmlFor="summary">概要 *</Label>
                <Textarea
                  id="summary"
                  placeholder="アイデアの簡潔な説明を入力してください（20文字以上、300文字以内）"
                  rows={4}
                  {...register('summary')}
                />
                <div className="text-sm text-muted-foreground">
                  {watch('summary')?.length || 0} / 300文字
                </div>
                {errors.summary && (
                  <p className="text-sm text-destructive">
                    {String(errors.summary?.message || '')}
                  </p>
                )}
              </div>

              {/* 詳細 */}
              <div className="space-y-2">
                <Label htmlFor="detail">詳細説明</Label>
                <Textarea
                  id="detail"
                  placeholder="アイデアの詳細な説明を入力してください"
                  rows={8}
                  {...register('detail')}
                />
                <div className="text-sm text-muted-foreground">
                  {watch('detail')?.length || 0}文字
                </div>
              </div>

              {/* ステータス */}
              <div className="space-y-2">
                <Label htmlFor="status">ステータス *</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value: 'published' | 'closed' | 'overdue') =>
                    setValue('status', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">公開中</SelectItem>
                    <SelectItem value="closed">完了</SelectItem>
                    <SelectItem value="overdue">期限切れ</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">
                    {String(errors.status?.message || '')}
                  </p>
                )}
              </div>

              {/* 価格設定 */}
              <div className="space-y-2">
                <Label htmlFor="price">価格設定</Label>
                <Select
                  value={watch('price') ? String(watch('price')) : 'none'}
                  onValueChange={value => {
                    setValue(
                      'price',
                      value === 'none'
                        ? undefined
                        : parseInt(value, 10)
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="価格を選択（任意）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">設定なし</SelectItem>
                    <SelectItem value="10000">10,000円</SelectItem>
                    <SelectItem value="30000">30,000円</SelectItem>
                    <SelectItem value="50000">50,000円</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  投稿者設定金額を設定できます（最終アイデア作成時の計算に使用されます）。
                </div>
              </div>

              {/* 特別設定 */}
              <div className="space-y-2">
                <Label htmlFor="special">特別設定・備考</Label>
                <Textarea
                  id="special"
                  placeholder="特別な設定や備考情報を入力してください"
                  rows={3}
                  {...register('special')}
                />
                <div className="text-sm text-muted-foreground">
                  {watch('special')?.length || 0} / 500文字
                </div>
                {errors.special && (
                  <p className="text-sm text-destructive">
                    {String(errors.special?.message || '')}
                  </p>
                )}
              </div>

              {/* 議論期限 */}
              <div className="space-y-2">
                <Label htmlFor="deadline">議論期限（任意）</Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register('deadline')}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  議論期限を設定すると、その日付までコメントを受け付けます。
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '更新中...' : 'アイデアを更新する'}
            </Button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}
