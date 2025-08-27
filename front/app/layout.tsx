import type { Metadata } from "next";
import "../src/index.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ReactQueryProvider } from "./providers";

export const metadata: Metadata = {
  title: "アイデアマーケット",
  description: "アイデアを価値に変える革新的なマーケットプラットフォーム。技術案・事業案・デザイン・レシピまで、あらゆるアイデアを売買・収益化できます。",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
      { url: "/logo.avif", type: "image/avif" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.avif",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ReactQueryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
