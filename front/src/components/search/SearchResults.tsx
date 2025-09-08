'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Eye, Calendar } from 'lucide-react';
import { searchIdeas, getIdeaByCmtNo } from '@/lib/supabase/ideas';

interface SearchResult {
  id: string;
  mmb_no: string;
  title: string;
  summary: string;
  created_at: string;
  similarity_score?: number;
  comment_count?: number;
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'keyword';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        if (type === 'cmt') {
          // CMT番号での検索
          const { data, error } = await getIdeaByCmtNo(query);
          if (error) throw error;
          setResults(data ? [data] : []);
        } else {
          // キーワード検索
          const { data, error } = await searchIdeas(query);
          if (error) throw error;
          setResults(data || []);
        }
      } catch (err) {
        console.error('検索エラー:', err);
        setError('検索中にエラーが発生しました');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, type]);

  if (!query) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            検索キーワードまたはCMT番号を入力してください
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-pulse">
            <p className="text-muted-foreground">検索中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            「{query}」に一致するアイデアが見つかりませんでした
          </p>
          <div className="text-sm text-muted-foreground">
            <p>検索のヒント:</p>
            <ul className="mt-2 space-y-1">
              <li>• 別のキーワードで検索してみてください</li>
              <li>• より一般的な用語を使用してください</li>
              <li>• CMT番号は正確に入力してください</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">検索結果: {results.length}件</h2>
        <p className="text-sm text-muted-foreground">検索ワード: 「{query}」</p>
      </div>

      <div className="space-y-4">
        {results.map(result => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">
                      {result.mmb_no}
                    </span>
                    <Badge
                      variant={
                        (result as any).status === 'published'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {(result as any).status === 'published'
                        ? '公開中'
                        : (result as any).status === 'overdue'
                          ? '期限切れ'
                          : (result as any).status === 'closed'
                            ? '完成'
                            : 'その他'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    <Link
                      href={`/ideas/${result.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {result.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    by {(result as any).profiles?.display_name || 'Unknown'}
                  </CardDescription>
                </div>
                {result.similarity_score && (
                  <div className="text-xs text-muted-foreground">
                    関連度: {(result.similarity_score * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {result.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(result.created_at).toLocaleDateString('ja-JP')}
                  </div>
                  {result.comment_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {result.comment_count}件のコメント
                    </div>
                  )}
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/ideas/${result.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    詳細を見る
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
