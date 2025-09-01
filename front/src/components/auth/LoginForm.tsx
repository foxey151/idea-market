"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/StableAuthContext"
import { supabase } from "@/lib/supabase/client"
import { Mail, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// フォームスキーマ
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("正しいメールアドレス形式で入力してください"),
  password: z
    .string()
    .min(1, "パスワードは必須です"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  
  const [loginMethod, setLoginMethod] = useState<'select' | 'email'>('select')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true)
      console.log('ソーシャルログイン開始:', provider)
      console.log('リダイレクト先:', `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
        }
      })
      
      if (error) {
        console.error('ソーシャルログインエラー:', error)
        toast({
          title: "ログインエラー",
          description: `${provider}ログインエラー: ${error.message}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "ログインエラー",
        description: "ログインに失敗しました",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (data: LoginFormData) => {
    try {
      setLoading(true)
      const { error } = await signIn(data.email, data.password)
      
      if (error) {
        console.error('メールログインエラー:', error)
        toast({
          title: "ログインエラー",
          description: error.message || "メールアドレスまたはパスワードが正しくありません",
          variant: "destructive"
        })
      } else {
        toast({
          title: "ログイン成功",
          description: "ログインしました"
        })
        router.push(redirectTo)
      }
    } catch (error) {
      toast({
        title: "ログインエラー",
        description: "ログインに失敗しました",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                アイデアマーケット
              </span>
            </Link>
          </div>
          <CardTitle>
            {loginMethod === 'select' ? 'ログイン' : 'メールでログイン'}
          </CardTitle>
          <CardDescription>
            {loginMethod === 'select' 
              ? 'ログイン方法を選択してください'
              : 'メールアドレスとパスワードを入力してください'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginMethod === 'select' ? (
            <div className="space-y-4">
              {/* Google ログイン */}
              <Button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                variant="outline"
                className="w-full h-12 text-base"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Googleでログイン
              </Button>

              {/* Facebook ログイン */}
              <Button
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                variant="outline"
                className="w-full h-12 text-base"
              >
                <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebookでログイン
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">または</span>
                </div>
              </div>

              {/* メールログイン */}
              <Button
                onClick={() => setLoginMethod('email')}
                disabled={loading}
                variant="outline"
                className="w-full h-12 text-base"
              >
                <Mail className="w-5 h-5 mr-3" />
                メールでログイン
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                アカウントをお持ちでない方は{' '}
                <Button variant="link" className="p-0 h-auto text-sm" asChild>
                  <Link href="/signup">こちらから会員登録</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleEmailLogin)} className="space-y-4">
              {/* 戻るボタン */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLoginMethod('select')}
                className="mb-4 p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>

              {/* メールアドレス */}
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              
              {/* パスワード */}
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="パスワードを入力"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm text-muted-foreground"
                  asChild
                >
                  <Link href="/forgot-password">
                    パスワードを忘れた方はこちら
                  </Link>
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                アカウントをお持ちでない方は{' '}
                <Button variant="link" className="p-0 h-auto text-sm" asChild>
                  <Link href="/signup">こちらから会員登録</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
