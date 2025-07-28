import { NextResponse } from 'next/server';
import { supabase } from '../../utility/supabase';

// Helper to get userId from request (query or body)
async function getUserId(req: Request) {
  const { searchParams } = new URL(req.url);
  let userId = searchParams.get('user_id');
  if (!userId && req.method === 'POST') {
    try {
      const body = await req.json();
      userId = body.user_id || body.miner_id || body.id;
    } catch {}
  }
  return userId;
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }

  // Fetch user profile (to get role)
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single();
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Fetch license info from license table
  const { data: license, error: licenseError } = await supabase
    .from('license')
    .select('id, status, miner_id, created_at')
    .eq('miner_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (licenseError && licenseError.code !== 'PGRST116') { // PGRST116: No rows found
    console.error('License fetch error:', licenseError);
    return NextResponse.json({ error: licenseError.message }, { status: 500 });
  }

  // Fetch royalty info from royalty table with correct field names
  const { data: royalty, error: royaltyError } = await supabase
    .from('royalty')
    .select('id, royalty_with_sscl, total_amount, miner_id, calculation_date, payment_due_date')
    .eq('miner_id', userId)
    .order('calculation_date', { ascending: false })
    .limit(1)
    .single();
  if (royaltyError && royaltyError.code !== 'PGRST116') {
    return NextResponse.json({ error: royaltyError.message }, { status: 500 });
  }

  // Fetch announcements from comments table for the specific miner
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('id, text, created_at, miner_id')
    .eq('miner_id', userId)
    .order('created_at', { ascending: false })
    .limit(10); // Limit to 10 most recent announcements
  if (commentsError) {
    console.error('Announcements fetch error:', commentsError);
    // Don't fail the entire request if announcements fail
  }

  return NextResponse.json({
    user: { id: user.id, role: user.role },
    license,
    royalty,
    comments: comments || [],
  });
}

export async function POST(req: Request) {
  // For future: handle creation/updating if needed
  return NextResponse.json({ error: 'Not implemented' }, { status: 405 });
} 