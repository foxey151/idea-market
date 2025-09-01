"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePassword } from "@/lib/supabase/auth"
import { supabase } from "@/lib/supabase/client"
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// フォームスキーマ
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(12, "パスワードは12文字以上で入力してください")
    .max(128, "パスワードは128文字以内で入力してください")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "パスワードは英大文字、英小文字、数字、記号を含む必要があります"
    ),
  confirmPassword: z
    .string()
    .min(1, "パスワード確認は必須です"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // 認証状態を確認
  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const debugMessages = []
        
        // URLの状態をログ
        const currentUrl = window.location.href
        debugMessages.push(`URL: ${currentUrl}`)
        
        // 現在のセッションを確認
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          debugMessages.push(`セッション取得エラー: ${error.message}`)
          setDebugInfo(debugMessages.join('\n'))
          setIsValidToken(false)
          return
        }

        if (session?.user) {
          // 有効なセッションがある場合
          debugMessages.push(`有効なセッション: ${session.user.id}`)
          setDebugInfo(debugMessages.join('\n'))
          setIsValidToken(true)
          return
        }

        // セッションがない場合、URLからパラメータを確認
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        // URLハッシュからアクセストークンを確認
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const tokenHash = hashParams.get('token_hash')
        const type = hashParams.get('type')
        
        // URLクエリパラメータからもチェック
        const tokenQuery = urlParams.get('token')
        const tokenHashQuery = urlParams.get('token_hash')
        const typeQuery = urlParams.get('type')
        
        debugMessages.push(`Hash params: ${window.location.hash}`)
        debugMessages.push(`Query params: ${window.location.search}`)
        debugMessages.push(`Type: ${type || typeQuery || 'なし'}`)
        
        // パスワードリセット用のトークンがあるか確認
        if ((type === 'recovery' || typeQuery === 'recovery') && 
            (accessToken || tokenHash || tokenHashQuery || tokenQuery)) {
          
          debugMessages.push('パスワードリセットトークンが見つかりました')
          
          if (accessToken && refreshToken) {
            // アクセストークンがある場合はセッションを設定
            debugMessages.push('アクセストークンでセッション設定中...')
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (sessionError) {
              debugMessages.push(`セッション設定エラー: ${sessionError.message}`)
              setDebugInfo(debugMessages.join('\n'))
              setIsValidToken(false)
            } else {
              debugMessages.push('セッション設定成功')
              setDebugInfo(debugMessages.join('\n'))
              setIsValidToken(true)
            }
          } else {
            // その他のトークンがある場合は有効とみなす
            debugMessages.push('その他のトークンで認証')
            setDebugInfo(debugMessages.join('\n'))
            setIsValidToken(true)
          }
        } else {
          // 有効なトークンがない
          debugMessages.push('有効なリセットトークンが見つかりませんでした')
          setDebugInfo(debugMessages.join('\n'))
          setIsValidToken(false)
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        setDebugInfo(`認証確認エラー: ${errorMessage}`)
        setIsValidToken(false)
      }
    }

    checkTokenValidity()
  }, [searchParams])

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true)
      const { error } = await updatePassword(data.password)
      
      if (error) {
        toast({
          title: "エラー",
          description: error.message || "パスワードの更新に失敗しました",
          variant: "destructive"
        })
      } else {
        setIsCompleted(true)
        toast({
          title: "パスワード更新完了",
          description: "パスワードが正常に更新されました"
        })
        
        // 3秒後にログインページにリダイレクト
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "パスワードの更新に失敗しました",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-muted-foreground mt-4">
              認証情報を確認中...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isValidToken === false) {
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
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle>無効なリンクです</CardTitle>
            <CardDescription>
              パスワードリセットリンクが無効または期限切れです
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                パスワードリセットリンクの有効期限は24時間です。
                新しいリセットリクエストを送信してください。
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <div className="p-3 bg-gray-100 rounded-lg border">
                <p className="text-xs font-semibold text-gray-700 mb-2">デバッグ情報:</p>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                  {debugInfo}
                </pre>
              </div>
            )}
            
            <Button className="w-full" asChild>
              <Link href="/forgot-password">
                新しいリセットリクエストを送信
              </Link>
            </Button>
            
            <div className="text-center">
              <Button variant="link" className="text-sm" asChild>
                <Link href="/login">ログインページに戻る</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
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
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>パスワード更新完了</CardTitle>
            <CardDescription>
              パスワードが正常に更新されました
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                3秒後にログインページに移動します...
              </p>
            </div>
            
            <Button className="w-full mt-4" asChild>
              <Link href="/login">今すぐログインページに移動</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle>新しいパスワードを設定</CardTitle>
          <CardDescription>
            安全な新しいパスワードを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
            {/* 新しいパスワード */}
            <div className="space-y-2">
              <Label htmlFor="password">新しいパスワード</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="12文字以上で英大小文字・数字・記号(@$!%*?&)を含む"
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
            
            {/* パスワード確認 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード確認</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="パスワードを再入力"
                  {...register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                パスワードの要件：
              </p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• 12文字以上、128文字以内</li>
                <li>• 英大文字を含む</li>
                <li>• 英小文字を含む</li>
                <li>• 数字を含む</li>
                <li>• 記号（@$!%*?&）を含む</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'パスワード更新中...' : 'パスワードを更新'}
            </Button>

            <div className="text-center">
              <Button variant="link" className="text-sm" asChild>
                <Link href="/login">ログインページに戻る</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
