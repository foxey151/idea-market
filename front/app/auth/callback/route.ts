import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirectTo') ?? searchParams.get('next') ?? 
    (type === 'signup' ? '/auth/email-confirmed' : '/')
  
  console.log('Auth callback - Code:', code ? 'Present' : 'Missing')
  console.log('Auth callback - RedirectTo:', redirectTo)
  console.log('Auth callback - All params:', Object.fromEntries(searchParams.entries()))

  if (code) {
    try {
      const supabase = await createClient()
      console.log('Auth callback - Attempting to exchange code for session')
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback - Exchange error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
      }
      
      if (data?.user) {
        console.log('Auth callback - User authenticated:', data.user.id)
        
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectTo}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`)
        } else {
          return NextResponse.redirect(`${origin}${redirectTo}`)
        }
      } else {
        console.error('Auth callback - No user data received')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_user_data`)
      }
    } catch (err) {
      console.error('Auth callback - Unexpected error:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`)
    }
  } else {
    console.error('Auth callback - No authorization code received')
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
  }
}
