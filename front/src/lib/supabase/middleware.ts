import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    // 環境変数の存在確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase環境変数が設定されていません');
      return supabaseResponse;
    }

    // 動的インポートでSupabaseクライアントを作成（Edge Runtime対応）
    const { createServerClient } = await import('@supabase/ssr');

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options: _options }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
    });

    // ユーザーセッションを更新
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // 認証エラーがある場合はログに記録
    if (authError) {
      console.error('認証エラー:', authError);
    }

    // 認証が必要なページのリスト（より詳細な定義）
    const protectedPaths = [
      '/profile',
      '/my/',
      '/admin',
      '/ideas/new',
      '/ideas/[id]/edit',
      '/ideas/[id]/final',
    ];

    // 編集ページの動的ルートもチェック
    const editPagePattern = /^\/ideas\/[^\/]+\/edit$/;
    const finalPagePattern = /^\/ideas\/[^\/]+\/final$/;

    // 認証が必要なページかどうかをチェック（より厳密に）
    const isProtectedPath =
      protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) ||
      editPagePattern.test(request.nextUrl.pathname) ||
      finalPagePattern.test(request.nextUrl.pathname);

    // セキュリティヘッダーを追加
    supabaseResponse.headers.set('X-Frame-Options', 'DENY');
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
    supabaseResponse.headers.set(
      'Referrer-Policy',
      'strict-origin-when-cross-origin'
    );

    if (
      !user &&
      isProtectedPath &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/signup') &&
      !request.nextUrl.pathname.startsWith('/auth/')
    ) {
      // ログインが必要なページに未認証でアクセスした場合、ログインページにリダイレクト
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set(
        'redirect',
        encodeURIComponent(request.nextUrl.pathname)
      );

      console.log('未認証アクセスをブロック:', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // 管理者ページの追加チェック
    if (request.nextUrl.pathname.startsWith('/admin') && user) {
      // プロファイル情報を取得してロールをチェック
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        // 管理者権限がない場合は403ページにリダイレクト
        const url = request.nextUrl.clone();
        url.pathname = '/403';
        return NextResponse.redirect(url);
      }
    }

    // IMPORTANT: supabaseResponseを返す必要があります
    // これによってcookieが正しく設定されます
    return supabaseResponse;
  } catch (error) {
    console.error('ミドルウェアでエラー:', error);
    // エラーが発生した場合も処理を続行（可用性を優先）
    
    // セキュリティヘッダーを追加
    supabaseResponse.headers.set('X-Frame-Options', 'DENY');
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return supabaseResponse;
  }
}
