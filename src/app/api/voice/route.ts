import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, voiceId: customVoiceId } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text prompt is required for voice synthesis." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "ELEVENLABS_API_KEY environment variable is not configured.",
          isMissingKey: true,
        },
        { status: 401 }
      );
    }

    // Default to 'Adam' (deep, resonant narrative voice - ideal for an eerie repo ghost)
    // or user can specify custom voice ID / env var
    const voiceId =
      customVoiceId ||
      process.env.ELEVENLABS_VOICE_ID ||
      "pNInz6obpgDQGcFmaJgB";

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const elevenRes = await fetch(elevenLabsUrl, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5", // Fast, low-latency streaming model
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.8,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text().catch(() => "");
      return NextResponse.json(
        {
          error: `ElevenLabs API responded with status ${elevenRes.status}`,
          details: errText,
        },
        { status: elevenRes.status }
      );
    }

    // Pass through the audio stream directly to the client
    const audioStream = elevenRes.body;

    return new NextResponse(audioStream, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Internal server error occurred while synthesizing ghost voice.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
