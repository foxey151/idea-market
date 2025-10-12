import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ERROR_CODES, createError } from '@/lib/constants/error-codes';

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const updatableFields = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().max(200).nullable().optional(),
  email: z.string().email().max(320).nullable().optional(),
  bank_name: z.string().trim().max(200).nullable().optional(),
  branch_name: z.string().trim().max(200).nullable().optional(),
  account_type: z.enum(['ordinary', 'current']).nullable().optional(),
  account_number: z.string().trim().max(64).nullable().optional(),
  account_holder: z.string().trim().max(200).nullable().optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  birth_date: z.string().trim().max(32).nullable().optional(),
  prefecture: z
    .enum([
      'hokkaido', 'aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima',
      'ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa',
      'niigata', 'toyama', 'ishikawa', 'fukui', 'yamanashi', 'nagano', 'gifu',
      'shizuoka', 'aichi', 'mie', 'shiga', 'kyoto', 'osaka', 'hyogo', 'nara',
      'wakayama', 'tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi',
      'tokushima', 'kagawa', 'ehime', 'kochi', 'fukuoka', 'saga', 'nagasaki',
      'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa',
    ])
    .nullable()
    .optional(),
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

export async function GET(request: NextRequest) {
  try {
    const { supabase, error: adminErr } = await requireAdmin();
    if (adminErr) return NextResponse.json({ error: adminErr }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const parsed = listQuerySchema.safeParse({
      q: searchParams.get('q') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.API_001, parsed.error.flatten()) },
        { status: 400 }
      );
    }

    const { q, limit = 50, offset = 0 } = parsed.data;

    let query = supabase
      .from('user_details')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      query = query.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,account_holder.ilike.%${q}%`
      );
    }

    const { data, error, count } = await query as any;
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

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, error: adminErr } = await requireAdmin();
    if (adminErr) return NextResponse.json({ error: adminErr }, { status: 403 });

    const body = await request.json();
    const parsed = updatableFields.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.API_001, parsed.error.flatten()) },
        { status: 400 }
      );
    }

    const { id, ...updates } = parsed.data;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.API_001, '変更項目がありません') },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_details')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: createError(ERROR_CODES.DB_002, error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json(
      { error: createError(ERROR_CODES.SYS_001, String(e)) },
      { status: 500 }
    );
  }
}


