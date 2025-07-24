import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const { miner_id } = await req.json();
  if (!miner_id) {
    return NextResponse.json({ error: 'Missing miner_id' }, { status: 400 });
  }
  const { data: applications, error } = await supabase
    .from('application')
    .select('*')
    .eq('miner_id', miner_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ applications });
} 