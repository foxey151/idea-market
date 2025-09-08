import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">
          お探しのページが見つかりません
        </p>
        <Link
          href="/"
          className="text-primary hover:text-primary/80 underline underline-offset-4"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
