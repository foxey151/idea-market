"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { getCurrentUserDetails, type UserDetails } from '@/lib/supabase/user-details'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  userDetails: UserDetails | null
  session: Session | null
  loading: boolean
  hasCompleteProfile: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, role?: 'member' | 'company') => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: any }>
  refreshUserDetails: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCompleteProfile, setHasCompleteProfile] = useState(false)

  useEffect(() => {
    let isMounted = true

    // 初期セッションを取得
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return

        if (error) {
          console.error('AuthContext: セッション取得エラー:', error)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
          await fetchUserDetails()
        }
        
        if (isMounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('AuthContext: 初期化エラー:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
          await fetchUserDetails()
        } else {
          setProfile(null)
          setUserDetails(null)
          setHasCompleteProfile(false)
        }

        if (isMounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('プロファイル取得エラー:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('プロファイル取得エラー:', error)
    }
  }

  const fetchUserDetails = async () => {
    try {
      const result = await getCurrentUserDetails()
      
      if (result && !result.error) {
        setUserDetails(result.data)
        setHasCompleteProfile(checkCompleteProfile(result.data))
      } else {
        setUserDetails(null)
        setHasCompleteProfile(false)
      }
    } catch (error) {
      console.error('ユーザー詳細取得エラー:', error)
      setUserDetails(null)
      setHasCompleteProfile(false)
    }
  }

  const checkCompleteProfile = (details: UserDetails | null): boolean => {
    if (!details) return false
    
    // 必須項目がすべて入力されているかチェック
    return !!(
      details.full_name &&
      details.email &&
      details.bank_name &&
      details.branch_name &&
      details.account_type &&
      details.account_number &&
      details.account_holder &&
      details.gender &&
      details.birth_date &&
      details.prefecture
    )
  }

  const refreshUserDetails = async () => {
    await fetchUserDetails()
  }

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
          data: {
            role,
          },
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

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'ユーザーが認証されていません' }

    try {
      // 型安全性を保つため、明示的に必要なフィールドのみを抽出
      const profileUpdates: Record<string, any> = {}
      
      if (updates.display_name !== undefined) {
        profileUpdates.display_name = updates.display_name
      }
      if (updates.role !== undefined) {
        profileUpdates.role = updates.role
      }

      const { error } = await (supabase as any)
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id)

      if (!error && user) {
        // プロフィールを再取得
        await fetchProfile(user.id)
      }

      return { error }
    } catch (error) {
      return { error }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthはAuthProvider内で使用する必要があります')
  }
  return context
}
