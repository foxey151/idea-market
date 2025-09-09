import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/microcms';

interface BlogCreateRequest {
  title: string;
  content: string;
  publishedAt?: string;
  category?: string;
}

// ブログ記事の作成
export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.group(`🟢 ブログ作成API開始 [${requestId}]`);
  console.log('タイムスタンプ:', new Date().toISOString());
  console.log('リクエストURL:', request.url);
  console.log('リクエストメソッド:', request.method);
  
  try {
    // リクエストボディの取得と解析
    console.log('リクエストボディの解析開始...');
    let body;
    let rawBody = '';
    
    try {
      rawBody = await request.text();
      console.log('生のリクエストボディ:', rawBody);
      body = JSON.parse(rawBody);
      console.log('パース済みリクエストボディ:', body);
    } catch (parseError) {
      console.error('❌ JSONパースエラー:', parseError);
      console.error('生のボディ:', rawBody);
      console.groupEnd();
      return NextResponse.json(
        { error: 'JSONフォーマットが正しくありません' },
        { status: 400 }
      );
    }
    
    // リクエストボディのバリデーション
    console.log('バリデーション開始...');
    const { title, content, publishedAt, category } = body;
    
    console.log('フィールド値:', {
      title: title ? `"${title}" (${title.length}文字)` : 'undefined/null',
      content: content ? `${content.length}文字のHTMLコンテンツ` : 'undefined/null',
      publishedAt: publishedAt || 'undefined/null',
      category: category || 'undefined/null',
    });
    
    // 必須フィールドチェック
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!content) missingFields.push('content');
    
    if (missingFields.length > 0) {
      console.error('❌ 必須フィールドが不足:', missingFields);
      console.groupEnd();
      return NextResponse.json(
        { 
          error: '必須フィールドが不足しています',
          missingFields,
          receivedFields: Object.keys(body)
        },
        { status: 400 }
      );
    }
    
    // microCMSに送信するデータを準備
    const createData: any = {
      title,
      content,
    };
    
    // publishedAtが提供されている場合のみ追加
    if (publishedAt) {
      createData.publishedAt = publishedAt;
    }
    
    // categoryが提供されている場合のみ追加
    if (category) {
      createData.category = category;
    }
    
    console.log('microCMSに送信するデータ:', createData);
    
    // microCMSにブログ記事を作成
    if (!client) {
      console.error('❌ microCMSクライアントが初期化されていません。');
      throw new Error('microCMSクライアントが初期化されていません。');
    }
    console.log('microCMSへのPOSTリクエスト開始...');
    const response = await client.create({
      endpoint: 'blogs',
      content: createData,
    });
    console.log('✅ microCMSレスポンス:', response);
    console.log('作成されたブログID:', response.id);
    console.groupEnd();
    
    return NextResponse.json({
      success: true,
      message: 'ブログ記事が正常に作成されました',
      data: response,
      blogId: response.id,
    });
    
  } catch (error: any) {
    console.error('❌ ブログ作成エラー:', {
      message: error.message,
      status: error.status,
      response: error.response,
      stack: error.stack,
    });
    
    // microCMSエラーの詳細解析
    let errorMessage = 'ブログ記事の作成に失敗しました';
    let statusCode = 500;
    
    if (error.status) {
      statusCode = error.status;
      
      switch (error.status) {
        case 400:
          errorMessage = 'リクエストデータが無効です。フィールドの値を確認してください。';
          break;
        case 401:
          errorMessage = 'APIキーが無効です。microCMSの設定を確認してください。';
          break;
        case 403:
          errorMessage = 'アクセスが拒否されました。権限を確認してください。';
          break;
        case 404:
          errorMessage = 'microCMSのエンドポイントが見つかりません。';
          break;
        case 429:
          errorMessage = 'リクエスト制限に達しました。しばらく待ってから再試行してください。';
          break;
        default:
          errorMessage = `microCMSエラー (${error.status}): ${error.message}`;
      }
    }
    
    console.groupEnd();
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        status: error.status,
      },
      { status: statusCode }
    );
  }
}
