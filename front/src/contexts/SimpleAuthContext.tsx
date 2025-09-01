"use client"

import { createContext, useContext, useEffect, useState } from 'react'

interface SimpleAuthContextType {
  loading: boolean
  user: any
  error: string | null
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('SimpleAuthProvider: 初期化開始')
    
    // 2秒後に初期化完了をシミュレート
    const timer = setTimeout(() => {
      console.log('SimpleAuthProvider: 初期化完了')
      setLoading(false)
      
      // 環境変数チェック
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        setError('Supabase環境変数が設定されていません')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const value = {
    loading,
    user,
    error
  }

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuthはSimpleAuthProvider内で使用する必要があります')
  }
  return context
}
