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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Upload, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/StableAuthContext';
import { supabase } from '@/lib/supabase/client';
import { uploadFiles, validateFile } from '@/lib/supabase/storage';
import { validateNoProfanity } from '@/lib/utils/profanity-filter';

// アイデア投稿フォームスキーマ
const ideaSchema = z.object({
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
    .min(1, '議論期限は必須です')
    .refine(value => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 今日の00:00:00に設定
      return selectedDate > today;
    }, '議論期限は明日以降の日付を選択してください'),
  termsAgreed: z
    .boolean()
    .refine(val => val === true, '利用規約に同意してください'),
  isExclusive: z.boolean(),
});

type IdeaFormData = z.infer<typeof ideaSchema>;

export function IdeaCreateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Map<number, string>>(new Map());
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 明日の日付を最小値として設定
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // 明日
    return tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD形式
  };

  // 環境変数チェック
  const supabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 10 &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 10
  );

  const defaultValues = {
    title: '',
    summary: '',
    deadline: '',
    termsAgreed: false,
    isExclusive: false,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
    defaultValues,
  });

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
      setUploadedFiles(prev => {
        const newFiles = [...prev, ...validFiles];
        
        // 画像ファイルのプレビューURLを生成
        const newPreviewUrls = new Map(previewUrls);
        validFiles.forEach((file, idx) => {
          const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
          if (isImage) {
            const fileIndex = prev.length + idx;
            const previewUrl = URL.createObjectURL(file);
            newPreviewUrls.set(fileIndex, previewUrl);
          }
        });
        setPreviewUrls(newPreviewUrls);
        
        return newFiles;
      });
      
      toast({
        title: 'ファイルを追加しました',
        description: `${validFiles.length}件のファイルが選択されました。`,
      });
    }

    // ファイル入力をリセット
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      // すべてのプレビューURLを解放
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // ファイルを削除
      const newFiles = prev.filter((_, i) => i !== index);
      
      // 残りのファイルのプレビューURLを再生成
      const newPreviewUrls = new Map<number, string>();
      newFiles.forEach((file, newIndex) => {
        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
        if (isImage) {
          const previewUrl = URL.createObjectURL(file);
          newPreviewUrls.set(newIndex, previewUrl);
        }
      });
      
      setPreviewUrls(newPreviewUrls);
      return newFiles;
    });
  };

  // クリーンアップ: コンポーネントのアンマウント時にプレビューURLを解放
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // 画像プレビューを開く
  const openImagePreview = (index: number) => {
    const file = uploadedFiles[index];
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
    if (isImage && previewUrls.get(index)) {
      setSelectedImageIndex(index);
      setIsPreviewOpen(true);
    }
  };

  // 画像プレビューを閉じる
  const closeImagePreview = () => {
    setIsPreviewOpen(false);
    setSelectedImageIndex(null);
  };

  // 前の画像に移動
  const goToPrevImage = () => {
    if (selectedImageIndex === null) return;
    const imageIndices = uploadedFiles
      .map((file, index) => {
        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
        return isImage && previewUrls.get(index) ? index : null;
      })
      .filter((index): index is number => index !== null);

    const currentIndex = imageIndices.indexOf(selectedImageIndex);
    const prevIndex =
      currentIndex > 0
        ? imageIndices[currentIndex - 1]
        : imageIndices[imageIndices.length - 1];
    setSelectedImageIndex(prevIndex);
  };

  // 次の画像に移動
  const goToNextImage = () => {
    if (selectedImageIndex === null) return;
    const imageIndices = uploadedFiles
      .map((file, index) => {
        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
        return isImage && previewUrls.get(index) ? index : null;
      })
      .filter((index): index is number => index !== null);

    const currentIndex = imageIndices.indexOf(selectedImageIndex);
    const nextIndex =
      currentIndex < imageIndices.length - 1
        ? imageIndices[currentIndex + 1]
        : imageIndices[0];
    setSelectedImageIndex(nextIndex);
  };

  const onSubmit = async (data: IdeaFormData) => {
    try {
      setIsSubmitting(true);

      // ログインユーザーのみ投稿可能に制限
      if (!user) {
        toast({
          title: 'ログインが必要です',
          description: 'アイデアを投稿するにはログインしてください。',
          variant: 'destructive',
        });
        return;
      }

      // ユーザープロフィールの存在確認と作成
      const { data: _profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // プロフィールを作成
        const { error: createError } = await supabase.from('profiles').insert([
          {
            id: user.id,
            role: 'member',
            display_name: user.email || `ユーザー${user.id.slice(0, 8)}`,
          },
        ]);

        if (createError) {
          toast({
            title: 'プロフィール作成エラー',
            description: 'ユーザープロフィールの作成に失敗しました。',
            variant: 'destructive',
          });
          return;
        }
      }

      // ファイルアップロード処理
      let attachments: string[] = [];
      if (uploadedFiles.length > 0) {
        try {
          setUploadingFiles(true);
          setUploadProgress(0);

          // 進捗付きアップロード
          const { data: uploadData, error: uploadError } =
            await uploadFiles(uploadedFiles);

          if (uploadError) {
            throw new Error(`ファイルアップロードエラー: ${uploadError}`);
          }

          if (!uploadData) {
            throw new Error('アップロードデータが空です');
          }

          // アップロードされたファイルのパスを取得
          attachments = uploadData.map(file => file.path);

          setUploadProgress(100);

          toast({
            title: 'ファイルアップロード完了',
            description: `${uploadedFiles.length}件のファイルがアップロードされました。`,
          });
        } catch (error) {
          toast({
            title: 'ファイルアップロード失敗',
            description:
              error instanceof Error
                ? error.message
                : 'ファイルのアップロードに失敗しました。',
            variant: 'destructive',
          });
          return; // アップロード失敗時は投稿を中止
        } finally {
          setUploadingFiles(false);
        }
      }

      // 投稿データの準備
      const ideaInsertData = {
        title: data.title,
        summary: data.summary,
        deadline: data.deadline, // 必須フィールドなのでそのまま使用
        status: 'published' as const,
        author_id: user.id,
        attachments: attachments, // アップロードされたファイルパスを追加
        is_exclusive: data.isExclusive || false,
        purchase_count: 0,
      };

      // アイデアをデータベースに保存
      const { data: ideaData, error } = await supabase
        .from('ideas')
        .insert([ideaInsertData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // CMT番号の表示と成功メッセージ
      toast({
        title: 'アイデアを投稿しました！',
        description: `MMB番号: ${ideaData.mmb_no}が発行されました。`,
      });

      // アイデア一覧ページにリダイレクト
      router.push('/ideas');
    } catch (error) {
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
        title: '投稿に失敗しました',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">アイデア登録</h1>
        <p className="text-muted-foreground">
          新しいアイデアを投稿して、コミュニティと共有しましょう。
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Supabase設定エラー */}
        {!supabaseConfigured && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-destructive">
                  環境設定エラー
                </h3>
                <p className="text-muted-foreground mb-4">
                  Supabaseの環境変数が設定されていません。
                  <br />
                  `.env.local`ファイルに以下の変数を設定してください：
                  <br />
                  • NEXT_PUBLIC_SUPABASE_URL
                  <br />• NEXT_PUBLIC_SUPABASE_ANON_KEY
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ログイン済みユーザーのみアクセス可能 */}
        {!user && supabaseConfigured && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  ログインが必要です
                </h3>
                <p className="text-muted-foreground mb-4">
                  アイデアを投稿するにはログインしてください。
                </p>
                <Button onClick={() => router.push('/login')}>
                  ログインページへ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ログイン済みユーザーのみフォーム表示 */}
        {user && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>
                  アイデアの基本的な情報を入力してください。
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
                    placeholder="アイデアの簡潔な説明を入力してください（20文字以上、300文字以内）図表などは下のファイルのアップロードからお願いします"
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
                  <Label htmlFor="deadline">議論期限 *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    min={getMinDate()}
                    {...register('deadline')}
                    className="w-full"
                    required
                  />
                  <div className="text-sm text-muted-foreground">
                    その日付まで他のユーザーからのコメントや意見を受け付けます。
                    設定しない場合は、本サービスの対象外になります。<br />
                    なお、最終アイデアの投稿は設定期限の３０日（土日祝含む）以内に行ってください。行われない場合は、削除の対象となり、投稿者および改善提案者は全ての権利を消失するものとします。
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

                  {/* アップロード進捗表示 */}
                  {uploadingFiles && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">
                          ファイルをアップロード中...
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* 添付ファイル一覧 */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          添付ファイル ({uploadedFiles.length})
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadedFiles([])}
                          disabled={uploadingFiles}
                        >
                          すべて削除
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {uploadedFiles.map((file, index) => {
                          const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(
                            file.name
                          );
                          const fileSize = (file.size / 1024 / 1024).toFixed(2);
                          const previewUrl = previewUrls.get(index);

                          return (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                            >
                              {isImage && previewUrl ? (
                                <button
                                  type="button"
                                  onClick={() => openImagePreview(index)}
                                  className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                  <img
                                    src={previewUrl}
                                    alt={file.name}
                                    className="w-20 h-20 object-contain rounded border border-border bg-muted"
                                  />
                                </button>
                              ) : (
                                <div className="w-20 h-20 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                                  {isImage ? (
                                    <Upload className="h-6 w-6 text-primary" />
                                  ) : (
                                    <span className="text-xs font-bold text-primary">
                                      {file.name
                                        .split('.')
                                        .pop()
                                        ?.toUpperCase() || 'FILE'}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {fileSize} MB {isImage && '・ 画像ファイル'}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                disabled={uploadingFiles}
                                className="text-muted-foreground hover:text-destructive flex-shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>

                      {/* ファイルサイズ警告 */}
                      {uploadedFiles.some(
                        file => file.size > 10 * 1024 * 1024
                      ) && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-800">
                              大きなファイルが含まれています
                            </p>
                            <p className="text-yellow-700">
                              アップロードに時間がかかる場合があります。
                            </p>
                          </div>
                        </div>
                      )}
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

                {/* 独占契約オプション */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="isExclusive"
                    checked={watch('isExclusive')}
                    onCheckedChange={checked =>
                      setValue('isExclusive', !!checked)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="isExclusive" className="text-sm font-medium">
                      独占契約として販売する
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      チェックを入れると、このアイデアは1回のみ購入可能になります。
                      購入後は自動的に売り切れ（soldout）状態になります。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploadingFiles || !supabaseConfigured}
              >
                {uploadingFiles ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ファイルアップロード中...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    投稿中...
                  </>
                ) : (
                  'アイデアを投稿する'
                )}
              </Button>
            </div>
          </>
        )}
      </form>

      {/* 画像プレビューモーダル */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <DialogTitle className="sr-only">画像プレビュー</DialogTitle>
          {selectedImageIndex !== null &&
            uploadedFiles[selectedImageIndex] &&
            previewUrls.get(selectedImageIndex) && (
              <div className="relative w-full h-full">
                {/* 閉じるボタン */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={closeImagePreview}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* 画像表示 */}
                <div className="w-full h-full flex items-center justify-center bg-black p-4">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={previewUrls.get(selectedImageIndex)!}
                      alt={uploadedFiles[selectedImageIndex].name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>

                {/* ナビゲーションボタン */}
                {uploadedFiles.filter((file, idx) => {
                  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
                  return isImage && previewUrls.get(idx);
                }).length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={goToPrevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={goToNextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}

                {/* 画像情報 */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded">
                  <p className="text-sm">
                    {uploadedFiles[selectedImageIndex].name}
                  </p>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
