import { NextResponse } from "next/server";

const apiKey = process.env.DEEPSEEK_API_KEY;
const SITE_URL = "https://your-site-url.com"; // Optional, update as needed
const SITE_TITLE = "CeylonMine"; // Optional, update as needed

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${apiKey}`,
  "HTTP-Referer": SITE_URL,
  "X-Title": SITE_TITLE,
};

export async function GET() {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { status: "unavailable", error: "DeepSeek API key is not configured" },
        { status: 503 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          { role: "user", content: "test" }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { status: "unavailable", error: errorData.error?.message || "DeepSeek API unavailable", details: errorData },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: "available" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unavailable",
        error: error?.message || "Unknown error occurred",
        details: typeof error === "object" ? JSON.stringify(error) : error,
      },
      { status: 503 }
    );
  }
}
