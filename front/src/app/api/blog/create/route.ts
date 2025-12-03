import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { client, getAuthors } from '@/lib/microcms';

// ブログ記事の作成
export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得と解析
    let body;
    let rawBody = '';

    try {
      rawBody = await request.text();
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'JSONフォーマットが正しくありません' },
        { status: 400 }
      );
    }

    // リクエストボディのバリデーション
    const { title, content, publishedAt, category, user_id } = body;

    // 必須フィールドチェック
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!content) missingFields.push('content');
    if (!user_id) missingFields.push('user_id');

    if (missingFields.length > 0) {
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
    let authorContentId: string | null = null;
    
    try {
      const authorsResponse = await getAuthors();
      const author = authorsResponse.contents.find(author => author.user_id === user_id);
      
      if (!author) {
        return NextResponse.json(
          {
            error: '指定されたユーザーIDに対応する著者が見つかりません',
            user_id,
          },
          { status: 404 }
        );
      }
      
      authorContentId = author.id;
    } catch (authorError: any) {
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

    // microCMSにブログ記事を作成
    if (!client) {
      throw new Error('microCMSクライアントが初期化されていません。');
    }
    const response = await client.create({
      endpoint: 'blogs',
      content: createData,
    });

    // キャッシュ無効化処理
    try {
      // ブログ一覧ページのキャッシュを無効化
      revalidatePath('/blog');

      // 作成された記事の詳細ページのキャッシュも無効化
      revalidatePath(`/blog/${response.id}`);

      // ホームページのキャッシュも無効化（ブログが表示される場合）
      revalidatePath('/');
    } catch (revalidateError) {
      // キャッシュ無効化エラーは致命的ではないので続行
    }

    return NextResponse.json({
      success: true,
      message: 'ブログ記事が正常に作成されました',
      data: response,
      blogId: response.id,
    });
  } catch (error: any) {
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
