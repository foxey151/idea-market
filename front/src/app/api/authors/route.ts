import { NextRequest, NextResponse } from 'next/server';
import { getAuthors, createAuthor } from '@/lib/microcms';

export async function GET(_request: NextRequest) {
  try {
    const authors = await getAuthors();

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
    const body = await request.json();
    const { user_id } = body;

    // バリデーション
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { error: 'user_idは必須です' },
        { status: 400 }
      );
    }

    // 既存の著者をチェック
    const existingAuthors = await getAuthors();
    const authorExists = existingAuthors.contents.some(
      author => author.user_id === user_id
    );

    if (authorExists) {
      return NextResponse.json(
        { message: '既に著者として登録されています', user_id },
        { status: 200 }
      );
    }

    // microCMSに著者を作成
    const newAuthor = await createAuthor({ user_id });

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
