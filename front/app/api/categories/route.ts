import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/lib/microcms';

export async function GET(request: NextRequest) {
  try {
    console.log('カテゴリAPI: データ取得開始');
    
    const categories = await getCategories();
    
    console.log('カテゴリAPI: データ取得成功', {
      count: categories.contents.length,
      categories: categories.contents.map(cat => ({ id: cat.id, name: cat.name }))
    });
    
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('カテゴリAPI: エラー発生', error);
    
    return NextResponse.json(
      { 
        error: 'カテゴリの取得に失敗しました',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
