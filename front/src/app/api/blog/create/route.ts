import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { client, getAuthors } from '@/lib/microcms';

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
    const { title, content, publishedAt, category, user_id } = body;

    console.log('フィールド値:', {
      title: title ? `"${title}" (${title.length}文字)` : 'undefined/null',
      content: content
        ? `${content.length}文字のHTMLコンテンツ`
        : 'undefined/null',
      publishedAt: publishedAt || 'undefined/null',
      category: category || 'undefined/null',
      user_id: user_id || 'undefined/null',
    });

    // 必須フィールドチェック
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!content) missingFields.push('content');
    if (!user_id) missingFields.push('user_id');

    if (missingFields.length > 0) {
      console.error('❌ 必須フィールドが不足:', missingFields);
      console.groupEnd();
      return NextResponse.json(
        {
          error: '必須フィールドが不足しています',
          missingFields,
          receivedFields: Object.keys(body),
        },
        { status: 400 }
      );
    }

    // 著者のcontentIdを取得
    console.log('著者情報の取得開始...');
    let authorContentId: string | null = null;
    
    try {
      const authorsResponse = await getAuthors();
      const author = authorsResponse.contents.find(author => author.user_id === user_id);
      
      if (!author) {
        console.error('❌ 指定されたuser_idに対応する著者が見つかりません:', user_id);
        console.groupEnd();
        return NextResponse.json(
          {
            error: '指定されたユーザーIDに対応する著者が見つかりません',
            user_id,
          },
          { status: 404 }
        );
      }
      
      authorContentId = author.id;
      console.log('✅ 著者情報取得成功:', { user_id, contentId: authorContentId });
    } catch (authorError: any) {
      console.error('❌ 著者情報取得エラー:', authorError);
      console.groupEnd();
      return NextResponse.json(
        {
          error: '著者情報の取得に失敗しました',
          details: authorError.message,
        },
        { status: 500 }
      );
    }

    // microCMSに送信するデータを準備
    const createData: any = {
      title,
      content,
      user_id: authorContentId, // 著者のcontentIdを設定
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

    // キャッシュ無効化処理
    console.log('キャッシュ無効化開始...');
    try {
      // ブログ一覧ページのキャッシュを無効化
      revalidatePath('/blog');
      console.log('✅ ブログ一覧ページのキャッシュを無効化しました');

      // 作成された記事の詳細ページのキャッシュも無効化
      revalidatePath(`/blog/${response.id}`);
      console.log(`✅ 個別記事ページ (/blog/${response.id}) のキャッシュを無効化しました`);

      // ホームページのキャッシュも無効化（ブログが表示される場合）
      revalidatePath('/');
      console.log('✅ ホームページのキャッシュを無効化しました');
    } catch (revalidateError) {
      console.error('⚠️ キャッシュ無効化エラー:', revalidateError);
      // キャッシュ無効化エラーは致命的ではないので続行
    }

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
          errorMessage =
            'リクエストデータが無効です。フィールドの値を確認してください。';
          break;
        case 401:
          errorMessage =
            'APIキーが無効です。microCMSの設定を確認してください。';
          break;
        case 403:
          errorMessage = 'アクセスが拒否されました。権限を確認してください。';
          break;
        case 404:
          errorMessage = 'microCMSのエンドポイントが見つかりません。';
          break;
        case 429:
          errorMessage =
            'リクエスト制限に達しました。しばらく待ってから再試行してください。';
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
