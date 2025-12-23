import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = request.url;
  const { searchParams, origin } = new URL(requestUrl);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const error_code = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  // 再ログイン時は必ずトップ画面に遷移する
  const redirectTo =
    type === 'signup'
      ? '/auth/email-confirmed'
      : type === 'recovery'
        ? '/reset-password'
        : '/';

  // エラーがある場合の処理
  if (error_code) {
    console.error(
      'Auth callback - Error from provider:',
      error_code,
      error_description
    );
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(error_description || error_code)}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback - Exchange error:', error);

        // Supabaseのメール認証特有のエラーメッセージを処理
        let errorMessage = error.message;
        if (
          error.message.includes('Email link is invalid') ||
          error.message.includes('expired') ||
          error.message.includes('already been used')
        ) {
          errorMessage = 'email_link_invalid';
        }

        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`
        );
      }

      if (data?.user) {
        // OAuthログイン成功時のログイン履歴を記録
        try {
          // IPアドレスとUser-Agentを取得
          const forwarded = request.headers.get('x-forwarded-for');
          const ip = forwarded
            ? forwarded.split(',')[0]
            : request.headers.get('x-real-ip') || null;
          const userAgent = request.headers.get('user-agent') || null;

          await supabase
            .from('login_history')
            .insert({
              user_id: data.user.id,
              login_status: 'success',
              ip_address: ip,
              user_agent: userAgent,
              failure_reason: null,
              login_at: new Date().toISOString(),
              logout_at: null,
            });
        } catch (logError) {
          // ログイン履歴の記録に失敗してもログイン処理は続行
          console.error('OAuthログイン履歴記録エラー:', logError);
        }

        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectTo}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
        } else {
          return NextResponse.redirect(`${origin}${redirectTo}`);
        }
      } else {
        console.error('Auth callback - No user data received');
        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=no_user_data`
        );
      }
    } catch (err) {
      console.error('Auth callback - Unexpected error:', err);
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=unexpected_error`
      );
    }
  } else {
    console.error('Auth callback - No authorization code received');
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=no_code`
    );
  }
}
