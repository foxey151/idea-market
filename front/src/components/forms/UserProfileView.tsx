"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/StableAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, User, CreditCard, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getCurrentUserDetails,
  upsertUserDetails,
  ACCOUNT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  PREFECTURE_OPTIONS,
  validateEmail,
  validateAccountNumber,
  validateBirthDate,
  type UserDetails,
  type UserDetailsInsert,
  type AccountType,
  type Gender,
  type Prefecture
} from '@/lib/supabase/user-details'

interface FormData {
  full_name: string
  email: string
  bank_name: string
  branch_name: string
  account_type: AccountType | ''
  account_number: string
  account_holder: string
  gender: Gender | ''
  birth_date: string
  prefecture: Prefecture | ''
}

interface FormErrors {
  full_name?: string
  email?: string
  bank_name?: string
  branch_name?: string
  account_type?: string
  account_number?: string
  account_holder?: string
  gender?: string
  birth_date?: string
  prefecture?: string
}

const BANK_OPTIONS = [
  'みずほ銀行',
  '三菱UFJ銀行',
  '三井住友銀行',
  'りそな銀行',
  '埼玉りそな銀行',
  'ゆうちょ銀行',
  '楽天銀行',
  'ジャパンネット銀行',
  'その他'
]

export default function UserProfileView() {
  const { user, profile, refreshUserDetails, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    bank_name: '',
    branch_name: '',
    account_type: '',
    account_number: '',
    account_holder: '',
    gender: '',
    birth_date: '',
    prefecture: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // ユーザーが認証されていない場合、ログインページにリダイレクト
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    loadUserDetails()
  }, [user, authLoading])

  const loadUserDetails = async () => {
    setIsLoading(true)
    try {
      const result = await getCurrentUserDetails()
      
      if (result && !result.error && result.data) {
        const details: UserDetails = result.data
        setUserDetails(details)
        setFormData({
          full_name: details.full_name || '',
          email: details.email || user?.email || '',
          bank_name: details.bank_name || '',
          branch_name: details.branch_name || '',
          account_type: details.account_type || '',
          account_number: details.account_number || '',
          account_holder: details.account_holder || '',
          gender: details.gender || '',
          birth_date: details.birth_date || '',
          prefecture: details.prefecture || ''
        })
      }
    } catch (error) {
      console.error('ユーザー詳細情報の取得に失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = '氏名は必須です'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください'
    }

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = '銀行名は必須です'
    }

    if (!formData.branch_name.trim()) {
      newErrors.branch_name = '支店名は必須です'
    }

    if (!formData.account_type) {
      newErrors.account_type = '口座種別を選択してください'
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = '口座番号は必須です'
    } else if (!validateAccountNumber(formData.account_number)) {
      newErrors.account_number = '口座番号は7-8桁の数字で入力してください'
    }

    if (!formData.account_holder.trim()) {
      newErrors.account_holder = '口座名義は必須です'
    }

    if (!formData.gender) {
      newErrors.gender = '性別を選択してください'
    }

    if (!formData.birth_date) {
      newErrors.birth_date = '生年月日は必須です'
    } else if (!validateBirthDate(formData.birth_date)) {
      newErrors.birth_date = '正しい生年月日を入力してください'
    }

    if (!formData.prefecture) {
      newErrors.prefecture = '居住都道府県を選択してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: 'ユーザーが認証されていません',
        description: 'ログインしてから再度お試しください。',
        variant: 'destructive',
      })
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const userDetailsData: UserDetailsInsert = {
        user_id: user.id,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        bank_name: formData.bank_name.trim(),
        branch_name: formData.branch_name.trim(),
        account_type: formData.account_type as AccountType,
        account_number: formData.account_number.trim(),
        account_holder: formData.account_holder.trim(),
        gender: formData.gender as Gender,
        birth_date: formData.birth_date,
        prefecture: formData.prefecture as Prefecture
      }

      const { error } = await upsertUserDetails(userDetailsData)
      
      if (error) {
        toast({
          title: 'プロフィールの更新に失敗しました',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      await refreshUserDetails()
      await loadUserDetails()
      
      toast({
        title: 'プロフィールが正常に更新されました',
        description: '変更内容が保存されました。',
      })
      setIsEditing(false)
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      toast({
        title: 'プロフィールの更新中にエラーが発生しました',
        description: 'しばらく時間をおいて再度お試しください。',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    if (userDetails) {
      setFormData({
        full_name: userDetails.full_name || '',
        email: userDetails.email || user?.email || '',
        bank_name: userDetails.bank_name || '',
        branch_name: userDetails.branch_name || '',
        account_type: userDetails.account_type || '',
        account_number: userDetails.account_number || '',
        account_holder: userDetails.account_holder || '',
        gender: userDetails.gender || '',
        birth_date: userDetails.birth_date || '',
        prefecture: userDetails.prefecture || ''
      })
    }
    setErrors({})
    setIsEditing(false)
  }

  const getDisplayValue = (value: string | null | undefined, fallback: string = '未設定') => {
    return value || fallback
  }

  const formatAccountType = (type: string) => {
    const option = ACCOUNT_TYPE_OPTIONS.find(opt => opt.value === type)
    return option?.label || type
  }

  const formatGender = (gender: string) => {
    const option = GENDER_OPTIONS.find(opt => opt.value === gender)
    return option?.label || gender
  }

  const formatPrefecture = (prefecture: string) => {
    const option = PREFECTURE_OPTIONS.find(opt => opt.value === prefecture)
    return option?.label || prefecture
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">プロフィール</h1>
          <p className="text-muted-foreground">アカウント情報の確認・変更</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <User className="w-3 h-3 mr-1" />
          登録済み
        </Badge>
      </div>

      {!isEditing ? (
        // 表示モード
        <div className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  基本情報
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                編集
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">氏名</Label>
                <p className="text-sm mt-1">{getDisplayValue(userDetails?.full_name)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">メールアドレス</Label>
                <p className="text-sm mt-1">{getDisplayValue(userDetails?.email)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">性別</Label>
                <p className="text-sm mt-1">{userDetails?.gender ? formatGender(userDetails.gender) : '未設定'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">生年月日</Label>
                <p className="text-sm mt-1">{getDisplayValue(userDetails?.birth_date)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">居住都道府県</Label>
                <p className="text-sm mt-1">{userDetails?.prefecture ? formatPrefecture(userDetails.prefecture) : '未設定'}</p>
              </div>
            </CardContent>
          </Card>

          {/* 銀行情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                銀行情報
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">銀行名</Label>
                <p className="text-sm mt-1">{getDisplayValue(userDetails?.bank_name)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">支店名</Label>
                <p className="text-sm mt-1">{getDisplayValue(userDetails?.branch_name)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">口座種別</Label>
                <p className="text-sm mt-1">{userDetails?.account_type ? formatAccountType(userDetails.account_type) : '未設定'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">口座番号</Label>
                <p className="text-sm mt-1">{userDetails?.account_number ? `****${userDetails.account_number.slice(-4)}` : '未設定'}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-muted-foreground">口座名義</Label>
                <p className="text-sm mt-1">{getDisplayValue(userDetails?.account_holder)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // 編集モード
        <Card>
          <CardHeader>
            <CardTitle>プロフィール編集</CardTitle>
            <CardDescription>
              情報を変更して保存してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">基本情報</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">氏名 <span className="text-red-500">*</span></Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="山田 太郎"
                      className={errors.full_name ? 'border-red-500' : ''}
                    />
                    {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="example@email.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label>性別 <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                      className="flex gap-6"
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value}>{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">生年月日 <span className="text-red-500">*</span></Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={errors.birth_date ? 'border-red-500' : ''}
                    />
                    {errors.birth_date && <p className="text-red-500 text-sm">{errors.birth_date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prefecture">居住都道府県 <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.prefecture}
                      onValueChange={(value) => handleInputChange('prefecture', value)}
                    >
                      <SelectTrigger className={errors.prefecture ? 'border-red-500' : ''}>
                        <SelectValue placeholder="都道府県を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREFECTURE_OPTIONS.map((prefecture) => (
                          <SelectItem key={prefecture.value} value={prefecture.value}>
                            {prefecture.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.prefecture && <p className="text-red-500 text-sm">{errors.prefecture}</p>}
                  </div>
                </div>
              </div>

              {/* 銀行情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">銀行情報</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">銀行名 <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.bank_name}
                      onValueChange={(value) => handleInputChange('bank_name', value)}
                    >
                      <SelectTrigger className={errors.bank_name ? 'border-red-500' : ''}>
                        <SelectValue placeholder="銀行を選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANK_OPTIONS.map((bank) => (
                          <SelectItem key={bank} value={bank}>
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bank_name && <p className="text-red-500 text-sm">{errors.bank_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch_name">支店名 <span className="text-red-500">*</span></Label>
                    <Input
                      id="branch_name"
                      type="text"
                      value={formData.branch_name}
                      onChange={(e) => handleInputChange('branch_name', e.target.value)}
                      placeholder="本店"
                      className={errors.branch_name ? 'border-red-500' : ''}
                    />
                    {errors.branch_name && <p className="text-red-500 text-sm">{errors.branch_name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label>口座種別 <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.account_type}
                      onValueChange={(value) => handleInputChange('account_type', value)}
                      className="flex gap-6"
                    >
                      {ACCOUNT_TYPE_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value}>{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.account_type && <p className="text-red-500 text-sm">{errors.account_type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_number">口座番号 <span className="text-red-500">*</span></Label>
                    <Input
                      id="account_number"
                      type="text"
                      value={formData.account_number}
                      onChange={(e) => handleInputChange('account_number', e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567"
                      maxLength={8}
                      className={errors.account_number ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-gray-500">7-8桁の数字</p>
                    {errors.account_number && <p className="text-red-500 text-sm">{errors.account_number}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_holder">口座名義 <span className="text-red-500">*</span></Label>
                    <Input
                      id="account_holder"
                      type="text"
                      value={formData.account_holder}
                      onChange={(e) => handleInputChange('account_holder', e.target.value)}
                      placeholder="ヤマダ タロウ"
                      className={errors.account_holder ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-gray-500">カタカナで入力</p>
                    {errors.account_holder && <p className="text-red-500 text-sm">{errors.account_holder}</p>}
                  </div>
                </div>
              </div>

              {/* ボタン */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? '保存中...' : '変更を保存'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
