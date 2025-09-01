import { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"

export const metadata: Metadata = {
  title: "パスワードを忘れた方 | アイデアマーケット",
  description: "パスワードのリセットリンクをメールで送信します。",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <ForgotPasswordForm />
    </div>
  )
}
