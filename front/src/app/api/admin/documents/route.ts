import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // サーバーサイドSupabaseクライアントを作成
    const supabase = await createClient();

    // 管理者権限チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // ユーザーのロールを取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { documentType, content } = await request.json();

    if (!documentType || content === undefined) {
      return NextResponse.json(
        { error: 'Document type and content are required' },
        { status: 400 }
      );
    }

    // 有効なドキュメントタイプをチェック
    const validTypes = ['terms', 'privacy', 'commerce', 'company'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // ページタイトルのマッピング
    const pageTitles: { [key: string]: string } = {
      terms: '利用規約',
      privacy: 'プライバシーポリシー',
      commerce: '特定商取引法に基づく表記',
      company: '会社情報',
    };

    // データベースにコンテンツを保存
    const { data, error } = await supabase
      .from('pages_content')
      .upsert(
        {
          page_type: documentType,
          content: content || '',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'page_type',
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${pageTitles[documentType]}を保存しました。`,
      data: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // サーバーサイドSupabaseクライアントを作成
    const supabase = await createClient();

    // 管理者権限チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // ユーザーのロールを取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { error: 'Type parameter is required' },
        { status: 400 }
      );
    }

    // サーバーサイドでコンテンツを取得
    const { data, error } = await supabase
      .from('pages_content')
      .select('*')
      .eq('page_type', type)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
