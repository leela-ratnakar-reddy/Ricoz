import { RICOZ_SYSTEM_PROMPT } from "./prompts";

export interface AIClientResponse {
  ok: boolean;
  data?: string;
  error?: string;
  source: "gemini" | "fallback";
}

/**
 * Server-Side Gemini AI Client
 * Communicates directly with the Google Generative Language REST API.
 * Never exposes the GEMINI_API_KEY to client-side code.
 */
export async function callGeminiAPI(prompt: string): Promise<AIClientResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return {
      ok: false,
      error: "GEMINI_API_KEY is not configured in server environment.",
      source: "fallback"
    };
  }

  // 10-second timeout to protect against slow network requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: RICOZ_SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return {
        ok: false,
        error: `Gemini API returned status ${response.status}: ${errText.slice(0, 200)}`,
        source: "fallback"
      };
    }

    const json = await response.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return {
        ok: false,
        error: "Gemini API returned an empty or malformed response.",
        source: "fallback"
      };
    }

    return {
      ok: true,
      data: candidateText,
      source: "gemini"
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMessage = err instanceof Error ? err.message : "Unknown error calling Gemini API";
    return {
      ok: false,
      error: errorMessage,
      source: "fallback"
    };
  }
}
