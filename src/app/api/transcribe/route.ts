import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: (() => {
        const body = new FormData();
        body.append("file", file);
        body.append("model", "whisper-1");
        return body;
      })(),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      return NextResponse.json({ error: `OpenAI error: ${text}` }, { status: 502 });
    }

    const data = await openaiRes.json();
    return NextResponse.json({ text: data.text ?? "" });
  } catch (err) {
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
