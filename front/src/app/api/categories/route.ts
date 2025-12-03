import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/lib/microcms';

export async function GET(_request: NextRequest) {
  try {
    const categories = await getCategories();

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'カテゴリの取得に失敗しました',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
