import type { Metadata } from 'next';
// import Script from 'next/script'; // 現在未使用
import '../src/index.css';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
// import { AuthProvider } from "@/contexts/AuthContext"; // 使用されていないためコメントアウト
// import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext"; // 使用されていないためコメントアウト
// import { MinimalAuthProvider } from "@/contexts/MinimalAuthContext"; // 使用されていないためコメントアウト
import { StableAuthProvider } from '@/contexts/StableAuthContext';
// import ProfileGuard from "@/components/ProfileGuard"; // 一時的に無効化中
import EnvCheck from '@/components/EnvCheck';

import { ReactQueryProvider } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'アイデアマーケット',
  description:
    'アイデアを価値に変える革新的なマーケットプラットフォーム。技術案・事業案・デザイン・レシピまで、あらゆるアイデアを売買・収益化できます。',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/logo.avif', type: 'image/avif' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.avif',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* 広告スクリプトをコメントアウト：バックエンド処理を無効化
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1973699538645453"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        */}
      </head>
      <body>
        <EnvCheck />
        <StableAuthProvider>
          <ReactQueryProvider>
            <TooltipProvider>
              {/* ProfileGuardは一時的に無効化 */}
              {/* <ProfileGuard> */}
              <Header />
              <main className="pt-20">{children}</main>
              <Footer />
              <Toaster />
              <Sonner />
              {/* </ProfileGuard> */}
            </TooltipProvider>
          </ReactQueryProvider>
        </StableAuthProvider>
      </body>
    </html>
  );
}
