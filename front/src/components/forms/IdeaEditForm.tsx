'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { X, Upload, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/StableAuthContext';
import { getIdeaById, updateIdea } from '@/lib/supabase/ideas';
import { Database } from '@/lib/supabase/types';
import { uploadFiles, validateFile } from '@/lib/supabase/storage';
import { validateNoProfanity } from '@/lib/utils/profanity-filter';

type Idea = Database['public']['Tables']['ideas']['Row'];

// アイデア編集フォームスキーマ
const ideaEditSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください')
    .refine(
      (text: string) => validateNoProfanity(text).valid,
      {
        message: '不適切な言葉が含まれています。内容を確認してください。',
      }
    ),
  summary: z
    .string()
    .min(20, '概要は20文字以上で入力してください')
    .max(300, '概要は300文字以内で入力してください')
    .refine(
      (text: string) => validateNoProfanity(text).valid,
      {
        message: '不適切な言葉が含まれています。内容を確認してください。',
      }
    ),
  deadline: z
    .string()
    .optional()
    .refine(value => {
      if (!value) return true; // 任意フィールドなので空でもOK
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 今日の00:00:00に設定
      return selectedDate > today;
    }, '議論期限は明日以降の日付を選択してください'),
  termsAgreed: z
    .boolean()
    .refine(val => val === true, '利用規約に同意してください'),
});

type IdeaEditFormData = z.infer<typeof ideaEditSchema>;

interface IdeaEditFormProps {
  ideaId: string;
}

