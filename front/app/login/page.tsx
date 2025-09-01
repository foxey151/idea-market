import { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "ログイン | アイデアマーケット",
  description: "アイデアマーケットにログインして、革新的なアイデアの売買を始めましょう。",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
