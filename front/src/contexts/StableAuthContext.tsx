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
          (event: unknown, session: any) => {
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

  // プロフィール情報とユーザー詳細を読み込み
  const loadProfile = useCallback(async (userId: string) => {
    try {
      // プロフィール情報を取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError || !mountedRef.current) {
        if (profileError) console.error('プロフィール取得エラー:', profileError)
        return
      }

      setProfile(profileData)

      // ユーザー詳細情報を取得
      const { data: userDetailsData, error: userDetailsError } = await supabase
        .from('user_details')
        .select('*')
        .eq('user_id', userId)
        .single()

      // ユーザー詳細情報が存在しない場合は正常（初回ユーザー）
      if (userDetailsError && userDetailsError.code !== 'PGRST116') {
        console.error('ユーザー詳細取得エラー:', userDetailsError)
        setUserDetails(null)
        setHasCompleteProfile(false)
        return
      }

      const details = userDetailsError?.code === 'PGRST116' ? null : userDetailsData
      setUserDetails(details)
      checkProfileCompletion(details)
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
      setProfile(null)
      setUserDetails(null)
      setHasCompleteProfile(false)
    }
  }, [])

  // ユーザー詳細情報の完了状況をチェックする関数
  const checkProfileCompletion = useCallback((userDetailsData: any) => {
    if (!userDetailsData) {
      setHasCompleteProfile(false)
      return
    }

    // user_detailsテーブルの必須フィールドがすべて入力されているかチェック
    const requiredFields = [
      'full_name',
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
      const value = userDetailsData[field]
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
      const redirectUrl = `${window.location.origin}/auth/callback?type=signup`
      console.log('=== SignUp Debug Info ===')
      console.log('Email:', email)
      console.log('Role:', role)
      console.log('Redirect URL:', redirectUrl)
      console.log('Window origin:', window.location.origin)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
          emailRedirectTo: redirectUrl,
        },
      })
      
      console.log('SignUp result:', { data, error })
      if (data?.user) {
        console.log('User created:', data.user.id, 'Email confirmed:', data.user.email_confirmed_at)
      }
      
      return { error }
    } catch (error) {
      console.error('SignUp exception:', error)
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
    if (user?.id) {
      await loadProfile(user.id)
    }
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
