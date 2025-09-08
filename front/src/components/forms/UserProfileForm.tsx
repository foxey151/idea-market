'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/StableAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
  type Prefecture,
} from '@/lib/supabase/user-details';

interface FormData {
  full_name: string;
  email: string;
  bank_name: string;
  branch_name: string;
  account_type: AccountType | '';
  account_number: string;
  account_holder: string;
  gender: Gender | '';
  birth_date: string;
  prefecture: Prefecture | '';
}

interface FormErrors {
  full_name?: string;
  email?: string;
  bank_name?: string;
  branch_name?: string;
  account_type?: string;
  account_number?: string;
  account_holder?: string;
  gender?: string;
  birth_date?: string;
  prefecture?: string;
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
  'その他',
];

export default function UserProfileForm() {
  const { user, refreshUserDetails, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    prefecture: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // ユーザーが認証されていない場合、ログインページにリダイレクト
  useEffect(() => {
    // 認証状態の読み込み中は何もしない
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // 既存のユーザー詳細情報を取得
    loadUserDetails();
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // routerのためのuseCallbackで最適化
  const _handleRedirect = () => {
    router.push('/login');
  };

  const loadUserDetails = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('loadUserDetails開始');
    }
    setIsLoading(true);
    try {
      const result = await getCurrentUserDetails();

      if (result && !result.error && result.data) {
        const userDetails: UserDetails = result.data;
        if (process.env.NODE_ENV === 'development') {
          console.log('既存のユーザー詳細情報を読み込み:', userDetails);
        }
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
          prefecture: userDetails.prefecture || '',
        });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('新規ユーザーのため初期値を設定');
        }
        // 新規ユーザーの場合、メールアドレスのみ設定
        setFormData(prev => ({
          ...prev,
          email: user?.email || '',
        }));
      }
    } catch (error) {
      console.error('ユーザー詳細情報の取得に失敗:', error);
      // エラーの場合もメールアドレスのみ設定
      setFormData(prev => ({
        ...prev,
        email: user?.email || '',
      }));
    } finally {
      if (process.env.NODE_ENV === 'development') {
        console.log('loadUserDetails完了');
      }
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 必須項目のチェック
    if (!formData.full_name.trim()) {
      newErrors.full_name = '氏名は必須です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = '銀行名は必須です';
    }

    if (!formData.branch_name.trim()) {
      newErrors.branch_name = '支店名は必須です';
    }

    if (!formData.account_type) {
      newErrors.account_type = '口座種別を選択してください';
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = '口座番号は必須です';
    } else if (!validateAccountNumber(formData.account_number)) {
      newErrors.account_number = '口座番号は7-8桁の数字で入力してください';
    }

    if (!formData.account_holder.trim()) {
      newErrors.account_holder = '口座名義は必須です';
    }

    if (!formData.gender) {
      newErrors.gender = '性別を選択してください';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = '生年月日は必須です';
    } else if (!validateBirthDate(formData.birth_date)) {
      newErrors.birth_date = '正しい生年月日を入力してください';
    }

    if (!formData.prefecture) {
      newErrors.prefecture = '居住都道府県を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'ユーザーが認証されていません',
        description: 'ログインしてから再度お試しください。',
        variant: 'destructive',
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
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
        prefecture: formData.prefecture as Prefecture,
      };

      const { error } = await upsertUserDetails(userDetailsData);

      if (error) {
        toast({
          title: 'プロフィールの保存に失敗しました',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      // AuthContextのuserDetailsを更新
      await refreshUserDetails();

      toast({
        title: 'プロフィールが正常に保存されました',
        description: 'アイデアマーケットをご利用いただけます。',
      });
      router.push('/');
    } catch (error) {
      console.error('プロフィール保存エラー:', error);
      toast({
        title: 'プロフィールの保存中にエラーが発生しました',
        description: 'しばらく時間をおいて再度お試しください。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>ユーザープロフィール登録</CardTitle>
          <CardDescription>
            アイデアマーケットをご利用いただくために、以下の情報をご登録ください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 氏名 */}
            <div className="space-y-2">
              <Label htmlFor="full_name">
                氏名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={e => handleInputChange('full_name', e.target.value)}
                placeholder="山田 太郎"
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm">{errors.full_name}</p>
              )}
            </div>

            {/* メールアドレス */}
            <div className="space-y-2">
              <Label htmlFor="email">
                メールアドレス <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* 銀行情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">銀行情報</h3>

              {/* 銀行名 */}
              <div className="space-y-2">
                <Label htmlFor="bank_name">
                  銀行名 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.bank_name}
                  onValueChange={value => handleInputChange('bank_name', value)}
                >
                  <SelectTrigger
                    className={errors.bank_name ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="銀行を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_OPTIONS.map(bank => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bank_name && (
                  <p className="text-red-500 text-sm">{errors.bank_name}</p>
                )}

                {/* その他の銀行名を選択した場合のカスタム入力フィールド */}
                {formData.bank_name === 'その他' && (
                  <div className="mt-2">
                    <Label htmlFor="custom_bank_name">
                      銀行名を入力してください{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="custom_bank_name"
                      type="text"
                      value={
                        formData.bank_name === 'その他'
                          ? ''
                          : formData.bank_name
                      }
                      onChange={e =>
                        handleInputChange('bank_name', e.target.value)
                      }
                      placeholder="例：○○銀行"
                      className={errors.bank_name ? 'border-red-500' : ''}
                    />
                  </div>
                )}
              </div>

              {/* 支店名 */}
              <div className="space-y-2">
                <Label htmlFor="branch_name">
                  支店名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="branch_name"
                  type="text"
                  value={formData.branch_name}
                  onChange={e =>
                    handleInputChange('branch_name', e.target.value)
                  }
                  placeholder="本店"
                  className={errors.branch_name ? 'border-red-500' : ''}
                />
                {errors.branch_name && (
                  <p className="text-red-500 text-sm">{errors.branch_name}</p>
                )}
              </div>

              {/* 口座種別 */}
              <div className="space-y-3">
                <Label>
                  口座種別 <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.account_type}
                  onValueChange={value =>
                    handleInputChange('account_type', value)
                  }
                  className="flex gap-6"
                >
                  {ACCOUNT_TYPE_OPTIONS.map(option => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.account_type && (
                  <p className="text-red-500 text-sm">{errors.account_type}</p>
                )}
              </div>

              {/* 口座番号 */}
              <div className="space-y-2">
                <Label htmlFor="account_number">
                  口座番号 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="account_number"
                  type="text"
                  value={formData.account_number}
                  onChange={e =>
                    handleInputChange(
                      'account_number',
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  placeholder="1234567"
                  maxLength={8}
                  className={errors.account_number ? 'border-red-500' : ''}
                />
                <p className="text-sm text-gray-500">
                  7-8桁の数字で入力してください
                </p>
                {errors.account_number && (
                  <p className="text-red-500 text-sm">
                    {errors.account_number}
                  </p>
                )}
              </div>

              {/* 口座名義 */}
              <div className="space-y-2">
                <Label htmlFor="account_holder">
                  口座名義 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="account_holder"
                  type="text"
                  value={formData.account_holder}
                  onChange={e =>
                    handleInputChange('account_holder', e.target.value)
                  }
                  placeholder="ヤマダ タロウ"
                  className={errors.account_holder ? 'border-red-500' : ''}
                />
                <p className="text-sm text-gray-500">
                  カタカナで入力してください
                </p>
                {errors.account_holder && (
                  <p className="text-red-500 text-sm">
                    {errors.account_holder}
                  </p>
                )}
              </div>
            </div>

            {/* 個人情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">個人情報</h3>

              {/* 性別 */}
              <div className="space-y-3">
                <Label>
                  性別 <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={value => handleInputChange('gender', value)}
                  className="flex gap-6"
                >
                  {GENDER_OPTIONS.map(option => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.gender && (
                  <p className="text-red-500 text-sm">{errors.gender}</p>
                )}
              </div>

              {/* 生年月日 */}
              <div className="space-y-2">
                <Label htmlFor="birth_date">
                  生年月日 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={e =>
                    handleInputChange('birth_date', e.target.value)
                  }
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.birth_date ? 'border-red-500' : ''}
                />
                {errors.birth_date && (
                  <p className="text-red-500 text-sm">{errors.birth_date}</p>
                )}
              </div>

              {/* 居住都道府県 */}
              <div className="space-y-2">
                <Label htmlFor="prefecture">
                  居住都道府県 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.prefecture}
                  onValueChange={value =>
                    handleInputChange('prefecture', value)
                  }
                >
                  <SelectTrigger
                    className={errors.prefecture ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="都道府県を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREFECTURE_OPTIONS.map(prefecture => (
                      <SelectItem
                        key={prefecture.value}
                        value={prefecture.value}
                      >
                        {prefecture.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.prefecture && (
                  <p className="text-red-500 text-sm">{errors.prefecture}</p>
                )}
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? '保存中...' : 'プロフィールを保存'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
