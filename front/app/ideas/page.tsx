'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getIdeas, getCommentCount } from '@/lib/supabase/ideas';
import { Search, Filter, MessageSquare, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Idea } from '@/types/ideas';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredIdeas(ideas);
      return;
    }

    // デバウンス処理
    const timeoutId = setTimeout(() => {
      const filtered = ideas.filter(
        idea =>
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredIdeas(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [ideas, searchTerm]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const { data, error } = await getIdeas(50, 0);

      if (error) {
        console.error('アイデア取得エラー:', error);
        toast({
          title: 'エラー',
          description: 'アイデアの取得に失敗しました。',
          variant: 'destructive',
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
        title: 'エラー',
        description: '予期しないエラーが発生しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewIdea = (ideaId: string) => {
    router.push(`/ideas/${ideaId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                アイデア一覧
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              革新的なアイデアを発見し、あなたのビジネスに活用してください
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="アイデアを検索..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              フィルター
            </Button>
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
                  進行中
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {ideas.filter(idea => idea.status === 'published').length}
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
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm
                  ? '検索結果が見つかりません'
                  : 'アイデアがまだありません'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? '別のキーワードで検索してみてください'
                  : '最初のアイデアが投稿されるのをお待ちください'}
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
                  className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          {idea.mmb_no}
                        </div>
                        <Badge
                          variant={
                            idea.status === 'published'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
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
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(idea.created_at).toLocaleDateString('ja-JP')}
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
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>
                          by {idea.profiles?.display_name || 'Unknown'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{idea.commentCount || 0}</span>
                        </div>
                      </div>

                      {/* Deadline */}
                      {idea.deadline && (
                        <div className="text-sm text-muted-foreground mb-4">
                          締切:{' '}
                          {new Date(idea.deadline).toLocaleDateString('ja-JP')}
                        </div>
                      )}
                    </div>

                    {/* Actions - 下部固定 */}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewIdea(idea.id)}
                      >
                        詳細を見る・コメントする
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {!loading && filteredIdeas.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" onClick={fetchIdeas}>
                さらに読み込む
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
