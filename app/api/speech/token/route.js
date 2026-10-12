import { NextResponse } from "next/server";

/**
 * GET /api/speech/token
 * Returns a short-lived authorization token for Azure Cognitive Services Speech SDK,
 * enabling real-time live streaming speech recognition directly from the client.
 */
export async function GET() {
  try {
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION || "uaenorth";

    if (!speechKey) {
      return NextResponse.json(
        {
          error: {
            code: "AZURE_SPEECH_NOT_CONFIGURED",
            message: "AZURE_SPEECH_KEY is missing from .env.local",
          },
        },
        { status: 503 }
      );
    }

    const tokenUrl = `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": speechKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => "");
      console.error("[AzureSpeech issueToken Error]", tokenRes.status, errText);
      return NextResponse.json(
        {
          error: {
            code: "AZURE_SPEECH_AUTH_FAILED",
            message: `Failed to issue Azure Speech token (HTTP ${tokenRes.status}). Verify key and region.`,
          },
        },
        { status: tokenRes.status }
      );
    }

    const token = await tokenRes.text();

    return NextResponse.json({
      token,
      region: speechRegion,
    });
  } catch (error) {
    console.error("[Speech Token Route Error]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: error.message || "Failed to generate speech token." } },
      { status: 500 }
    );
  }
}
