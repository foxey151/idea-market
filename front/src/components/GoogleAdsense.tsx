'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[]; // anyからunknownに変更
  }
}

interface GoogleAdsenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export default function GoogleAdsense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
}: GoogleAdsenseProps) {
  const insRef = useRef<HTMLModElement>(null);
  // const isAdLoaded = useRef(false); // 広告機能無効化のためコメントアウト

  useEffect(() => {
    // 広告機能を無効化：バックエンド処理をコメントアウト
    // UI表示のためのプレースホルダー表示
    if (insRef.current) {
      insRef.current.innerHTML =
        '<div style="background: #f5f5f5; border: 1px dashed #ccc; padding: 20px; text-align: center; color: #666; font-size: 14px;">広告エリア（無効化中）</div>';
    }

    /*
    // 既に広告がロードされている場合はスキップ
    if (isAdLoaded.current) return;

    try {
      if (typeof window !== 'undefined' && insRef.current) {
        // ins要素に既に広告が表示されているかチェック
        const hasAds = insRef.current.getAttribute('data-adsbygoogle-status');
        
        if (!hasAds) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isAdLoaded.current = true;
        }
      }
    } catch (error) {
      console.error('Adsense error:', error);
    }
    */
  }, []);

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-1973699538645453"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}
