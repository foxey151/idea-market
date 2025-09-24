import { NextRequest, NextResponse } from 'next/server';
import { getAuthors, createAuthor } from '@/lib/microcms';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('著者登録API (PUT): リクエスト開始');

    const { id: user_id } = params;

    // バリデーション
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { error: 'user_idは必須です' },
        { status: 400 }
      );
    }

    console.log('著者登録API (PUT): user_id受信', { user_id });

    // 既存の著者をチェック
    const existingAuthors = await getAuthors();
    const authorExists = existingAuthors.contents.some(
      author => author.user_id === user_id
    );

    if (authorExists) {
      console.log('著者登録API (PUT): 既に登録済み', { user_id });
      const existingAuthor = existingAuthors.contents.find(
        author => author.user_id === user_id
      );
      return NextResponse.json(
        { 
          message: '既に著者として登録されています', 
          author: existingAuthor
        },
        { status: 200 }
      );
    }

    // microCMSに著者を作成
    const newAuthor = await createAuthor({ user_id });

    console.log('著者登録API (PUT): 登録成功', {
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
    console.error('著者登録API (PUT): エラー発生', error);

    return NextResponse.json(
      {
        error: '著者の登録に失敗しました',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
