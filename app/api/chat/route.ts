import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/app/minebot/prompt";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const OPENROUTER_API_KEY = "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";
const SITE_URL = "https://your-site-url.com"; // Optional, update as needed
const SITE_TITLE = "CeylonMine"; // Optional, update as needed

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
  "HTTP-Referer": SITE_URL,
  "X-Title": SITE_TITLE,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, input } = body;

    if (!input) {
      return NextResponse.json(
        { error: "Input message is required" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Format messages for DeepSeek
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(messages || []).map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: input },
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to get response from DeepSeek" },
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { error: "Empty response from DeepSeek API" },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json(
      { message: { role: "assistant", content: reply } },
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error.message || "Unknown error occurred",
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
