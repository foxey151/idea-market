'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* アイデアマーケットについて */}
          <div>
            <h3 className="text-lg font-semibold mb-4">アイデアマーケット</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  アイデアマーケットとは
                </Link>
              </li>
              <li>
                <Link
                  href="/ideas"
                  className="text-muted-foreground hover:text-foreground"
                >
                  アイデア一覧
                </Link>
              </li>
              <li>
                <Link
                  href="/idea-buy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  アイデア購入
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-muted-foreground hover:text-foreground"
                >
                  アイデア検索
                </Link>
              </li>
              <li>
                <Link
                  href="/ideas/new"
                  className="text-muted-foreground hover:text-foreground"
                >
                  アイデア投稿
                </Link>
              </li>
            </ul>
          </div>

          {/* ユーザー向け */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ユーザー</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/signup"
                  className="text-muted-foreground hover:text-foreground"
                >
                  会員登録
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground"
                >
                  ログイン
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-muted-foreground hover:text-foreground"
                >
                  プロフィール
                </Link>
              </li>
              <li>
                <Link
                  href="/my/ideas"
                  className="text-muted-foreground hover:text-foreground"
                >
                  投稿したアイデア
                </Link>
              </li>
            </ul>
          </div>

          {/* 企業向け */}
          <div>
            <h3 className="text-lg font-semibold mb-4">企業の方へ</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about-ideas"
                  className="text-muted-foreground hover:text-foreground"
                >
                  アイデアとは
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  法人向けサービス
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  広告掲載について
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>

          {/* 規約・情報 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">利用規約・情報</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/commerce"
                  className="text-muted-foreground hover:text-foreground"
                >
                  特定商取引法に基づく表記
                </Link>
              </li>
              <li>
                <Link
                  href="/company"
                  className="text-muted-foreground hover:text-foreground"
                >
                  会社情報
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-muted-foreground text-sm">
              © 2024 アイデアマーケット. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447c0-1.297.49-2.448 1.297-3.323C5.901 8.298 7.052 7.808 8.349 7.808s2.448.49 3.323 1.297c.896.896 1.386 2.047 1.386 3.323 0 1.297-.49 2.448-1.297 3.323-.896.896-2.047 1.386-3.323 1.386z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
