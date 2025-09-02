'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAdminPermission } from '@/lib/supabase/auth'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { isAdmin: adminStatus, error } = await checkAdminPermission()
        
        if (error) {
          console.error('管理者権限チェックエラー:', error)
          router.push('/403')
          return
        }

        if (!adminStatus) {
          console.log('管理者権限がありません')
          router.push('/403')
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error('管理者権限チェックで予期しないエラー:', error)
        router.push('/403')
      } finally {
        setIsChecking(false)
      }
    }

    checkPermission()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">権限を確認中...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
