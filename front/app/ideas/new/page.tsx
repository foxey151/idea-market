import { Metadata } from "next"
import { IdeaCreateForm } from "@/components/forms/IdeaCreateForm"

export const metadata: Metadata = {
  title: "アイデア登録 | アイデアマーケット",
  description: "新しいアイデアを投稿して、コミュニティと共有しましょう。",
}

export default function IdeaCreatePage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-8">
        <IdeaCreateForm />
      </div>
    </div>
  )
}
