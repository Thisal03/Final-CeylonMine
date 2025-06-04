import { NextResponse } from 'next/server';
import { supabase } from '../../utility/supabase';

// POST handler for submitting complaints
export async function POST(request: Request) {
  try {
    // Log the start of the function
    console.log("Starting submit_complaint function");

    // Parse request body
    const data = await request.json();
    console.log("Received data:", data);

    // Validate required fields
    const requiredFields = ['email', 'project', 'complaint_text'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert data into Supabase
    const { data: responseData, error } = await supabase
      .from('complaints')
      .insert({
        email: data.email,
        project: data.project,
        complaint_text: data.complaint_text,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to submit complaint" },
        { status: 500 }
      );
    }

    // Log the successful submission
    console.log("Complaint submitted successfully");
    
    return NextResponse.json(
      { 
        message: "Complaint submitted successfully!", 
        data: responseData 
      },
      { status: 201 }
    );

  } catch (error) {
    // Log the error
    console.error("Error in submit_complaint:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET handler for retrieving complaints
export async function GET() {
  try {
    // Log the start of the function
    console.log("Starting get_complaints function");

    // Fetch data from Supabase
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch complaints" },
        { status: 500 }
      );
    }

    // Log the successful fetch
    console.log("Complaints fetched successfully");
    
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    // Log the error
    console.error("Error in get_complaints:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
