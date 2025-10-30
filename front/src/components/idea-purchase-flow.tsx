import React from 'react';

/**
 * アイデア投稿還元と購入のフロー図
 * - 既存デザイン（Tailwind + shadcn/uiのトーン）に合わせた、レスポンシブSVG
 * - 文字は縮小時も読みやすいようにレイヤを分けてスケール
 */
export default function IdeaPurchaseFlow(): React.ReactElement {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[980px] mx-auto">
        <svg
          viewBox="0 0 980 560"
          className="w-full h-auto text-foreground/80"
          role="img"
          aria-labelledby="flowTitle flowDesc"
        >
          <title id="flowTitle">アイデア投稿還元と購入のフロー</title>
          <desc id="flowDesc">
            購入者から当社、投稿者・改善提案者、消費税納税への資金と情報の流れを示す図。
          </desc>

          <defs>
            {/* 矢印マーカー */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current" />
            </marker>

            {/* ボックス背景 */}
            <linearGradient id="boxBg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--card))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* 購入者 */}
          <g transform="translate(40,100)">
            <rect
              width="160"
              height="64"
              rx="10"
              className="stroke-border fill-[url(#boxBg)]"
            />
            <text x="80" y="40" textAnchor="middle" className="fill-current text-[18px]">
              購入者
            </text>
          </g>

          {/* 当社 */}
          <g transform="translate(400,160)">
            <rect
              width="180"
              height="80"
              rx="12"
              className="stroke-border fill-[url(#boxBg)]"
            />
            <text x="90" y="50" textAnchor="middle" className="fill-current text-[20px]">
              当社
            </text>
          </g>

          {/* 投稿者・改善提案者 */}
          <g transform="translate(360,420)">
            <rect width="120" height="56" rx="10" className="stroke-border fill-[url(#boxBg)]" />
            <text x="60" y="36" textAnchor="middle" className="fill-current text-[16px]">
              投稿者
            </text>
          </g>
          <g transform="translate(520,420)">
            <rect width="160" height="56" rx="10" className="stroke-border fill-[url(#boxBg)]" />
            <text x="80" y="36" textAnchor="middle" className="fill-current text-[16px]">
              改善提案者
            </text>
          </g>

          {/* 消費税納税 */}
          <g transform="translate(740,20)">
            <rect width="180" height="56" rx="10" className="stroke-border fill-[url(#boxBg)]" />
            <text x="90" y="36" textAnchor="middle" className="fill-current text-[16px]">
              消費税納税
            </text>
          </g>

          {/* 矢印: 購入者 → 当社 */}
          <path
            d="M 120 164 V 360 H 380 V 200 H 400"
            className="stroke-current fill-none"
            strokeWidth="2.5"
            markerEnd="url(#arrow)"
          />
          <text x="460" y="104" className="fill-current text-[13px]" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            A（税抜：最低1万円）
          </text>
          <text x="220" y="344" className="fill-current text-[13px]" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            ① 入金：1.1A
          </text>

          {/* 矢印: 当社 → 購入者（②アイデア送信） */}
          <path
            d="M 580 200 V 120 H 220"
            className="stroke-current fill-none"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text x="720" y="150" className="fill-current text-[13px]" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            ② アイデア送信（詳細版）
          </text>
          <text x="720" y="168" className="fill-current text-[12px]" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            入金確認後10日以内
          </text>

          {/* 当社 内の注記：④手数料回収 */}
          <text x="490" y="248" className="fill-current text-[13px]" textAnchor="middle">
            ④ 手数料回収：B = 0.25 × A
          </text>

          {/* 当社 → 投稿者/改善提案者（⑤支払い金D） */}
          <path d="M 490 240 V 320 H 420 V 420" className="stroke-current fill-none" strokeWidth="2" markerEnd="url(#arrow)" />
          <path d="M 490 240 V 320 H 600 V 420" className="stroke-current fill-none" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="260" y="344" className="fill-current text-[13px]" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            ⑤ 支払い金 D = A − (0.25A + C)
          </text>
          <text x="260" y="362" className="fill-current text-[12px]" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            A = (C + D) / 0.75 で設定
          </text>
          <text x="260" y="380" className="fill-current text-[12px]" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            入金確認後10日以内
          </text>

          {/* 当社 → 消費税納税（⑥） */}
          <path d="M 580 200 H 820 V 76" className="stroke-current fill-none" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="820" y="120" textAnchor="middle" className="fill-current text-[13px]" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            ⑥ 支払うべき消費税 1.1 × (C + D)
          </text>

          {/* ③ポイント付与：当社 → 改善提案者 方向の注記 */}
          <text x="676" y="382" className="fill-current text-[13px]" textAnchor="middle" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            ③ ポイント付与：50 × 提案数 = C
          </text>
          <text x="676" y="400" className="fill-current text-[12px]" textAnchor="middle" style={{ paintOrder: 'stroke fill' }} stroke="hsl(var(--background))" strokeWidth={3}>
            10000pt 以上で入金
          </text>
        </svg>
      </div>
      <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
        <p>
          注記：A は販売価格（税抜）、B は手数料、C はポイント付与総額、D は投稿者等への支払い額を表します。
        </p>
      </div>
    </div>
  );
}


