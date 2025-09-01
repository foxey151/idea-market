"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { resetPassword } from "@/lib/supabase/auth"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// フォームスキーマ
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("正しいメールアドレス形式で入力してください"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const handleResetPassword = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true)
      const { error } = await resetPassword(data.email)
      
      if (error) {
        toast({
          title: "エラー",
          description: error.message || "パスワードリセットリクエストの送信に失敗しました",
          variant: "destructive"
        })
      } else {
        setSubmittedEmail(data.email)
        setIsSubmitted(true)
        toast({
          title: "送信完了",
          description: "パスワードリセットのメールを送信しました"
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "パスワードリセットリクエストの送信に失敗しました",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
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
            <CardTitle>メールを送信しました</CardTitle>
            <CardDescription>
              パスワードリセットのリンクを {submittedEmail} に送信しました
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
                しばらく待ってもメールが届かない場合は、メールアドレスが正しいかご確認の上、
                再度お試しください。
              </p>
            </div>
            
            <Button
              onClick={() => {
                setIsSubmitted(false)
                setSubmittedEmail("")
              }}
              variant="outline"
              className="w-full"
            >
              別のメールアドレスで試す
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
          <CardTitle>パスワードを忘れた方</CardTitle>
          <CardDescription>
            メールアドレスを入力してください。パスワードリセットのリンクをお送りします。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
            {/* 戻るボタン */}
            <Button
              type="button"
              variant="ghost"
              className="mb-4 p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-1" />
                ログインページに戻る
              </Link>
            </Button>

            {/* メールアドレス */}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'メール送信中...' : 'パスワードリセットメールを送信'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              アカウントをお持ちでない方は{' '}
              <Button variant="link" className="p-0 h-auto text-sm" asChild>
                <Link href="/signup">こちらから会員登録</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
