import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ERROR_CODES, createError } from '@/lib/constants/error-codes';

// 入力スキーマ
const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const contractBodySchema = z.object({
  ideaId: z.string().uuid(),
});

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: createError(ERROR_CODES.AUTH_001, authError), supabase } as const;
  }
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || !profile || profile.role !== 'admin') {
    return { error: createError(ERROR_CODES.AUTH_002, profileError), supabase } as const;
  }
  return { supabase } as const;
}

// 購入可能なアイデア一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { supabase, error: adminErr } = await requireAdmin();
    if (adminErr) {
      return NextResponse.json({ error: adminErr }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parse = listQuerySchema.safeParse({
      q: searchParams.get('q') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    });
    if (!parse.success) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.API_001, parse.error.flatten()) },
        { status: 400 }
      );
    }
    const { q, limit = 50, offset = 0 } = parse.data;

    // 完成済み（closed）で価格が設定されているアイデアを取得
    // 条件: status = 'closed' AND price IS NOT NULL AND is_exclusive = false
    let query = supabase
      .from('ideas')
      .select(
        `
        id,
        mmb_no,
        title,
        summary,
        status,
        is_exclusive,
        purchase_count,
        price,
        created_at,
        profiles(id, display_name)
      `,
        { count: 'exact' }
      )
      .eq('status', 'closed')
      .not('price', 'is', null)
      .eq('is_exclusive', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      // 検索: mmb_no or title or summary
      query = query.or(`mmb_no.ilike.%${q}%,title.ilike.%${q}%,summary.ilike.%${q}%`);
    }

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.DB_002, error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data, count });
  } catch (e) {
    return NextResponse.json(
      { error: createError(ERROR_CODES.SYS_001, String(e)) },
      { status: 500 }
    );
  }
}

// 独占契約を結ぶ
export async function POST(request: NextRequest) {
  try {
    const { supabase, error: adminErr } = await requireAdmin();
    if (adminErr) return NextResponse.json({ error: adminErr }, { status: 403 });

    const body = await request.json();
    const parse = contractBodySchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.API_001, parse.error.flatten()) },
        { status: 400 }
      );
    }
    const { ideaId } = parse.data;

    // アイデアが存在し、独占契約可能かチェック
    // 購入可能なアイデア（status = 'closed' かつ price IS NOT NULL）にだけ独占契約を結ぶ
    const { data: idea, error: fetchErr } = await supabase
      .from('ideas')
      .select('id, status, is_exclusive, price')
      .eq('id', ideaId)
      .single();

    if (fetchErr || !idea) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.DB_002, fetchErr || 'not found') },
        { status: 404 }
      );
    }

    // 購入可能なアイデアかチェック（status = 'closed' かつ price IS NOT NULL）
    if (idea.status !== 'closed') {
      return NextResponse.json(
        { error: createError(ERROR_CODES.API_001, '購入可能なアイデア（完成済み）のみ独占契約を結べます') },
        { status: 400 }
      );
    }

    if (!idea.price) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.API_001, '価格が設定されていないアイデアは独占契約を結べません') },
        { status: 400 }
      );
    }

    if (idea.is_exclusive) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.API_001, '既に独占契約になっています') },
        { status: 400 }
      );
    }

    // 既に購入されているかチェック（soldレコードが存在するか）
    const { data: soldRecords, error: soldErr } = await supabase
      .from('sold')
      .select('id')
      .eq('idea_id', ideaId)
      .limit(1);

    if (soldErr) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.DB_002, soldErr) },
        { status: 500 }
      );
    }

    // 独占契約を結ぶ
    // 既に購入されている場合は status = 'soldout' に更新
    // 購入されていない場合は status はそのまま
    const updateData: { is_exclusive: boolean; status?: string; updated_at: string } = {
      is_exclusive: true,
      updated_at: new Date().toISOString(),
    };

    if (soldRecords && soldRecords.length > 0) {
      // 既に購入されている場合は soldout に更新
      updateData.status = 'soldout';
    }

    const { data: updatedIdea, error: updErr } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', ideaId)
      .select('*')
      .single();

    if (updErr) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.DB_002, updErr) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedIdea });
  } catch (e) {
    return NextResponse.json(
      { error: createError(ERROR_CODES.SYS_001, String(e)) },
      { status: 500 }
    );
  }
}

