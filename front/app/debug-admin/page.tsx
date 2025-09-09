import { AdminDebug } from '@/components/debug/AdminDebug';
import { AdminUtils } from '@/components/debug/AdminUtils';

export default function AdminDebugPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              管理者権限デバッグ
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            現在のユーザーの権限とプロファイル情報を確認できます
          </p>
        </div>
        
        <div className="space-y-8">
          <AdminDebug />
          <AdminUtils />
        </div>
      </div>
    </div>
  );
}
