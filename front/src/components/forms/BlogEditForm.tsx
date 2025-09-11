'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Blog } from '@/lib/microcms';
import {
  Save,
  X,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Type,
  Eye,
  Send,
  Copy,
} from 'lucide-react';

// ブログ編集フォームスキーマ
const blogEditSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  content: z
    .string()
    .min(1, 'コンテンツは必須です')
    .max(50000, 'コンテンツは50000文字以内で入力してください'),
  publishedAt: z.string().min(1, '公開日時は必須です'),
});

type BlogEditFormData = z.infer<typeof blogEditSchema>;

interface BlogEditFormProps {
  blog: Blog;
}

export default function BlogEditForm({ blog }: BlogEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] =
    useState<BlogEditFormData | null>(null);
  // HTMLエディターは削除し、常時編集可能なビジュアルエディターのみ使用
  const editableRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BlogEditFormData>({
    resolver: zodResolver(blogEditSchema),
    defaultValues: {
      title: blog.title,
      content: blog.content,
      publishedAt: blog.publishedAt.split('T')[0], // YYYY-MM-DD形式に変換
    },
  });

  // 初期コンテンツの設定
  useEffect(() => {
    if (editableRef.current && blog.content) {
      editableRef.current.innerHTML = blog.content;
    }
  }, [blog.content]);

  // 不要なHTMLエディター用の関数を削除

  // カーソル位置を保存する関数
  // const saveCursorPosition = () => {
  //   if (!editableRef.current) return null;

  //   const selection = window.getSelection();
  //   if (!selection || selection.rangeCount === 0) return null;

  //   const range = selection.getRangeAt(0);
  //   const preCaretRange = range.cloneRange();
  //   preCaretRange.selectNodeContents(editableRef.current);
  //   preCaretRange.setEnd(range.startContainer, range.startOffset);

  //   return preCaretRange.toString().length;
  // };

  // カーソル位置を復元する関数
  // const restoreCursorPosition = (savedPosition: number) => {
  //   if (!editableRef.current || savedPosition === null) return;

  //   const selection = window.getSelection();
  //   if (!selection) return;

  //   let charIndex = 0;
  //   const walker = document.createTreeWalker(
  //     editableRef.current,
  //     NodeFilter.SHOW_TEXT,
  //     null
  //   );

  //   let node;
  //   while ((node = walker.nextNode())) {
  //     const nodeLength = node.textContent?.length || 0;
  //     if (charIndex + nodeLength >= savedPosition) {
  //       const range = document.createRange();
  //       range.setStart(node, Math.min(savedPosition - charIndex, nodeLength));
  //       range.collapse(true);
  //       selection.removeAllRanges();
  //       selection.addRange(range);
  //       return;
  //     }
  //     charIndex += nodeLength;
  //   }
  // };

  // 編集可能プレビューのコンテンツが変更された時のハンドラー
  const handleEditablePreviewChange = () => {
    if (editableRef.current) {
      const newContent = editableRef.current.innerHTML;
      // フォームの値を更新（カーソル位置は保持される）
      setValue('content', newContent, { shouldValidate: false });
    }
  };

  // プレビューエディターでのキーボードショートカット
  const handlePreviewKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+B で太字
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
      handleEditablePreviewChange();
    }
    // Ctrl+I で斜体
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic');
      handleEditablePreviewChange();
    }
    // Ctrl+U で下線
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline');
      handleEditablePreviewChange();
    }
  };

  // WYSIWYG用のフォーマットハンドラー
  const wysiwygFormatHandlers = {
    bold: () => {
      document.execCommand('bold');
      handleEditablePreviewChange();
    },
    italic: () => {
      document.execCommand('italic');
      handleEditablePreviewChange();
    },
    h1: () => {
      document.execCommand('formatBlock', false, 'H1');
      handleEditablePreviewChange();
    },
    h2: () => {
      document.execCommand('formatBlock', false, 'H2');
      handleEditablePreviewChange();
    },
    h3: () => {
      document.execCommand('formatBlock', false, 'H3');
      handleEditablePreviewChange();
    },
    paragraph: () => {
      document.execCommand('formatBlock', false, 'P');
      handleEditablePreviewChange();
    },
    ul: () => {
      document.execCommand('insertUnorderedList');
      handleEditablePreviewChange();
    },
    ol: () => {
      document.execCommand('insertOrderedList');
      handleEditablePreviewChange();
    },
    quote: () => {
      document.execCommand('formatBlock', false, 'BLOCKQUOTE');
      handleEditablePreviewChange();
    },
    link: () => {
      // eslint-disable-next-line no-alert
      const url = window.prompt('リンクURLを入力してください:');
      if (url) {
        document.execCommand('createLink', false, url);
        handleEditablePreviewChange();
      }
    },
    image: () => {
      // eslint-disable-next-line no-alert
      const url = window.prompt('画像URLを入力してください:');
      if (url) {
        document.execCommand('insertImage', false, url);
        handleEditablePreviewChange();
      }
    },
  };

  // フォームデータの確認用 - モーダルを表示
  const onSubmit = (data: BlogEditFormData) => {
    // データの前処理とバリデーション
    const processedData = {
      ...data,
      // HTMLコンテンツをクリーンアップ（必要に応じて）
      content: data.content.trim(),
      // 公開日時のフォーマット確認
      publishedAt: data.publishedAt,
    };

    console.log('送信予定データ:', processedData);
    setFormDataToSubmit(processedData);
    setShowConfirmModal(true);
  };

  // 実際のブログ更新処理
  const handleConfirmedSubmit = async () => {
    if (!formDataToSubmit) return;

    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);

      // リクエストボディを準備
      const requestBody = {
        title: formDataToSubmit.title,
        content: formDataToSubmit.content,
        publishedAt: new Date(formDataToSubmit.publishedAt).toISOString(),
      };

      // JSONの妥当性を事前チェック
      console.log('送信するリクエストボディ:', requestBody);

      // PATCHメソッドで変更されたフィールドのみを送信
      const finalRequestBody: Record<string, unknown> = {};

      // 変更されたフィールドのみを含める
      if (formDataToSubmit.title !== blog.title) {
        finalRequestBody.title = formDataToSubmit.title;
      }
      if (formDataToSubmit.content !== blog.content) {
        finalRequestBody.content = formDataToSubmit.content;
      }
      if (formDataToSubmit.publishedAt !== blog.publishedAt.split('T')[0]) {
        finalRequestBody.publishedAt = new Date(
          formDataToSubmit.publishedAt
        ).toISOString();
      }

      console.log('PATCH用の差分データ:', finalRequestBody);
      console.log('変更検出:', {
        titleChanged: formDataToSubmit.title !== blog.title,
        contentChanged: formDataToSubmit.content !== blog.content,
        publishedAtChanged:
          formDataToSubmit.publishedAt !== blog.publishedAt.split('T')[0],
      });

      const response = await fetch(`/api/blog/update/${blog.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalRequestBody),
      });

      // レスポンスの詳細ログ
      console.log('APIレスポンス詳細:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
        ok: response.ok,
      });

      if (!response.ok) {
        let errorData;
        let responseText = '';

        try {
          responseText = await response.text();
          console.log('エラーレスポンステキスト:', responseText);

          // JSONパースを試行
          errorData = JSON.parse(responseText);
          console.log('パース済みエラーデータ:', errorData);
        } catch (parseError) {
          console.error('レスポンスのJSONパースに失敗:', parseError);
          console.log('生のレスポンステキスト:', responseText);
          errorData = { error: 'レスポンスの解析に失敗しました' };
        }

        // 詳細なエラー情報をログ出力
        console.error('API更新エラー詳細:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestBody,
          timestamp: new Date().toISOString(),
        });

        throw new Error(
          errorData.error ||
            `APIエラー (${response.status}): ${response.statusText}`
        );
      }

      // 成功レスポンスの処理
      const successData = await response.json();
      console.log('更新成功レスポンス:', successData);

      // 成功メッセージ
      toast({
        title: 'ブログを更新しました！',
        description: `${formDataToSubmit.title}を正常に更新しました。`,
      });

      // ブログ詳細ページにリダイレクト
      router.push(`/blog/${blog.id}`);
    } catch (error) {
      // 詳細なエラーログ
      console.group('🚨 ブログ更新エラー詳細');
      console.error('エラーオブジェクト:', error);
      console.error(
        'エラーメッセージ:',
        error instanceof Error ? error.message : String(error)
      );
      console.error(
        'エラーのスタックトレース:',
        error instanceof Error ? error.stack : 'スタックトレースなし'
      );
      console.error('送信データ:', formDataToSubmit);
      console.error('ブログID:', blog.id);
      console.error('タイムスタンプ:', new Date().toISOString());

      // ネットワークエラーかどうかを判定
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('ネットワークエラーの可能性:', error.message);
      }

      console.groupEnd();

      let errorMessage = 'しばらく時間をおいて再度お試しください。';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: '更新に失敗しました',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setFormDataToSubmit(null);
    }
  };

  // モーダルのキャンセル処理
  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setFormDataToSubmit(null);
  };

  // HTTPリクエストをクリップボードにコピー
  const copyHttpRequest = async () => {
    if (!formDataToSubmit) return;

    const requestBodyData: Record<string, unknown> = {};
    if (formDataToSubmit.title !== blog.title) {
      requestBodyData.title = formDataToSubmit.title;
    }
    if (formDataToSubmit.content !== blog.content) {
      requestBodyData.content = formDataToSubmit.content;
    }
    if (formDataToSubmit.publishedAt !== blog.publishedAt.split('T')[0]) {
      requestBodyData.publishedAt = new Date(
        formDataToSubmit.publishedAt
      ).toISOString();
    }

    const httpRequestString = `PATCH /api/blog/update/${blog.id}
Content-Type: application/json

${JSON.stringify(requestBodyData, null, 2)}`;

    try {
      await navigator.clipboard.writeText(httpRequestString);
      toast({
        title: 'コピーしました',
        description: 'HTTPリクエストをクリップボードにコピーしました。',
      });
    } catch {
      toast({
        title: 'コピーに失敗しました',
        description: 'クリップボードへのアクセスができませんでした。',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push(`/blog/${blog.id}`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Save className="h-6 w-6" />
          ブログ記事編集
        </h2>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            編集中の記事ID: <span className="font-medium">{blog.id}</span>
          </p>
        </div>
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
            👁️ <span className="font-medium">確認モード:</span>
            「更新する」ボタンを押すと、更新内容をプレビューできるモーダルが表示されます。
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              ブログ記事の基本的な情報を編集してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* タイトル */}
            <div className="space-y-2">
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                placeholder="記事のタイトルを入力してください"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* 公開日時 */}
            <div className="space-y-2">
              <Label htmlFor="publishedAt">公開日時 *</Label>
              <Input
                id="publishedAt"
                type="date"
                {...register('publishedAt')}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                記事の公開日時を設定してください。
              </div>
              {errors.publishedAt && (
                <p className="text-sm text-destructive">
                  {errors.publishedAt.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ビジュアルエディター */}
        <Card>
          <CardHeader>
            <CardTitle>記事コンテンツ</CardTitle>
            <CardDescription>
              直接クリックして編集するか、ツールバーを使ってフォーマットできます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ビジュアルエディター用ツールバー */}
            <div className="border rounded-lg p-3 bg-muted/50">
              <div className="flex flex-wrap gap-2">
                {/* テキストフォーマット */}
                <div className="flex gap-1 border-r pr-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.bold}
                    title="太字 (Ctrl+B)"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.italic}
                    title="斜体 (Ctrl+I)"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </div>

                {/* 見出し */}
                <div className="flex gap-1 border-r pr-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.h1}
                    title="見出し1"
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.h2}
                    title="見出し2"
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.h3}
                    title="見出し3"
                  >
                    <Heading3 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.paragraph}
                    title="段落"
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </div>

                {/* リスト */}
                <div className="flex gap-1 border-r pr-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.ul}
                    title="箇条書きリスト"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.ol}
                    title="番号付きリスト"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </div>

                {/* その他 */}
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.quote}
                    title="引用"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.link}
                    title="リンク"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={wysiwygFormatHandlers.image}
                    title="画像"
                  >
                    <Image className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded">
                💡 ショートカット: Ctrl+B (太字), Ctrl+I (斜体), Ctrl+U (下線) |
                直接テキストをクリックして編集できます
              </div>
            </div>

            {/* 常時編集可能エリア */}
            <div className="border rounded-lg p-6 bg-background min-h-[400px]">
              <h3
                className="text-2xl font-bold mb-6 border-b border-transparent hover:border-muted transition-colors cursor-text"
                contentEditable={true}
                onBlur={e => {
                  setValue('title', e.currentTarget.textContent || '');
                }}
                suppressContentEditableWarning={true}
              >
                {watch('title') || 'タイトルなし'}
              </h3>

              <div
                ref={editableRef}
                contentEditable={true}
                onInput={handleEditablePreviewChange}
                onKeyDown={handlePreviewKeyDown}
                className="prose prose-sm max-w-none min-h-[300px] outline-none cursor-text
                  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-foreground
                  [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:text-foreground
                  [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:text-foreground
                  [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_a]:text-primary [&_a]:hover:underline
                  [&_strong]:font-semibold [&_strong]:text-foreground
                  [&_em]:italic
                  [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                  [&_li]:mb-1
                  [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mb-4
                  [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-primary
                  [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4
                  [&_img]:rounded-lg [&_img]:shadow-soft [&_img]:mb-4
                  focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded-lg"
                suppressContentEditableWarning={true}
              >
                {!watch('content') && (
                  <p className="text-muted-foreground">
                    コンテンツを入力してください...
                  </p>
                )}
              </div>

              <div className="mt-4 text-sm text-muted-foreground flex justify-between">
                <span>✏️ 直接クリックして編集 | ツールバーでフォーマット</span>
                <span>{watch('content')?.length || 0} / 50,000文字</span>
              </div>

              {/* Hidden input for content field */}
              <input type="hidden" {...register('content')} />

              {/* Content validation error */}
              {errors.content && (
                <p className="text-sm text-destructive mt-2">
                  {errors.content.message}
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
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Eye className="h-4 w-4 mr-2" />
            {isSubmitting ? '更新中...' : '更新内容を確認する'}
          </Button>
        </div>
      </form>

      {/* 更新確認モーダル */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              更新内容の確認
            </DialogTitle>
            <DialogDescription>
              送信されるHTTPリクエストと更新内容を確認してください。問題がなければ「更新する」ボタンをクリックしてください。
            </DialogDescription>
          </DialogHeader>

          {formDataToSubmit && (
            <div className="space-y-6">
              {/* HTTPリクエスト詳細 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    送信されるHTTPリクエスト
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyHttpRequest}
                    className="h-7 px-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    コピー
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 relative">
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                    {(() => {
                      const requestBodyData: Record<string, unknown> = {};
                      if (formDataToSubmit.title !== blog.title) {
                        requestBodyData.title = formDataToSubmit.title;
                      }
                      if (formDataToSubmit.content !== blog.content) {
                        requestBodyData.content = formDataToSubmit.content;
                      }
                      if (
                        formDataToSubmit.publishedAt !==
                        blog.publishedAt.split('T')[0]
                      ) {
                        requestBodyData.publishedAt = new Date(
                          formDataToSubmit.publishedAt
                        ).toISOString();
                      }

                      return `PATCH /api/blog/update/${blog.id}
Content-Type: application/json

${JSON.stringify(requestBodyData, null, 2)}`;
                    })()}
                  </pre>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>💡 このHTTPリクエストをAPIテスト用にコピーできます</p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      ✅ JSONフォーマット検証
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-0.5 mt-1">
                      <li>
                        • title: string ({formDataToSubmit.title.length}文字)
                      </li>
                      <li>
                        • content: string (
                        {
                          formDataToSubmit.content.replace(/<[^>]*>/g, '')
                            .length
                        }
                        文字 テキスト)
                      </li>
                      <li>
                        • publishedAt: ISO8601 (
                        {new Date(formDataToSubmit.publishedAt).toISOString()})
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* タイトルの変更確認 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  タイトル
                </h3>
                <div className="space-y-2">
                  {blog.title !== formDataToSubmit.title && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <span className="font-medium">変更前:</span>{' '}
                        {blog.title}
                      </p>
                    </div>
                  )}
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <span className="font-medium">
                        {blog.title !== formDataToSubmit.title
                          ? '変更後:'
                          : '現在:'}
                      </span>{' '}
                      {formDataToSubmit.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* 公開日時の変更確認 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  公開日時
                </h3>
                <div className="space-y-2">
                  {blog.publishedAt.split('T')[0] !==
                    formDataToSubmit.publishedAt && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <span className="font-medium">変更前:</span>{' '}
                        {new Date(blog.publishedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  )}
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <span className="font-medium">
                        {blog.publishedAt.split('T')[0] !==
                        formDataToSubmit.publishedAt
                          ? '変更後:'
                          : '現在:'}
                      </span>{' '}
                      {new Date(
                        formDataToSubmit.publishedAt
                      ).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>

              {/* コンテンツプレビュー */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  記事コンテンツ
                </h3>
                <div className="border rounded-lg p-4 bg-background max-h-60 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none
                      [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-foreground
                      [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:text-foreground
                      [&_h3]:text-base [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:text-foreground
                      [&_p]:mb-3 [&_p]:leading-relaxed
                      [&_a]:text-primary [&_a]:hover:underline
                      [&_strong]:font-semibold [&_strong]:text-foreground
                      [&_em]:italic
                      [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3
                      [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3
                      [&_li]:mb-1
                      [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:mb-3
                      [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-primary
                      [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-3
                      [&_img]:rounded-lg [&_img]:shadow-soft [&_img]:mb-3"
                    dangerouslySetInnerHTML={{
                      __html: formDataToSubmit.content,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  文字数:{' '}
                  {formDataToSubmit.content.replace(/<[^>]*>/g, '').length} 文字
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelModal}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={handleConfirmedSubmit}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? '更新中...' : 'ブログを更新する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
