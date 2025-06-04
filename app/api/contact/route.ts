import { NextResponse } from 'next/server';
import { supabase } from '../../utility/supabase';

// POST handler for submitting complaints
export async function POST(request: Request) {
  try {
    // Log the start of the function
    console.log("Starting submit_message function");

    // Parse the request body
    const data = await request.json();
    console.log("Received data:", data);

    // Validate required fields
    const requiredFields = ['email', 'name', 'message'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        {
          status_code: 400,
          error: "Missing required fields",
          details: `Missing fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Insert data into Supabase
    const { data: responseData, error } = await supabase
      .from('contact_data')
      .insert({
        email: data.email,
        name: data.name,
        message: data.message,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          status_code: 500,
          error: "Failed to submit message",
          details: error.message
        },
        { status: 500 }
      );
    }

    // Log the successful submission
    console.log("Message submitted successfully");
    return NextResponse.json(
      {
        status_code: 201,
        message: "Message submitted successfully!",
        data: responseData
      },
      { status: 201 }
    );

  } catch (error) {
    // Log the error
    console.error("Error in submit_message:", error);
    return NextResponse.json(
      {
        status_code: 500,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// GET handler for retrieving complaints
export async function GET() {
  try {
    // Log the start of the function
    console.log("Starting get_messages function");

    // Fetch data from Supabase
    const { data, error } = await supabase
      .from('contact_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          status_code: 500,
          error: "Failed to fetch messages",
          details: error.message
        },
        { status: 500 }
      );
    }

    // Log the successful fetch
    console.log("Messages fetched successfully");
    return NextResponse.json(
      {
        status_code: 200,
        data: data
      },
      { status: 200 }
    );

  } catch (error) {
    // Log the error
    console.error("Error in get_messages:", error);
    return NextResponse.json(
      {
        status_code: 500,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
