'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import { AdminGuard } from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Search, RefreshCw, ShieldCheck, Users } from 'lucide-react';

interface PurchasableIdea {
  id: string;
  mmb_no: string;
  title: string;
  summary: string | null;
  status: string;
  is_exclusive: boolean;
  purchase_count: number;
  price: string | null;
  created_at: string;
  profiles?: { id: string; display_name: string | null } | null;
}

export default function AdminExclusiveContractPage() {
  const [ideas, setIdeas] = useState<PurchasableIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [reloading, setReloading] = useState(false);
  const [contracting, setContracting] = useState<Set<string>>(new Set());

  const fetchIdeas = async (params?: { q?: string }) => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (params?.q) query.set('q', params.q);
      const res = await fetch(`/api/admin/exclusive-contract?${query.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || '取得に失敗しました');
      setIdeas(json.data || []);
    } catch (e: any) {
      toast({ title: 'エラー', description: e.message ?? '取得に失敗しました', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const onContract = async (ideaId: string) => {
    if (!confirm('このアイデアを独占契約にしますか？この操作は元に戻せません。')) return;

    try {
      setContracting(prev => new Set(prev).add(ideaId));
      const res = await fetch('/api/admin/exclusive-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || '契約に失敗しました');
      
      // リストから削除（独占契約になったので購入可能リストから外れる）
      setIdeas(prev => prev.filter(i => i.id !== ideaId));
      toast({ title: '契約完了', description: '独占契約を結びました' });
    } catch (e: any) {
      toast({ title: 'エラー', description: e.message ?? '契約に失敗しました', variant: 'destructive' });
    } finally {
      setContracting(prev => {
        const next = new Set(prev);
        next.delete(ideaId);
        return next;
      });
    }
  };

  const onSearch = () => fetchIdeas({ q: search.trim() || undefined });
  const onReload = async () => {
    setReloading(true);
    await fetchIdeas({ q: search.trim() || undefined });
    setReloading(false);
  };

  const filteredIdeas = useMemo(() => {
    if (!search.trim()) return ideas;
    const q = search.toLowerCase();
    return ideas.filter(
      i =>
        i.mmb_no.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        (i.summary && i.summary.toLowerCase().includes(q))
    );
  }, [ideas, search]);

  const totalCount = useMemo(() => ideas.length, [ideas]);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <span className="bg-gradient-primary bg-clip-text text-transparent">独占契約管理</span>
              </h1>
              <p className="text-muted-foreground">購入可能なアイデアを独占契約に設定します</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="MMB番号 / タイトル / 概要 で検索"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={onSearch} className="whitespace-nowrap">検索</Button>
              <Button variant="outline" onClick={onReload} className="flex items-center gap-2 whitespace-nowrap">
                <RefreshCw className={`h-4 w-4 ${reloading ? 'animate-spin' : ''}`} /> 再読込
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">完成済みアイデア数（価格設定済み）</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCount}</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-sm text-muted-foreground">読み込み中...</div>
              ) : filteredIdeas.length === 0 ? (
                <div className="text-sm text-muted-foreground">データがありません</div>
              ) : (
                filteredIdeas.map(idea => (
                  <div key={idea.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{new Date(idea.created_at).toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="text-sm font-medium truncate flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="text-muted-foreground">{idea.mmb_no}</span>
                          <span className="truncate">{idea.title}</span>
                        </div>
                        {idea.summary && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {idea.summary}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="text-xs text-muted-foreground">
                            作成者: {idea.profiles?.display_name || 'Unknown'}
                          </div>
                          {idea.purchase_count > 0 && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Users className="h-3 w-3" />
                              <span>{idea.purchase_count}人購入</span>
                            </div>
                          )}
                          {idea.price && (
                            <div className="text-xs text-muted-foreground">
                              価格: ¥{parseInt(idea.price, 10).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => onContract(idea.id)}
                          disabled={contracting.has(idea.id)}
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          {contracting.has(idea.id) ? '処理中...' : '契約する'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}

