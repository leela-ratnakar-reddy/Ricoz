import { RICOZ_SYSTEM_PROMPT } from "./prompts";

export interface AIClientResponse {
  ok: boolean;
  data?: string;
  error?: string;
  source: "gemini" | "openrouter" | "fallback";
  providerConfigured: boolean;
  model?: string;
}

export interface GeminiOptions {
  systemPrompt?: string;
  responseMimeType?: "application/json" | "text/plain";
  temperature?: number;
  timeoutMs?: number;
}

/**
 * Escapes characters that could break XML delimitation in prompts
 */
export function sanitizePromptInput(input: string): string {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .slice(0, 4000); // Strict length limit to control cost and context window
}

/**
 * Server-Side AI Client
 * Communicates directly with Google Generative Language REST API (Gemini)
 * or InsForge OpenRouter Model Gateway if configured.
 * Never exposes API keys to client-side code.
 */
export async function callGeminiAPI(
  prompt: string,
  options?: GeminiOptions
): Promise<AIClientResponse> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const hasGemini = Boolean(geminiKey && geminiKey.trim() !== "" && geminiKey !== "your_gemini_api_key_here");
  const hasOpenRouter = Boolean(openRouterKey && openRouterKey.trim() !== "");

  if (!hasGemini && !hasOpenRouter) {
    return {
      ok: false,
      error: "No AI provider configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY in server environment.",
      source: "fallback",
      providerConfigured: false,
    };
  }

  const systemText = options?.systemPrompt || RICOZ_SYSTEM_PROMPT;
  const timeoutMs = options?.timeoutMs || 12000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 1. Prefer Gemini API if GEMINI_API_KEY is configured
    if (hasGemini) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const mimeType = options?.responseMimeType || "application/json";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemText }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: mimeType,
            temperature: options?.temperature ?? 0.2,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        return {
          ok: false,
          error: `Gemini API returned status ${response.status}: ${errText.slice(0, 200)}`,
          source: "fallback",
          providerConfigured: true,
        };
      }

      const json = await response.json();
      const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        return {
          ok: false,
          error: "Gemini API returned an empty response.",
          source: "fallback",
          providerConfigured: true,
        };
      }

      return {
        ok: true,
        data: candidateText,
        source: "gemini",
        providerConfigured: true,
        model: "gemini-1.5-flash",
      };
    }

    // 2. OpenRouter fallback if OPENROUTER_API_KEY is configured
    if (hasOpenRouter) {
      const chatModel = process.env.OPENROUTER_CHAT_MODEL || "google/gemini-flash-1.5";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://ricoz.luxury",
          "X-Title": "RICOZ Operations Suite",
        },
        body: JSON.stringify({
          model: chatModel,
          messages: [
            { role: "system", content: systemText },
            { role: "user", content: prompt },
          ],
          temperature: options?.temperature ?? 0.2,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        return {
          ok: false,
          error: `OpenRouter returned status ${response.status}: ${errText.slice(0, 200)}`,
          source: "fallback",
          providerConfigured: true,
        };
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;

      if (!content) {
        return {
          ok: false,
          error: "OpenRouter returned an empty completion.",
          source: "fallback",
          providerConfigured: true,
        };
      }

      return {
        ok: true,
        data: content,
        source: "openrouter",
        providerConfigured: true,
        model: chatModel,
      };
    }

    return {
      ok: false,
      error: "No active provider selected.",
      source: "fallback",
      providerConfigured: false,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMessage = err instanceof Error ? err.message : "Error contacting AI provider";
    return {
      ok: false,
      error: errorMessage,
      source: "fallback",
      providerConfigured: Boolean(hasGemini || hasOpenRouter),
    };
  }
}
