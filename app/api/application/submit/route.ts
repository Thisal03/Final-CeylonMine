import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const data = await req.json();
  // Expect data to include miner_id and other application fields
  if (!data.miner_id) {
    return NextResponse.json({ error: 'Missing miner_id' }, { status: 400 });
  }
  const { error, data: inserted } = await supabase
    .from('application')
    .insert(data)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ application: inserted });
} 