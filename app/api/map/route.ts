import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch data from Supabase
    const { data: locations, error } = await supabase
      .from('locations')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      );
    }

    // Transform the data
    const locationsList = locations.map(location => ({
      id: location.id,
      name: location.name,
      latitude: parseFloat(location.latitude || '0'),
      longitude: parseFloat(location.longitude || '0'),
      description: location.description || '',
      image: location.image || '',
      longDes: location.longDes || '',
    }));

    console.log("Returning locations:", locationsList); // Debugging output

    return NextResponse.json(locationsList);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
