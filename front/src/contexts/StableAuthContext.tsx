"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface StableAuthContextType {
  user: User | null
  profile: Profile | null
  userDetails: any
  session: Session | null
  loading: boolean
  hasCompleteProfile: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, role?: 'member' | 'company') => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<{ error?: any }>
  refreshUserDetails: () => Promise<void>
}

const StableAuthContext = createContext<StableAuthContextType | undefined>(undefined)

export function StableAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCompleteProfile, setHasCompleteProfile] = useState(false)
  
  // 初期化済みフラグで重複実行を防ぐ
  const initializeRef = useRef(false)
  const mountedRef = useRef(true)

  // 段階的初期化：まず認証状態のみ
  useEffect(() => {
    if (initializeRef.current) return
    initializeRef.current = true

    const initAuth = async () => {
      try {
        // 環境変数チェック
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url || !key) {
          console.error('Supabase環境変数が未設定')
          setLoading(false)
          return
        }

        // セッション取得のみ
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mountedRef.current) return

        if (error) {
          console.error('セッション取得エラー:', error)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // 認証状態の監視開始
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mountedRef.current) return
            
            setSession(session)
            setUser(session?.user ?? null)
          }
        )

        // クリーンアップ関数を返す
        return () => subscription.unsubscribe()
      } catch (error) {
        console.error('認証初期化エラー:', error)
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    const cleanup = initAuth()
    
    return () => {
      mountedRef.current = false
      cleanup?.then(fn => fn?.())
    }
  }, [])

  // プロフィール情報は別で管理（無限ループを避ける）
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && mountedRef.current) {
        setProfile(data)
        // プロフィール完了状況をチェック
        checkProfileCompletion(data)
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
    }
  }, [])

  // プロフィール完了状況をチェックする関数
  const checkProfileCompletion = useCallback((profileData: Profile | null) => {
    if (!profileData) {
      setHasCompleteProfile(false)
      return
    }

    // 必須フィールドがすべて入力されているかチェック
    const requiredFields = [
      'display_name',
      'email',
      'bank_name',
      'branch_name', 
      'account_type',
      'account_number',
      'account_holder',
      'gender',
      'birth_date',
      'prefecture'
    ]

    const isComplete = requiredFields.every(field => {
      const value = profileData[field as keyof Profile]
      return value !== null && value !== undefined && value !== ''
    })

    setHasCompleteProfile(isComplete)
  }, [])

  // ユーザー変更時のみプロフィール読み込み
  useEffect(() => {
    if (user?.id && !loading) {
      loadProfile(user.id)
    } else {
      setProfile(null)
      setUserDetails(null)
      setHasCompleteProfile(false)
    }
  }, [user?.id, loading, loadProfile])

  // 認証メソッド
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, role: 'member' | 'company' = 'member') => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('サインアウトエラー:', error)
    }
  }

  const updateProfile = async (updates: any) => {
    return { error: 'Not implemented yet' }
  }

  const refreshUserDetails = async () => {
    // 実装を後で追加
  }

  const value = {
    user,
    profile,
    userDetails,
    session,
    loading,
    hasCompleteProfile,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUserDetails,
  }

  return (
    <StableAuthContext.Provider value={value}>
      {children}
    </StableAuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(StableAuthContext)
  if (context === undefined) {
    throw new Error('useAuthはStableAuthProvider内で使用する必要があります')
  }
  return context
}
