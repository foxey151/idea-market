import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { client } from '@/lib/microcms';

// ブログ記事の更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  console.group(`🔵 ブログ更新API開始 [${requestId}]`);
  console.log('タイムスタンプ:', new Date().toISOString());
  console.log('リクエストURL:', request.url);
  console.log('リクエストメソッド:', request.method);

  try {
    const { id } = await params;
    console.log('ブログID:', id);

    // 認証チェックは削除（一般ユーザーでも編集可能）
    console.log('ブログ更新処理を開始します（認証なし）');

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
    const { title, content, publishedAt } = body;

    console.log('フィールド値:', {
      title: title ? `"${title}" (${title.length}文字)` : 'undefined/null',
      content: content
        ? `${content.length}文字のHTMLコンテンツ`
        : 'undefined/null',
      publishedAt: publishedAt || 'undefined/null',
    });

    // 必須フィールドチェック
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!content) missingFields.push('content');
    if (!publishedAt) missingFields.push('publishedAt');

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

    // publishedAtの日付形式検証と変換
    console.log('日付フォーマットの検証...');
    let formattedPublishedAt: string;

    try {
      // YYYY-MM-DD形式の場合、時刻を追加
      if (publishedAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedPublishedAt = new Date(
          `${publishedAt}T00:00:00.000Z`
        ).toISOString();
        console.log('日付形式を変換:', publishedAt, '->', formattedPublishedAt);
      } else {
        // ISO形式の場合はそのまま使用
        formattedPublishedAt = new Date(publishedAt).toISOString();
        console.log('ISO形式の日付を使用:', formattedPublishedAt);
      }
    } catch (dateError) {
      console.error('❌ 日付フォーマットエラー:', dateError);
      console.groupEnd();
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

    console.log('microCMSに送信するデータ:', updateData);

    // microCMSのブログ記事を更新
    if (!client) {
      console.error('❌ microCMSクライアントが初期化されていません');
      console.groupEnd();
      return NextResponse.json(
        { error: 'サーバー内部エラー: microCMSクライアントが利用できません' },
        { status: 500 }
      );
    }
    console.log('microCMSへのPATCHリクエスト開始...');
    if (!client) {
      throw new Error('microCMSクライアントが初期化されていません');
    }
    const response = await client.update({
      endpoint: 'blogs',
      contentId: id,
      content: updateData,
    });

    console.log('✅ microCMSレスポンス:', response);
    console.log('更新されたブログID:', response.id);

    // キャッシュ無効化処理
    console.log('キャッシュ無効化開始...');
    try {
      // ブログ一覧ページのキャッシュを無効化
      revalidatePath('/blog');
      console.log('✅ ブログ一覧ページのキャッシュを無効化しました');

      // 更新された記事の詳細ページのキャッシュも無効化
      revalidatePath(`/blog/${id}`);
      console.log(`✅ 個別記事ページ (/blog/${id}) のキャッシュを無効化しました`);

      // ホームページのキャッシュも無効化
      revalidatePath('/');
      console.log('✅ ホームページのキャッシュを無効化しました');
    } catch (revalidateError) {
      console.error('⚠️ キャッシュ無効化エラー:', revalidateError);
    }

    console.groupEnd();

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

// PATCH メソッドでの部分更新も対応
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.group(`🟡 ブログ部分更新API開始 [${requestId}]`);
  console.log('タイムスタンプ:', new Date().toISOString());
  console.log('リクエストURL:', request.url);
  console.log('リクエストメソッド:', request.method);

  try {
    const { id } = await params;
    console.log('ブログID:', id);

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
        console.groupEnd();
        return NextResponse.json(
          { error: '公開日時の形式が正しくありません' },
          { status: 400 }
        );
      }
    }

    if (fieldsToUpdate.length === 0) {
      console.warn('更新するフィールドがありません');
      console.groupEnd();
      return NextResponse.json(
        { error: '更新するフィールドが指定されていません' },
        { status: 400 }
      );
    }

    console.log('更新対象フィールド:', fieldsToUpdate);
    console.log('microCMSに送信するデータ:', updateData);

    // microCMSのブログ記事を部分更新
    console.log('microCMSへのPATCHリクエスト開始...');
    if (!client) {
      throw new Error('microCMSクライアントが初期化されていません');
    }
    const response = await client.update({
      endpoint: 'blogs',
      contentId: id,
      content: updateData,
    });

    console.log('✅ microCMSレスポンス:', response);
    console.log('更新されたブログID:', response.id);

    // キャッシュ無効化処理
    console.log('キャッシュ無効化開始...');
    try {
      // ブログ一覧ページのキャッシュを無効化
      revalidatePath('/blog');
      console.log('✅ ブログ一覧ページのキャッシュを無効化しました');

      // 更新された記事の詳細ページのキャッシュも無効化
      revalidatePath(`/blog/${id}`);
      console.log(`✅ 個別記事ページ (/blog/${id}) のキャッシュを無効化しました`);

      // ホームページのキャッシュも無効化
      revalidatePath('/');
      console.log('✅ ホームページのキャッシュを無効化しました');
    } catch (revalidateError) {
      console.error('⚠️ キャッシュ無効化エラー:', revalidateError);
    }

    console.groupEnd();

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
