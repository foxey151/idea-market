'use client';

import { useState, useEffect } from 'react';
import { checkAdminPermission } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function AdminDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkDebugInfo = async () => {
    setLoading(true);
    try {
      // 1. 現在のユーザー情報を取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      // 2. プロファイル情報を取得
      let profileData = null;
      let profileError = null;

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        profileData = data;
        profileError = error;
      }

      // 3. 管理者権限チェックを実行
      const adminCheck = await checkAdminPermission();

      setDebugInfo({
        timestamp: new Date().toISOString(),
        user: {
          exists: !!user,
          id: user?.id,
          email: user?.email,
          role: user?.role,
          error: userError?.message,
        },
        profile: {
          exists: !!profileData,
          data: profileData,
          error: profileError?.message,
        },
        adminCheck: {
          isAdmin: adminCheck.isAdmin,
          error: adminCheck.error?.message,
        },
      });
    } catch (error) {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDebugInfo();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          管理者権限デバッグ情報
          <Button
            onClick={checkDebugInfo}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            更新
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {debugInfo ? (
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">デバッグ情報を読み込み中...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
