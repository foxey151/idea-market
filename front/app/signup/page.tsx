import { Metadata } from "next"
import { SignupForm } from "@/components/auth/SignupForm"

export const metadata: Metadata = {
  title: "新規登録 | アイデアマーケット",
  description: "アイデアマーケットのアカウントを作成して、革新的なアイデアの売買を始めましょう。",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <SignupForm />
    </div>
  )
}
