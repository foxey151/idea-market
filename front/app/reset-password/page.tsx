import { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

export const metadata: Metadata = {
  title: "パスワード再設定 | アイデアマーケット",
  description: "新しいパスワードを設定してください。",
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  )
}
