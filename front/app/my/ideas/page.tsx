"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/StableAuthContext";
import { getUserIdeas, getCommentCount, updateOverdueIdeas } from "@/lib/supabase/ideas";
import { Database } from "@/lib/supabase/types";
import { Search, Plus, MessageSquare, Edit, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Idea = Database['public']['Tables']['ideas']['Row'] & {
  profiles: {
    display_name: string;
    role: string;
  } | null;
  commentCount?: number;
};

export default function MyIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login?redirect=' + encodeURIComponent('/my/ideas'));
      return;
    }
    if (user) {
      fetchMyIdeas();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const filtered = ideas.filter(idea =>
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIdeas(filtered);
  }, [ideas, searchTerm]);

  const fetchMyIdeas = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // まず期限切れアイデアのステータスを更新
      await updateOverdueIdeas(user.id);
      
      const { data, error } = await getUserIdeas(user.id, 50, 0);
      
      if (error) {
        console.error('アイデア取得エラー:', error);
        toast({
          title: "エラー",
          description: "アイデアの取得に失敗しました。",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // 各アイデアのコメント数を取得
        const ideasWithCommentCount = await Promise.all(
          data.map(async (idea: Idea) => {
            const { count } = await getCommentCount(idea.id);
            return { ...idea, commentCount: count };
          })
        );
        
        setIdeas(ideasWithCommentCount);
      } else {
        setIdeas([]);
      }
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "published": "bg-green-100 text-green-800",
      "overdue": "bg-orange-100 text-orange-800",
      "completed": "bg-blue-100 text-blue-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      "published": "公開中", 
      "overdue": "期限切れ",
      "completed": "完成"
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const handleEditIdea = (ideaId: string) => {
    router.push(`/ideas/${ideaId}/edit`);
  };

  const handleCreateFinalIdea = (ideaId: string) => {
    router.push(`/ideas/${ideaId}/final`);
  };

  const handleViewIdea = (ideaId: string) => {
    router.push(`/ideas/${ideaId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  マイアイデア
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                あなたが投稿したアイデアの管理
              </p>
            </div>
            <Button 
              onClick={() => router.push('/ideas/new')}
              className="flex items-center gap-2 mt-4 md:mt-0"
            >
              <Plus className="h-4 w-4" />
              新しいアイデアを投稿
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="アイデアを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  総アイデア数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ideas.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  公開中
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {ideas.filter(idea => idea.status === 'published').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  完成
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {ideas.filter(idea => (idea.status as any) === 'completed').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredIdeas.length}件のアイデアが見つかりました
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredIdeas.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "検索結果が見つかりません" : "まだアイデアがありません"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? "別のキーワードで検索してみてください" 
                  : "最初のアイデアを投稿してみましょう"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/ideas/new')}>
                  アイデアを投稿する
                </Button>
              )}
            </div>
          ) : (
            /* Ideas Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIdeas.map((idea, index) => (
                <Card 
                  key={idea.id} 
                  className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getStatusColor(idea.status)}>
                        {getStatusText(idea.status)}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {idea.mmb_no}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {idea.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {idea.summary}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    {/* 上部コンテンツ */}
                    <div className="flex-1">
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{idea.commentCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(idea.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>

                      {/* Deadline */}
                      {idea.deadline && (
                        <div className="text-sm text-muted-foreground mb-4">
                          締切: {new Date(idea.deadline).toLocaleDateString('ja-JP')}
                        </div>
                      )}
                    </div>

                    {/* Actions - 下部固定 */}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewIdea(idea.id)}
                      >
                        詳細
                      </Button>
                      {(idea.status as any) === 'overdue' ? (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                          onClick={() => handleCreateFinalIdea(idea.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          最終アイデア作成
                        </Button>
                      ) : (idea.status as any) === 'completed' ? (
                        // 完成したアイデアは詳細ボタンのみ表示（編集ボタンなし）
                        <div className="flex-1"></div>
                      ) : idea.status === 'published' ? (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditIdea(idea.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          編集
                        </Button>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1"
                          disabled
                          title="このアイデアは編集できません"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          編集不可
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
