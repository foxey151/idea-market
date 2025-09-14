import { NextRequest, NextResponse } from 'next/server';
import { getAuthors, createAuthor } from '@/lib/microcms';

export async function GET(_request: NextRequest) {
  try {
    console.log('著者API: データ取得開始');

    const authors = await getAuthors();

    console.log('著者API: データ取得成功', {
      count: authors.contents.length,
      authors: authors.contents.map(author => ({
        id: author.id,
        name: author.user_id,
      })),
    });

    return NextResponse.json(authors);
  } catch (error: any) {
    console.error('著者API: エラー発生', error);

    return NextResponse.json(
      {
        error: '著者の取得に失敗しました',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// 新しく追加するPOSTメソッド
export async function POST(request: NextRequest) {
  try {
    console.log('著者登録API: リクエスト開始');

    const body = await request.json();
    const { user_id } = body;

    // バリデーション
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { error: 'user_idは必須です' },
        { status: 400 }
      );
    }

    console.log('著者登録API: user_id受信', { user_id });

    // 既存の著者をチェック
    const existingAuthors = await getAuthors();
    const authorExists = existingAuthors.contents.some(
      author => author.user_id === user_id
    );

    if (authorExists) {
      console.log('著者登録API: 既に登録済み', { user_id });
      return NextResponse.json(
        { message: '既に著者として登録されています', user_id },
        { status: 200 }
      );
    }

    // microCMSに著者を作成
    const newAuthor = await createAuthor({ user_id });

    console.log('著者登録API: 登録成功', {
      id: newAuthor.id,
      user_id: newAuthor.user_id,
    });

    return NextResponse.json(
      {
        message: '著者の登録が完了しました',
        author: newAuthor,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('著者登録API: エラー発生', error);

    return NextResponse.json(
      {
        error: '著者の登録に失敗しました',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
