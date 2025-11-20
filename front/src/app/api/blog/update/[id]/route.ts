import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { client } from '@/lib/microcms';

// ブログ記事の更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // リクエストボディの取得と解析
    let body;
    let rawBody = '';

    try {
      rawBody = await request.text();
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ JSONパースエラー:', parseError);
      return NextResponse.json(
        { error: 'JSONフォーマットが正しくありません' },
        { status: 400 }
      );
    }

    // リクエストボディのバリデーション
    const { title, content, publishedAt } = body;

    // 必須フィールドチェック
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!content) missingFields.push('content');
    if (!publishedAt) missingFields.push('publishedAt');

    if (missingFields.length > 0) {
      console.error('❌ 必須フィールドが不足:', missingFields);
      return NextResponse.json(
        {
          error: '必須フィールドが不足しています',
          missingFields,
          receivedFields: Object.keys(body),
        },
        { status: 400 }
      );
    }

    // publishedAtの日付形式検証と変換
    let formattedPublishedAt: string;

    try {
      // YYYY-MM-DD形式の場合、時刻を追加
      if (publishedAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedPublishedAt = new Date(
          `${publishedAt}T00:00:00.000Z`
        ).toISOString();
      } else {
        // ISO形式の場合はそのまま使用
        formattedPublishedAt = new Date(publishedAt).toISOString();
      }
    } catch (dateError) {
      console.error('❌ 日付フォーマットエラー:', dateError);
      return NextResponse.json(
        { error: '公開日時の形式が正しくありません' },
        { status: 400 }
      );
    }

    // microCMSに送信するデータを準備
    const updateData = {
      title,
      content,
      publishedAt: formattedPublishedAt,
    };

    // microCMSのブログ記事を更新
    if (!client) {
      console.error('❌ microCMSクライアントが初期化されていません');
      return NextResponse.json(
        { error: 'サーバー内部エラー: microCMSクライアントが利用できません' },
        { status: 500 }
      );
    }
    if (!client) {
      throw new Error('microCMSクライアントが初期化されていません');
    }
    const response = await client.update({
      endpoint: 'blogs',
      contentId: id,
      content: updateData,
    });

    // キャッシュ無効化処理
    try {
      // ブログ一覧ページのキャッシュを無効化
      revalidatePath('/blog');

      // 更新された記事の詳細ページのキャッシュも無効化
      revalidatePath(`/blog/${id}`);

      // ホームページのキャッシュも無効化
      revalidatePath('/');
    } catch (revalidateError) {
      console.error('⚠️ キャッシュ無効化エラー:', revalidateError);
    }

    return NextResponse.json({
      success: true,
      message: 'ブログ記事が正常に更新されました',
      data: response,
      updatedFields: Object.keys(updateData),
    });
  } catch (error: any) {
    console.error('❌ ブログ更新エラー:', {
      message: error.message,
      status: error.status,
      response: error.response,
      stack: error.stack,
    });

    // microCMSエラーの詳細解析
    let errorMessage = 'ブログ記事の更新に失敗しました';
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
          errorMessage = '指定されたブログ記事が見つかりません。';
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

// PATCH メソッドでの部分更新も対応
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // リクエストボディの取得と解析
    let body;
    let rawBody = '';

    try {
      rawBody = await request.text();
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ JSONパースエラー:', parseError);
      return NextResponse.json(
        { error: 'JSONフォーマットが正しくありません' },
        { status: 400 }
      );
    }

    // PATCHでは送信されたフィールドのみを更新
    const updateData: any = {};
    const fieldsToUpdate = [];

    if (body.title !== undefined) {
      updateData.title = body.title;
      fieldsToUpdate.push('title');
    }

    if (body.content !== undefined) {
      updateData.content = body.content;
      fieldsToUpdate.push('content');
    }

    if (body.publishedAt !== undefined) {
      try {
        // 日付フォーマットの処理
        if (body.publishedAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
          updateData.publishedAt = new Date(
            `${body.publishedAt}T00:00:00.000Z`
          ).toISOString();
        } else {
          updateData.publishedAt = new Date(body.publishedAt).toISOString();
        }
        fieldsToUpdate.push('publishedAt');
      } catch (dateError) {
        console.error('❌ 日付フォーマットエラー:', dateError);
        return NextResponse.json(
          { error: '公開日時の形式が正しくありません' },
          { status: 400 }
        );
      }
    }

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json(
        { error: '更新するフィールドが指定されていません' },
        { status: 400 }
      );
    }

    // microCMSのブログ記事を部分更新
    if (!client) {
      throw new Error('microCMSクライアントが初期化されていません');
    }
    const response = await client.update({
      endpoint: 'blogs',
      contentId: id,
      content: updateData,
    });

    // キャッシュ無効化処理
    try {
      // ブログ一覧ページのキャッシュを無効化
      revalidatePath('/blog');

      // 更新された記事の詳細ページのキャッシュも無効化
      revalidatePath(`/blog/${id}`);

      // ホームページのキャッシュも無効化
      revalidatePath('/');
    } catch (revalidateError) {
      console.error('⚠️ キャッシュ無効化エラー:', revalidateError);
    }

    return NextResponse.json({
      success: true,
      message: 'ブログ記事が正常に部分更新されました',
      data: response,
      updatedFields: fieldsToUpdate,
    });
  } catch (error: any) {
    console.error('❌ ブログ部分更新エラー:', {
      message: error.message,
      status: error.status,
      response: error.response,
      stack: error.stack,
    });

    // microCMSエラーの詳細解析
    let errorMessage = 'ブログ記事の部分更新に失敗しました';
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
          errorMessage = '指定されたブログ記事が見つかりません。';
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
