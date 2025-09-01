"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import { getIdeaById, getCommentsByIdeaId, createComment, deleteIdea } from "@/lib/supabase/ideas";
import { Database } from "@/lib/supabase/types";
import { Calendar, Edit, MessageSquare, User, Clock, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/StableAuthContext";
import GoogleAdsense from "@/components/GoogleAdsense";

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
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const ideaId = params.id as string;

  useEffect(() => {
    fetchIdea();
    fetchComments();
  }, [ideaId]);

  const fetchIdea = async () => {
    try {
      setLoading(true);
      const { data, error } = await getIdeaById(ideaId);
      
      if (error) {
        console.error('アイデア取得エラー:', error);
        toast({
          title: "エラー",
          description: "アイデアの取得に失敗しました。",
          variant: "destructive",
        });
        router.push('/ideas');
        return;
      }

      if (!data) {
        toast({
          title: "エラー",
          description: "アイデアが見つかりませんでした。",
          variant: "destructive",
        });
        router.push('/ideas');
        return;
      }

      setIdea(data);
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました。",
        variant: "destructive",
      });
      router.push('/ideas');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await getCommentsByIdeaId(ideaId);
      
      if (error) {
        console.error('コメント取得エラー:', error);
        return;
      }

      if (data) {
        setComments(data);
      }
    } catch (error) {
      console.error('コメント取得エラー:', error);
    }
  };

  const handleEditIdea = () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "編集するにはログインしてください。",
        variant: "destructive",
      });
      router.push(`/login?redirect=${encodeURIComponent(`/ideas/${ideaId}/edit`)}`);
      return;
    }

    if (idea && idea.author_id !== user.id) {
      toast({
        title: "権限エラー",
        description: "このアイデアの編集権限がありません。",
        variant: "destructive",
      });
      return;
    }

    router.push(`/ideas/${ideaId}/edit`);
  };

  const handleDeleteIdea = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "削除するにはログインしてください。",
        variant: "destructive",
      });
      return;
    }

    if (idea && idea.author_id !== user.id) {
      toast({
        title: "権限エラー",
        description: "このアイデアの削除権限がありません。",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await deleteIdea(ideaId);
      
      if (error) {
        console.error('アイデア削除エラー:', error);
        toast({
          title: "エラー",
          description: "アイデアの削除に失敗しました。",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "成功",
        description: "アイデアを削除しました。",
      });
      
      router.push('/my/ideas');
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "コメントを投稿するにはログインしてください。",
        variant: "destructive",
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        title: "エラー",
        description: "コメント内容を入力してください。",
        variant: "destructive",
      });
      return;
    }

    try {
      setCommentSubmitting(true);
      const { data, error } = await createComment(ideaId, commentText.trim(), user.id);
      
      if (error) {
        console.error('コメント投稿エラー:', error);
        toast({
          title: "エラー",
          description: "コメントの投稿に失敗しました。",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // コメント投稿成功
        setCommentText("");
        toast({
          title: "成功",
          description: "コメントを投稿しました。",
        });
        
        // コメント一覧を再取得
        fetchComments();
      }
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました。",
        variant: "destructive",
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
              <p className="text-muted-foreground">アイデア詳細を読み込み中...</p>
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
              <h1 className="text-2xl font-bold mb-4">アイデアが見つかりません</h1>
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
                  <Badge variant={idea.status === 'published' ? 'default' : 'secondary'}>
                    {idea.status === 'published' ? '公開中' : 
                     idea.status === 'draft' ? '下書き' : '終了'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(idea.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
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
                    <span>議論期限: {new Date(idea.deadline).toLocaleDateString('ja-JP')}</span>
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

              {/* アクションボタン */}
              <div className="flex flex-wrap gap-3 pt-6 border-t">
                {isAuthor && (
                  idea.status === 'published' ? (
                    <Button 
                      variant="outline" 
                      onClick={handleEditIdea}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      編集する
                    </Button>
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
                  )
                )}
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
                        <AlertDialogTitle>アイデアを削除しますか？</AlertDialogTitle>
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
                このアイデアについてディスカッションしましょう
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {comments && comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => {
                    const isIdeaAuthor = comment.author_id === idea.author_id;
                    
                    return (
                      <div 
                        key={comment.id} 
                        className={`flex ${isIdeaAuthor ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] ${isIdeaAuthor ? 'order-2' : 'order-1'}`}>
                          {/* ユーザー情報 */}
                          <div className={`flex items-center gap-2 mb-2 ${isIdeaAuthor ? 'justify-start' : 'justify-end'}`}>
                            <div className={`flex items-center gap-1 ${isIdeaAuthor ? 'flex-row' : 'flex-row-reverse'}`}>
                              <User className="h-3 w-3" />
                              <span className="text-xs font-medium">
                                {comment.profiles?.display_name || 'Unknown'}
                                {isIdeaAuthor && <span className="ml-1 text-blue-600">（制作者）</span>}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          
                          {/* 吹き出し */}
                          <div className="relative">
                            <div 
                              className={`
                                px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap
                                ${isIdeaAuthor 
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
                        <div className={`
                          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                          ${isIdeaAuthor 
                            ? 'bg-red-500 text-white order-1 mr-3' 
                            : 'bg-gray-300 text-gray-700 order-2 ml-3'
                          }
                        `}>
                          {(comment.profiles?.display_name || 'U').charAt(0).toUpperCase()}
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
                {user ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="コメントを入力してください..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || commentSubmitting}
                        className="flex items-center gap-2"
                      >
                        {commentSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                      onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/ideas/${ideaId}`)}`)}
                    >
                      ログイン
                    </Button>
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
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">スポンサー</h3>
                  <GoogleAdsense 
                    adSlot="7718612763"
                    style={{ 
                      display: 'block',
                      minHeight: '300px',
                      width: '100%'
                    }}
                  />
                </Card>

                {/* 関連情報カード */}
                <Card className="p-4">
                  <h3 className="text-sm font-medium mb-3">このアイデアについて</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>投稿日: {new Date(idea.created_at).toLocaleDateString('ja-JP')}</div>
                    <div>コメント数: {comments.length}</div>
                    {idea.deadline && (
                      <div>議論期限: {new Date(idea.deadline).toLocaleDateString('ja-JP')}</div>
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
