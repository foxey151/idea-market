'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  checkAdminStatus,
  getPageContent,
  updatePageContent,
} from '@/lib/supabase/ideas';
import { supabase } from '@/lib/supabase/client';

export function DebugAdmin() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const [pagesContent, setPagesContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      setLoading(true);

      // 現在のユーザー情報
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      setUserInfo({ user, error: userError });

      // 管理者権限チェック
      const adminResult = await checkAdminStatus();
      setAdminStatus(adminResult);

      // プロフィール情報取得
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserInfo((prev: any) => ({
          ...prev,
          profile,
          profileError,
        }));
      }
    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPageContentAccess = async () => {
    try {
      setLoading(true);

      const { data, error } = await getPageContent('terms');
      console.log('Page content test:', { data, error });

      const { data: allData, error: allError } = await supabase
        .from('pages_content')
        .select('*');

      console.log('All pages content:', { allData, allError });
      setPagesContent(allData || []);
    } catch (error) {
      console.error('Page content test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestContent = async () => {
    try {
      setLoading(true);

      const testContent = '<h2>テストコンテンツ</h2><p>これはテストです。</p>';
      const { data, error } = await updatePageContent('terms', testContent);

      console.log('Create test content:', { data, error });

      if (!error) {
        await testPageContentAccess(); // 再取得
      }
    } catch (error) {
      console.error('Create test content error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>管理者デバッグ情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">ユーザー情報</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">管理者権限</h3>
            <div className="flex items-center gap-2">
              <Badge variant={adminStatus?.isAdmin ? 'default' : 'destructive'}>
                {adminStatus?.isAdmin ? '管理者' : '一般ユーザー'}
              </Badge>
              <span>Role: {adminStatus?.role || '不明'}</span>
            </div>
            {adminStatus?.error && (
              <p className="text-red-600 text-sm mt-1">
                エラー: {JSON.stringify(adminStatus.error)}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={checkUserStatus} disabled={loading}>
              ユーザー情報再確認
            </Button>
            <Button
              onClick={testPageContentAccess}
              disabled={loading}
              variant="outline"
            >
              ページコンテンツテスト
            </Button>
            <Button
              onClick={createTestContent}
              disabled={loading}
              variant="outline"
            >
              テストコンテンツ作成
            </Button>
          </div>
        </CardContent>
      </Card>

      {pagesContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pages Content ({pagesContent.length}件)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pagesContent.map((content: any) => (
                <div key={content.id} className="border p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{content.page_type}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(content.updated_at).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <div className="text-sm bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                    {content.content ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: content.content.substring(0, 200) + '...',
                        }}
                      />
                    ) : (
                      <span className="text-gray-500">コンテンツなし</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