export function IdeaEditForm({ ideaId }: IdeaEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [originalIdea, setOriginalIdea] = useState<Idea | null>(null);

  // 明日の日付を最小値として設定
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // 明日
    return tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD形式
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<IdeaEditFormData>({
    resolver: zodResolver(ideaEditSchema),
    defaultValues: {
      title: '',
      summary: '',
      deadline: '',
      termsAgreed: false,
    },
  });

  // アイデアデータの取得と認証チェック
  useEffect(() => {
    const fetchIdea = async () => {
      try {
        setIsLoading(true);

        const { data: ideaData, error } = await getIdeaById(ideaId);

        if (error) {
          toast({
            title: 'エラー',
            description: 'アイデアの取得に失敗しました。',
            variant: 'destructive',
          });
          router.push('/ideas');
          return;
        }

        if (!ideaData) {
          toast({
            title: 'エラー',
            description: 'アイデアが見つかりませんでした。',
            variant: 'destructive',
          });
          router.push('/ideas');
          return;
        }

        // 作成者のみ編集可能
        if (user && ideaData.author_id !== user.id) {
          toast({
            title: '権限エラー',
            description: 'このアイデアの編集権限がありません。',
            variant: 'destructive',
          });
          router.push('/ideas');
          return;
        }

        setOriginalIdea(ideaData);

        // フォームに既存データを設定
        reset({
          title: ideaData.title,
          summary: ideaData.summary,
          deadline: ideaData.deadline ? ideaData.deadline.split('T')[0] : '',
          termsAgreed: false, // 編集時は再度同意が必要
        });
      } catch (error) {
        console.error('アイデア取得エラー:', error);
        toast({
          title: 'エラー',
          description: '予期しないエラーが発生しました。',
          variant: 'destructive',
        });
        router.push('/ideas');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && ideaId) {
      fetchIdea();
    }
  }, [user, ideaId, reset, toast, router]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // ファイルバリデーション
    const validFiles: File[] = [];
    const errorMessages: string[] = [];

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errorMessages.push(`${file.name}: ${validation.error}`);
      }
    });

    // エラーメッセージ表示
    if (errorMessages.length > 0) {
      toast({
        title: 'ファイルエラー',
        description: errorMessages.join('\n'),
        variant: 'destructive',
      });
    }

    // 有効なファイルのみ追加
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }

    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: IdeaEditFormData) => {
    try {
      setIsSubmitting(true);

      if (!user || !originalIdea) {
        toast({
          title: 'エラー',
          description: '認証情報またはアイデア情報が不正です。',
          variant: 'destructive',
        });
        return;
      }

      // 権限チェック
      if (originalIdea.author_id !== user.id) {
        toast({
          title: '権限エラー',
          description: 'このアイデアの編集権限がありません。',
          variant: 'destructive',
        });
        return;
      }

      // ファイルアップロード処理
      let newAttachments: string[] = [];
      if (uploadedFiles.length > 0) {
        try {
          const { data: uploadData, error: uploadError } =
            await uploadFiles(uploadedFiles);

          if (uploadError) {
            throw new Error(`ファイルアップロードエラー: ${uploadError}`);
          }

          if (uploadData) {
            newAttachments = uploadData.map(file => file.path);
          }
        } catch (error) {
          console.error('ファイルアップロードエラー:', error);
          toast({
            title: 'ファイルアップロード失敗',
            description: '新しいファイルのアップロードに失敗しました。',
            variant: 'destructive',
          });
          return;
        }
      }

      // 更新データの準備
      const updateData = {
        title: data.title,
        summary: data.summary,
        deadline: data.deadline || null,
        updated_at: new Date().toISOString(),
        // 新しいファイルがある場合は追加（既存のファイルは保持）
        ...(newAttachments.length > 0 && {
          attachments: [
            ...(originalIdea?.attachments || []),
            ...newAttachments,
          ],
        }),
      };

      // アイデアを更新
      const { data: updatedIdea, error } = await updateIdea(ideaId, updateData);

      if (error) {
        console.error('Supabaseエラー詳細:', {
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

      // アイデア詳細ページにリダイレクト
      router.push(`/ideas/${ideaId}`);
    } catch (error) {
      console.error('アイデア更新エラー:', error);

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
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">アイデア情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  // ログインが必要
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">ログインが必要です</h3>
              <p className="text-muted-foreground mb-4">
                アイデアを編集するにはログインしてください。
              </p>
              <Button onClick={() => router.push('/login')}>
                ログインページへ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Edit className="h-8 w-8" />
          アイデア編集
        </h1>
        <p className="text-muted-foreground">
          アイデアの内容を編集し、改善してください。
        </p>
        {originalIdea && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              編集中のアイデア:{' '}
              <span className="font-medium">{originalIdea.mmb_no}</span>
            </p>
          </div>
        )}
      </div>

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
                placeholder="例：AI活用の新しい学習プラットフォーム"
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
                rows={6}
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

            {/* 議論期限 */}
            <div className="space-y-2">
              <Label htmlFor="deadline">議論期限（任意）</Label>
              <Input
                id="deadline"
                type="date"
                min={getMinDate()}
                {...register('deadline')}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                議論期限を設定すると、その日付まで他のユーザーからのコメントや意見を受け付けます。
                設定しない場合は無期限で議論が可能です。
              </div>
              {errors.deadline && (
                <p className="text-sm text-destructive">
                  {String(errors.deadline?.message || '')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ファイル添付 */}
        <Card>
          <CardHeader>
            <CardTitle>ファイル添付</CardTitle>
            <CardDescription>
              関連する資料やファイルを添付できます（任意）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    ファイルをドラッグ&ドロップまたはクリックして選択
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, PNG, JPG, WEBP (最大20MB)
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">追加するファイル:</p>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 確認・同意 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termsAgreed"
                  onCheckedChange={checked =>
                    setValue('termsAgreed', !!checked)
                  }
                />
                <Label htmlFor="termsAgreed" className="text-sm">
                  <span className="text-destructive">*</span>
                  編集内容について
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:underline mx-1"
                  >
                    利用規約
                  </Link>
                  に同意する
                </Label>
              </div>
              {errors.termsAgreed && (
                <p className="text-sm text-destructive">
                  {String(errors.termsAgreed?.message || '')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/ideas/${ideaId}`)}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '更新中...' : 'アイデアを更新する'}
          </Button>
        </div>
      </form>
    </div>
  );
}
