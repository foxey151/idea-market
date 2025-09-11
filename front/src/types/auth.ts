// 認証・ユーザー関連の型定義

/** 認証エラーページのProps型 */
export type AuthCodeErrorProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

/** メール確認ページのProps型 */
export type EmailConfirmedPageProps = {
  searchParams: Promise<{
    type?: string;
    token_hash?: string;
  }>;
};

/** プロフィールページのProps型 */
export type ProfilePageProps = Record<string, never>;

/** ログインページのProps型 */
export type LoginPageProps = {
  searchParams?: Promise<{
    redirectTo?: string;
  }>;
};

/** サインアップページのProps型 */
export type SignupPageProps = {
  searchParams?: Promise<{
    redirectTo?: string;
  }>;
};

/** パスワードリセット関連ページのProps型 */
export type ForgotPasswordPageProps = Record<string, never>;

export type ResetPasswordPageProps = {
  searchParams?: Promise<{
    code?: string;
  }>;
};

/** ユーザープロフィール型 */
export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

/** 認証状態型 */
export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

/** ログインフォームデータ型 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/** サインアップフォームデータ型 */
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  agreeToTerms: boolean;
}
