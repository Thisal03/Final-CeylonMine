import { NextResponse } from 'next/server';
import { supabase } from '../../utility/supabase';

// GET handler for retrieving royalties
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('royalty')
      .select('*')
      .order('calculation_date', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch royalties" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in get_royalties:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
