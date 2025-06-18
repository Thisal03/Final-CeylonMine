import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/app/minebot/prompt";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const apiKey = process.env.DEEPSEEK_API_KEY;
const SITE_URL = "https://your-site-url.com"; // Optional, update as needed
const SITE_TITLE = "CeylonMine"; // Optional, update as needed

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${apiKey}`,
  "HTTP-Referer": SITE_URL,
  "X-Title": SITE_TITLE,
};

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "DeepSeek API key is not configured" },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { messages, input } = body;

    if (!input) {
      return NextResponse.json(
        { error: "Input message is required" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to get response from DeepSeek", details: errorData },
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
    let message = "Failed to generate response";
    if (error && typeof error === "object" && "message" in error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return NextResponse.json(
      {
        error: message || "Unknown error occurred",
        details: typeof error === "object" ? JSON.stringify(error) : error,
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
