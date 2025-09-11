'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Shield } from 'lucide-react';

export function AdminUtils() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const makeUserAdmin = async () => {
    if (!userId && !email) {
      toast({
        title: 'エラー',
        description:
          'ユーザーIDまたはメールアドレスのいずれかを入力してください',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('profiles').update({ role: 'admin' });

      if (userId) {
        query = query.eq('id', userId);
      } else {
        // メールアドレスから該当ユーザーを探す
        const { data: users } = await supabase.auth.admin.listUsers();
        const targetUser = users?.users.find(
          (user: { email?: string }) => user.email === email
        );

        if (!targetUser) {
          throw new Error('指定されたメールアドレスのユーザーが見つかりません');
        }

        query = query.eq('id', targetUser.id);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }

      toast({
        title: '成功',
        description: 'ユーザーを管理者に設定しました',
      });

      setUserId('');
      setEmail('');
    } catch (error) {
      console.error('管理者設定エラー:', error);
      toast({
        title: 'エラー',
        description:
          error instanceof Error ? error.message : '管理者設定に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!userId) {
      toast({
        title: 'エラー',
        description: 'ユーザーIDを入力してください',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert([
        {
          id: userId,
          role: 'admin',
          display_name: email || 'Admin User',
        },
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: '成功',
        description: 'プロファイルを作成しました',
      });

      setUserId('');
      setEmail('');
    } catch (error) {
      console.error('プロファイル作成エラー:', error);
      toast({
        title: 'エラー',
        description:
          error instanceof Error
            ? error.message
            : 'プロファイル作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          管理者ユーティリティ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="userId">ユーザーID (UUID)</Label>
            <Input
              id="userId"
              placeholder="例: 123e4567-e89b-12d3-a456-426614174000"
              value={userId}
              onChange={e => setUserId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              メールアドレス (ユーザーID未入力時に使用)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="例: admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={makeUserAdmin}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            管理者に設定
          </Button>

          <Button
            onClick={createProfile}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            プロファイル作成
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>使用方法:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>管理者に設定:</strong>{' '}
              既存ユーザーのロールを&apos;admin&apos;に変更
            </li>
            <li>
              <strong>プロファイル作成:</strong>{' '}
              プロファイルが存在しない場合に新規作成
            </li>
            <li>ユーザーIDは認証済みユーザーのUUIDを使用してください</li>
            <li>メールアドレスだけでも管理者設定は可能です</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
