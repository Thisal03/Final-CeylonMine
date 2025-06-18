import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = "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";
const SITE_URL = "https://your-site-url.com"; // Optional, update as needed
const SITE_TITLE = "CeylonMine"; // Optional, update as needed

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
  "HTTP-Referer": SITE_URL,
  "X-Title": SITE_TITLE,
};

export async function GET() {
  try {
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
      return NextResponse.json(
        { status: "unavailable", error: "DeepSeek API unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: "available" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unavailable",
        error: error?.message || "Unknown error occurred",
      },
      { status: 503 }
    );
  }
}
