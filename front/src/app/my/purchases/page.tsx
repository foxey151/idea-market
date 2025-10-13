'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/StableAuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { cancelMyPurchase, getMyPurchases } from '@/lib/supabase/ideas';

type SoldRow = {
  id: string;
  idea_id: string;
  user_id: string;
  is_paid: boolean;
  phone_number: string;
  company: string | null;
  manager: string | null;
  created_at: string;
  updated_at: string;
  ideas?: { id: string; title: string; mmb_no: string; status: 'published' | 'overdue' | 'closed' | 'soldout' } | null;
};

export default function MyPurchasesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<SoldRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=' + encodeURIComponent('/my/purchases'));
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.id) {
      fetchRows();
    }
  }, [user?.id]);

  const fetchRows = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await getMyPurchases(user.id, 100, 0);
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      toast({ title: 'エラー', description: e?.message ?? '購入履歴の取得に失敗しました', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.ideas?.title?.toLowerCase() || '').includes(q) ||
      (r.ideas?.mmb_no?.toLowerCase() || '').includes(q) ||
      (r.company?.toLowerCase() || '').includes(q) ||
      (r.manager?.toLowerCase() || '').includes(q)
    );
  }, [rows, search]);

  const onCancel = async (soldId: string) => {
    if (!user?.id) return;
    try {
      const { error } = await cancelMyPurchase({ soldId, userId: user.id });
      if (error) throw error;
      toast({ title: '購入を取消しました', description: '対象のアイデアを再公開しました。' });
      setRows(prev => prev.filter(r => r.id !== soldId));
    } catch (e: any) {
      toast({ title: 'エラー', description: e?.message ?? '取消に失敗しました', variant: 'destructive' });
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      published: 'bg-green-100 text-green-800',
      overdue: 'bg-orange-100 text-orange-800',
      closed: 'bg-blue-100 text-blue-800',
      soldout: 'bg-red-100 text-red-800',
    };
    const text: Record<string, string> = {
      published: '公開中',
      overdue: '期限切れ',
      closed: '完成',
      soldout: '売り切れ',
    };
    return <Badge className={map[status] || 'bg-gray-100 text-gray-800'}>{text[status] || status}</Badge>;
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>購入したアイデア</CardTitle>
            <div className="w-64">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="タイトル・管理番号・会社・担当者で検索"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">読み込み中…</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground">購入履歴がありません。</div>
            ) : (
              <div className="space-y-4">
                {filtered.map(row => (
                  <div key={row.id} className="flex items-center justify-between rounded-md border p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{row.ideas?.mmb_no}</span>
                        <span className="font-medium">{row.ideas?.title}</span>
                        {row.ideas?.status && statusBadge(row.ideas.status)}
                        {row.is_paid ? (
                          <Badge className="bg-emerald-100 text-emerald-800">支払い済み</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">未払い</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        購入日: {new Date(row.created_at).toLocaleString('ja-JP')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        会社/氏名: {row.company || '-'} / 担当: {row.manager || '-'} / 連絡先: {row.phone_number}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertDialog open={cancelTargetId === row.id} onOpenChange={open => setCancelTargetId(open ? row.id : null)}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => setCancelTargetId(row.id)}>
                            購入を取消
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>購入を取消しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は取り消せません。取消すると該当アイデアは再公開されます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onCancel(row.id)}>取消する</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}




