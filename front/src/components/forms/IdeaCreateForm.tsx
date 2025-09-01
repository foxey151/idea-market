"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/StableAuthContext"
import { supabase } from "@/lib/supabase/client"

// アイデア投稿フォームスキーマ
const ideaSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  summary: z
    .string()
    .min(20, "概要は20文字以上で入力してください")
    .max(300, "概要は300文字以内で入力してください"),
  deadline: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true // 任意フィールドなので空でもOK
      const selectedDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // 今日の00:00:00に設定
      return selectedDate > today
    }, "議論期限は明日以降の日付を選択してください"),
  termsAgreed: z
    .boolean()
    .refine((val) => val === true, "利用規約に同意してください"),
})

type IdeaFormData = z.infer<typeof ideaSchema>



export function IdeaCreateForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  // 明日の日付を最小値として設定
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1) // 明日
    return tomorrow.toISOString().slice(0, 10) // YYYY-MM-DD形式
  }
  
  // 環境変数チェック
  const supabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 10 &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 10
  )

  const defaultValues = {
    title: "",
    summary: "",
    deadline: "",
    termsAgreed: false,
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
    defaultValues,
  })



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: IdeaFormData) => {
    try {
      setIsSubmitting(true)

      // ログインユーザーのみ投稿可能に制限
      if (!user) {
        toast({
          title: "ログインが必要です",
          description: "アイデアを投稿するにはログインしてください。",
          variant: "destructive",
        })
        return
      }

      // ユーザープロフィールの存在確認と作成
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.log('プロフィールが存在しないため作成します:', user.id)
        
        // プロフィールを作成
        const { error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            role: 'member',
            display_name: user.email || `ユーザー${user.id.slice(0, 8)}`,
          }])

        if (createError) {
          console.error('プロフィール作成エラー:', createError)
          toast({
            title: "プロフィール作成エラー",
            description: "ユーザープロフィールの作成に失敗しました。",
            variant: "destructive",
          })
          return
        }
      }

      // ファイルアップロード処理（必要に応じて）
      let attachments: string[] = []
      if (uploadedFiles.length > 0) {
        // TODO: Supabase Storageにファイルをアップロード
        // attachments = await uploadFiles(uploadedFiles)
      }

      // 投稿データの準備
      const ideaInsertData = {
        title: data.title,
        summary: data.summary,
        deadline: data.deadline || null, // 空文字の場合はnullに変換
        status: 'published' as const,
        author_id: user.id,
      }

      // デバッグ情報
      console.log('投稿データ:', ideaInsertData)
      console.log('ユーザー情報:', user)

      // アイデアをデータベースに保存
      const { data: ideaData, error } = await supabase
        .from('ideas')
        .insert([ideaInsertData])
        .select()
        .single()

      console.log('Supabase応答:', { data: ideaData, error })

      if (error) {
        console.error('Supabaseエラー詳細:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      // CMT番号の表示と成功メッセージ
      toast({
        title: "アイデアを投稿しました！",
        description: `MMB番号: ${ideaData.mmb_no}が発行されました。`,
      })

      // アイデア一覧ページにリダイレクト
      router.push('/ideas')

    } catch (error) {
      console.error('アイデア投稿エラー:', error)
      
      // エラーの詳細を取得
      let errorMessage = "しばらく時間をおいて再度お試しください。"
      
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = String(error.message)
        } else if ('details' in error) {
          errorMessage = String(error.details)
        } else if ('hint' in error) {
          errorMessage = String(error.hint)
        }
      }
      
      toast({
        title: "投稿に失敗しました",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">アイデア登録</h1>
        <p className="text-muted-foreground">
          新しいアイデアを投稿して、コミュニティと共有しましょう。
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Supabase設定エラー */}
        {!supabaseConfigured && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-destructive">環境設定エラー</h3>
                <p className="text-muted-foreground mb-4">
                  Supabaseの環境変数が設定されていません。<br />
                  `.env.local`ファイルに以下の変数を設定してください：<br />
                  • NEXT_PUBLIC_SUPABASE_URL<br />
                  • NEXT_PUBLIC_SUPABASE_ANON_KEY
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ログイン済みユーザーのみアクセス可能 */}
        {!user && supabaseConfigured && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">ログインが必要です</h3>
                <p className="text-muted-foreground mb-4">
                  アイデアを投稿するにはログインしてください。
                </p>
                <Button onClick={() => router.push('/login')}>
                  ログインページへ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ログイン済みユーザーのみフォーム表示 */}
        {user && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>
                  アイデアの基本的な情報を入力してください。
                </CardDescription>
              </CardHeader>
          <CardContent className="space-y-6">
            {/* タイトル */}
            <div className="space-y-2">
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                placeholder="例：AI活用の新しい学習プラットフォーム"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{String(errors.title?.message || '')}</p>
              )}
            </div>



            {/* 概要 */}
            <div className="space-y-2">
              <Label htmlFor="summary">概要 *</Label>
              <Textarea
                id="summary"
                placeholder="アイデアの簡潔な説明を入力してください（20文字以上、300文字以内）"
                rows={6}
                {...register("summary")}
              />
              <div className="text-sm text-muted-foreground">
                {watch("summary")?.length || 0} / 300文字
              </div>
              {errors.summary && (
                <p className="text-sm text-destructive">{String(errors.summary?.message || '')}</p>
              )}
            </div>

            {/* 議論期限 */}
            <div className="space-y-2">
              <Label htmlFor="deadline">議論期限（任意）</Label>
              <Input
                id="deadline"
                type="date"
                min={getMinDate()}
                {...register("deadline")}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                議論期限を設定すると、その日付まで他のユーザーからのコメントや意見を受け付けます。
                設定しない場合は無期限で議論が可能です。
              </div>
              {errors.deadline && (
                <p className="text-sm text-destructive">{String(errors.deadline?.message || '')}</p>
              )}
            </div>


          </CardContent>
        </Card>

        {/* ファイル添付 */}
        <Card>
          <CardHeader>
            <CardTitle>ファイル添付</CardTitle>
            <CardDescription>
              関連する資料やファイルを添付できます（任意）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    ファイルをドラッグ&ドロップまたはクリックして選択
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, PNG, JPG, WEBP (最大20MB)
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">添付ファイル:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* 確認・同意 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termsAgreed"
                  onCheckedChange={(checked) => setValue("termsAgreed", !!checked)}
                />
                <Label htmlFor="termsAgreed" className="text-sm">
                  <span className="text-destructive">*</span> 
                  <Link href="/terms" target="_blank" className="text-primary hover:underline mx-1">
                    利用規約
                  </Link>
                  に同意する
                </Label>
              </div>
              {errors.termsAgreed && (
                <p className="text-sm text-destructive">{String(errors.termsAgreed?.message || '')}</p>
              )}
            </div>
          </CardContent>
        </Card>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting || !supabaseConfigured}>
                {isSubmitting ? "投稿中..." : "アイデアを投稿する"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
