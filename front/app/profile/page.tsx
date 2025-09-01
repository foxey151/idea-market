"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/StableAuthContext'
import UserProfileForm from '@/components/forms/UserProfileForm'
import UserProfileView from '@/components/forms/UserProfileView'

export default function ProfilePage() {
  const { user, hasCompleteProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login?redirect=' + encodeURIComponent('/profile'))
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  // 認証されていない場合は何も表示しない（リダイレクト中）
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>ログインページにリダイレクト中...</p>
        </div>
      </div>
    )
  }

  // プロフィールが完了している場合は確認・編集画面を表示
  // まだ登録していない場合は登録フォームを表示
  return hasCompleteProfile ? <UserProfileView /> : <UserProfileForm />
}
