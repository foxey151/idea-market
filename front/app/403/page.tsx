"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">アクセス拒否</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            このページにアクセスする権限がありません。
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              前のページに戻る
            </Button>
            <Button 
              onClick={() => router.push('/')} 
              className="w-full"
            >
              ホームページに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
