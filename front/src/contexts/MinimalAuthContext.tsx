"use client"

import { createContext, useContext, useEffect, useState } from 'react'

interface MinimalAuthContextType {
  user: any
  profile: any
  session: any
  loading: boolean
  hasCompleteProfile: boolean
  userDetails: any
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, role?: 'member' | 'company') => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateProfile?: (updates: any) => Promise<{ error?: any }>
  refreshUserDetails?: () => Promise<void>
}

const MinimalAuthContext = createContext<MinimalAuthContextType | undefined>(undefined)

export function MinimalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasCompleteProfile, setHasCompleteProfile] = useState(false)
  const [userDetails, setUserDetails] = useState(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('MinimalAuthProvider: 初期化開始')
    
    // 環境変数チェック
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      console.log('MinimalAuthProvider: 環境変数未設定')
      setError('Supabase環境変数が設定されていません')
      setLoading(false)
      return
    }

    // 基本的な初期化のみ（Supabase呼び出しなし）
    setTimeout(() => {
      console.log('MinimalAuthProvider: 初期化完了')
      setLoading(false)
    }, 1000)
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('MinimalAuthProvider: signIn called')
    return { error: 'Minimal implementation - not functional' }
  }

  const signUp = async (email: string, password: string, role: 'member' | 'company' = 'member') => {
    console.log('MinimalAuthProvider: signUp called')
    return { error: 'Minimal implementation - not functional' }
  }

  const signOut = async () => {
    console.log('MinimalAuthProvider: signOut called')
    setUser(null)
  }

  const updateProfile = async (updates: any) => {
    console.log('MinimalAuthProvider: updateProfile called')
    return { error: 'Minimal implementation - not functional' }
  }

  const refreshUserDetails = async () => {
    console.log('MinimalAuthProvider: refreshUserDetails called')
  }

  const value = {
    user,
    profile,
    session,
    loading,
    hasCompleteProfile,
    userDetails,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUserDetails
  }

  return (
    <MinimalAuthContext.Provider value={value}>
      {children}
    </MinimalAuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(MinimalAuthContext)
  if (context === undefined) {
    throw new Error('useAuthはMinimalAuthProvider内で使用する必要があります')
  }
  return context
}
