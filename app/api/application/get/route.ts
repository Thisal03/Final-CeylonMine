import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const { id, miner_id } = await req.json();
  if (!id || !miner_id) {
    return NextResponse.json({ error: 'Missing id or miner_id' }, { status: 400 });
  }
  const { data: application, error } = await supabase
    .from('application')
    .select('*')
    .eq('id', id)
    .eq('miner_id', miner_id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ application });
} 