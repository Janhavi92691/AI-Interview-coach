import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/speech/transcribe
 * Transcribes audio recorded in Firefox or other non-Chromium browsers via Azure AI Speech Service.
 */
export async function POST(req) {
  try {
    // Optional user verification (does not block speech-to-text)
    try {
      await getCurrentUser({ requireAuth: false });
    } catch (_) {}

    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION || "uaenorth";

    if (!speechKey) {
      return NextResponse.json(
        {
          error: {
            code: "AZURE_SPEECH_NOT_CONFIGURED",
            message:
              "Azure Speech Service is not configured. Please add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env.local, or open the app in Microsoft Edge for free built-in speech recognition.",
          },
        },
        { status: 503 }
      );
    }

    const contentType = req.headers.get("content-type") || "audio/webm; codecs=opus";
    const audioBuffer = await req.arrayBuffer();

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: { code: "INVALID_AUDIO", message: "Audio recording was empty. Please try speaking again." } },
        { status: 400 }
      );
    }

    // Azure Cognitive Services Speech REST API for short audio transcription (up to 60s per chunk)
    const url = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;

    const azureRes = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": speechKey,
        "Content-Type": contentType,
        Accept: "application/json",
      },
      body: Buffer.from(audioBuffer),
    });

    if (!azureRes.ok) {
      const errText = await azureRes.text().catch(() => "");
      console.error("[AzureSpeech Error]", azureRes.status, errText);
      return NextResponse.json(
        {
          error: {
            code: "AZURE_SPEECH_ERROR",
            message: `Azure Speech returned HTTP ${azureRes.status}. Verify AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.`,
          },
        },
        { status: azureRes.status >= 500 ? 502 : azureRes.status }
      );
    }

    const data = await azureRes.json();
    const transcript = (data.DisplayText || data.Text || "").trim();

    return NextResponse.json({
      success: true,
      text: transcript,
      recognitionStatus: data.RecognitionStatus,
    });
  } catch (error) {
    console.error("[Speech Transcribe Handler Error]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: error.message || "Failed to transcribe audio." } },
      { status: 500 }
    );
  }
}
