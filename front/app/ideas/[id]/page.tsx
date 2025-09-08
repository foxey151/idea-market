'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  getIdeaById,
  getCommentsByIdeaId,
  createComment,
  deleteIdea,
} from '@/lib/supabase/ideas';
import { Database } from '@/lib/supabase/types';
import {
  Calendar,
  Edit,
  MessageSquare,
  User,
  Clock,
  Trash2,
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/StableAuthContext';
import GoogleAdsense from '@/components/GoogleAdsense';
import { getFileUrl } from '@/lib/supabase/storage';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  // DialogTrigger, // 現在未使用
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

type IdeaDetail = Database['public']['Tables']['ideas']['Row'] & {
  profiles: {
    display_name: string;
    role: string;
  } | null;
};

type Comment = {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  profiles: {
    display_name: string;
  } | null;
};

export default function IdeaDetailPage() {
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [attachmentUrls, setAttachmentUrls] = useState<
    { path: string; url: string; isImage: boolean; fileName: string }[]
  >([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const ideaId = params.id as string;

  const loadAttachments = useCallback(async () => {
    if (!idea || !idea.attachments || idea.attachments.length === 0) {
      return;
    }

    try {
      setLoadingAttachments(true);
      console.log('添付ファイル読み込み開始:', idea.attachments);

      const attachmentsWithUrls = await Promise.all(
        idea.attachments.map(async filePath => {
          const url = await getFileUrl(filePath);
          // ファイル拡張子から画像かどうかを判定
          const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(filePath);
          // ファイル名を取得
          const fileName = filePath.split('/').pop() || filePath;

          console.log('ファイル処理:', { filePath, url, isImage, fileName });

          return {
            path: filePath,
            url,
            isImage,
            fileName,
          };
        })
      );

      console.log('添付ファイル読み込み完了:', attachmentsWithUrls);
      setAttachmentUrls(attachmentsWithUrls);
    } catch (error) {
      console.error('添付ファイル読み込みエラー:', error);
      toast({
        title: 'エラー',
        description: '添付ファイルの読み込みに失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setLoadingAttachments(false);
    }
  }, [idea]);

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedImageIndex(null);
  };

  const goToPrevImage = () => {
    const imageFiles = attachmentUrls.filter(file => file.isImage);
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    } else if (selectedImageIndex !== null) {
      setSelectedImageIndex(imageFiles.length - 1);
    }
  };

  const goToNextImage = () => {
    const imageFiles = attachmentUrls.filter(file => file.isImage);
    if (
      selectedImageIndex !== null &&
      selectedImageIndex < imageFiles.length - 1
    ) {
      setSelectedImageIndex(selectedImageIndex + 1);
    } else if (selectedImageIndex !== null) {
      setSelectedImageIndex(0);
    }
  };

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

      setIdea(data);
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
  }, [ideaId, router]);

  const fetchComments = useCallback(async () => {
    try {
      console.log('コメント取得開始 - ideaId:', ideaId);
      const { data, error } = await getCommentsByIdeaId(ideaId);

      if (error) {
        console.error('コメント取得エラー:', error);
        return;
      }

      console.log('コメント取得結果:', data);
      if (data) {
        setComments(data);
        console.log('コメント設定完了:', data.length, '件');
      } else {
        console.log('コメントデータがnullです');
        setComments([]);
      }
    } catch (error) {
      console.error('コメント取得エラー:', error);
    }
  }, [ideaId]);

  // データ取得とコンポーネントマウント時の処理
  useEffect(() => {
    fetchIdea();
    fetchComments();
  }, [fetchIdea, fetchComments]);

  // アイデアが変更された時に添付ファイルを読み込む
  useEffect(() => {
    if (idea) {
      loadAttachments();
    }
  }, [idea, loadAttachments]);

  const handleEditIdea = () => {
    if (!user) {
      toast({
        title: 'ログインが必要です',
        description: '編集するにはログインしてください。',
        variant: 'destructive',
      });
      router.push(
        `/login?redirect=${encodeURIComponent(`/ideas/${ideaId}/edit`)}`
      );
      return;
    }

    if (idea && idea.author_id !== user.id) {
      toast({
        title: '権限エラー',
        description: 'このアイデアの編集権限がありません。',
        variant: 'destructive',
      });
      return;
    }

    router.push(`/ideas/${ideaId}/edit`);
  };

  const handleDeleteIdea = async () => {
    if (!user) {
      toast({
        title: 'ログインが必要です',
        description: '削除するにはログインしてください。',
        variant: 'destructive',
      });
      return;
    }

    if (idea && idea.author_id !== user.id) {
      toast({
        title: '権限エラー',
        description: 'このアイデアの削除権限がありません。',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await deleteIdea(ideaId);

      if (error) {
        console.error('アイデア削除エラー:', error);
        toast({
          title: 'エラー',
          description: 'アイデアの削除に失敗しました。',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '成功',
        description: 'アイデアを削除しました。',
      });

      router.push('/my/ideas');
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: 'エラー',
        description: '予期しないエラーが発生しました。',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: 'ログインが必要です',
        description: 'コメントを投稿するにはログインしてください。',
        variant: 'destructive',
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        title: 'エラー',
        description: 'コメント内容を入力してください。',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCommentSubmitting(true);
      const { data, error } = await createComment(
        ideaId,
        commentText.trim(),
        user.id
      );

      if (error) {
        console.error('コメント投稿エラー:', error);
        toast({
          title: 'エラー',
          description: 'コメントの投稿に失敗しました。',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        // コメント投稿成功
        setCommentText('');
        toast({
          title: '成功',
          description: 'コメントを投稿しました。',
        });

        // コメント一覧を再取得
        fetchComments();
      }
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: 'エラー',
        description: '予期しないエラーが発生しました。',
        variant: 'destructive',
      });
    } finally {
      setCommentSubmitting(false);
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

  // ユーザーがアイデアの作成者かどうかチェック
  const isAuthor = user && idea.author_id === user.id;
  const imageFiles = attachmentUrls.filter(file => file.isImage);

  return (
    <>
      {/* 画像ギャラリーモーダル */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <VisuallyHidden>
            <DialogTitle>画像ギャラリー</DialogTitle>
          </VisuallyHidden>
          {selectedImageIndex !== null && imageFiles[selectedImageIndex] && (
            <div className="relative w-full h-full">
              {/* 闉するボタン */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={closeGallery}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* 画像表示 */}
              <div className="w-full h-full flex items-center justify-center bg-black">
                <Image
                  src={imageFiles[selectedImageIndex].url}
                  alt={imageFiles[selectedImageIndex].fileName}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  unoptimized
                />
              </div>

              {/* ナビゲーションボタン */}
              {imageFiles.length > 1 && (
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
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 text-white p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    {imageFiles[selectedImageIndex].fileName}
                  </p>
                  <p className="text-xs text-gray-300">
                    {selectedImageIndex + 1} / {imageFiles.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                        <Badge
                          variant={
                            idea.status === 'published'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {idea.status === 'published'
                            ? '公開中'
                            : (idea.status as any) === 'overdue'
                              ? '期限切れ'
                              : idea.status === 'closed'
                                ? '完成'
                                : 'その他'}
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
                        <span>
                          by {idea.profiles?.display_name || 'Unknown'}
                        </span>
                      </div>
                      {idea.deadline && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            議論期限:{' '}
                            {new Date(idea.deadline).toLocaleDateString(
                              'ja-JP'
                            )}
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

                    {/* 完成したアイデアの詳細表示 */}
                    {(idea.status as any) === 'completed' && idea.detail && (
                      <div className="prose max-w-none mb-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          最終アイデア詳細
                        </h3>
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {idea.detail}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 添付ファイル表示 */}
                    {(attachmentUrls.length > 0 || loadingAttachments) && (
                      <div className="prose max-w-none mb-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          添付ファイル{' '}
                          {attachmentUrls.length > 0 &&
                            `(${attachmentUrls.length})`}
                        </h3>

                        {loadingAttachments ? (
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-2 text-muted-foreground">
                              添付ファイルを読み込み中...
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* 画像ファイル */}
                            {attachmentUrls.filter(file => file.isImage)
                              .length > 0 && (
                              <div>
                                <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                                  <ImageIcon className="h-4 w-4" />
                                  画像ファイル (
                                  {
                                    attachmentUrls.filter(file => file.isImage)
                                      .length
                                  }
                                  )
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {attachmentUrls
                                    .filter(file => file.isImage)
                                    .map((file, index) => (
                                      <div
                                        key={index}
                                        className="group relative cursor-pointer"
                                        onClick={() => openGallery(index)}
                                      >
                                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                          <Image
                                            src={file.url}
                                            alt={file.fileName || '添付画像'}
                                            width={400}
                                            height={300}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            unoptimized
                                          />
                                        </div>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-red-500/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <Button
                                            size="sm"
                                            variant="secondary"
                                            className="bg-red-500 hover:bg-red-600 text-white pointer-events-none"
                                          >
                                            <Eye className="h-4 w-4 mr-1" />
                                            拡大
                                          </Button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 right-2">
                                          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                                            {file.fileName}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* PDFファイル */}
                            {attachmentUrls.filter(file => !file.isImage)
                              .length > 0 && (
                              <div>
                                <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  ドキュメントファイル (
                                  {
                                    attachmentUrls.filter(file => !file.isImage)
                                      .length
                                  }
                                  )
                                </h4>
                                <div className="space-y-2">
                                  {attachmentUrls
                                    .filter(file => !file.isImage)
                                    .map((file, index) => {
                                      const fileExtension =
                                        file.fileName
                                          .split('.')
                                          .pop()
                                          ?.toUpperCase() || 'FILE';

                                      return (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                              <span className="text-xs font-bold text-primary">
                                                {fileExtension}
                                              </span>
                                            </div>
                                            <div>
                                              <p className="font-medium text-sm">
                                                {file.fileName}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                クリックしてダウンロード
                                              </p>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              window.open(file.url, '_blank')
                                            }
                                          >
                                            <Download className="h-4 w-4 mr-1" />
                                            ダウンロード
                                          </Button>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* アクションボタン */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t">
                      {isAuthor &&
                        (idea.status === 'published' ? (
                          <Button
                            variant="outline"
                            onClick={handleEditIdea}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            編集する
                          </Button>
                        ) : (idea.status as any) === 'completed' ? (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-2 px-3 py-2"
                          >
                            <FileText className="h-4 w-4" />
                            完成済み
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="flex items-center gap-2"
                            title="このアイデアは編集できません"
                          >
                            <Edit className="h-4 w-4" />
                            編集不可
                          </Button>
                        ))}
                      <Button
                        variant="outline"
                        onClick={() => router.push('/ideas')}
                      >
                        一覧に戻る
                      </Button>
                      {isAuthor && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              削除する
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                アイデアを削除しますか？
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は取り消すことができません。このアイデアとそれに関連するすべてのコメントが完全に削除されます。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteIdea}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                削除する
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* コメント欄 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      コメント ({comments.length})
                    </CardTitle>
                    <CardDescription>
                      {idea.status === 'published'
                        ? 'このアイデアについてディスカッションしましょう'
                        : (idea.status as any) === 'overdue'
                          ? '期限切れのため新しいコメントは投稿できません'
                          : '完成したアイデアのコメント履歴です'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {(() => {
                      console.log(
                        'コメント表示チェック - comments:',
                        comments,
                        'length:',
                        comments.length
                      );
                      return comments && comments.length > 0;
                    })() ? (
                      <div className="space-y-6">
                        {comments.map(comment => {
                          const isIdeaAuthor =
                            comment.author_id === idea.author_id;

                          return (
                            <div
                              key={comment.id}
                              className={`flex ${isIdeaAuthor ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[70%] ${isIdeaAuthor ? 'order-2' : 'order-1'}`}
                              >
                                {/* ユーザー情報 */}
                                <div
                                  className={`flex items-center gap-2 mb-2 ${isIdeaAuthor ? 'justify-start' : 'justify-end'}`}
                                >
                                  <div
                                    className={`flex items-center gap-1 ${isIdeaAuthor ? 'flex-row' : 'flex-row-reverse'}`}
                                  >
                                    <User className="h-3 w-3" />
                                    <span className="text-xs font-medium">
                                      {comment.profiles?.display_name ||
                                        'Unknown'}
                                      {isIdeaAuthor && (
                                        <span className="ml-1 text-blue-600">
                                          （制作者）
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(
                                      comment.created_at
                                    ).toLocaleDateString('ja-JP')}
                                  </span>
                                </div>

                                {/* 吹き出し */}
                                <div className="relative">
                                  <div
                                    className={`
                                px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap
                                ${
                                  isIdeaAuthor
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }
                              `}
                                  >
                                    {comment.text}
                                  </div>
                                </div>
                              </div>

                              {/* アバター部分 */}
                              <div
                                className={`
                          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                          ${
                            isIdeaAuthor
                              ? 'bg-red-500 text-white order-1 mr-3'
                              : 'bg-gray-300 text-gray-700 order-2 ml-3'
                          }
                        `}
                              >
                                {(comment.profiles?.display_name || 'U')
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          まだコメントがありません。最初のコメントを投稿してみませんか？
                        </p>
                      </div>
                    )}

                    {/* コメント投稿フォーム */}
                    <div className="mt-6 pt-6 border-t">
                      {idea.status === 'published' ? (
                        user ? (
                          <div className="space-y-4">
                            <Textarea
                              placeholder="コメントを入力してください..."
                              value={commentText}
                              onChange={e => setCommentText(e.target.value)}
                              rows={3}
                              className="resize-none"
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={handleSubmitComment}
                                disabled={
                                  !commentText.trim() || commentSubmitting
                                }
                                className="flex items-center gap-2"
                              >
                                {commentSubmitting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    投稿中...
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare className="h-4 w-4" />
                                    コメントを投稿
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground mb-4">
                              コメントを投稿するにはログインが必要です
                            </p>
                            <Button
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/login?redirect=${encodeURIComponent(`/ideas/${ideaId}`)}`
                                )
                              }
                            >
                              ログイン
                            </Button>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-muted-foreground">
                              {(idea.status as any) === 'overdue'
                                ? '期限切れのアイデアにはコメントできません。'
                                : (idea.status as any) === 'completed'
                                  ? '完成したアイデアにはコメントできません。'
                                  : 'このアイデアにはコメントできません。'}
                            </p>
                          </div>
                        </div>
                      )}
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
                      <div>コメント数: {comments.length}</div>
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
    </>
  );
}
