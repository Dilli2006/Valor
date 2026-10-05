import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * Provider abstraction (PRD §10): Gemini primary, optional OpenAI-compatible fallback.
 * Keys are read from server env only and never sent to the client.
 */
export type ModelHandle = { id: string; model: LanguageModel; providerOptions?: Record<string, Record<string, unknown>> };

export function getModels(): ModelHandle[] {
  const models: ModelHandle[] = [];
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    const primary = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    models.push({
      id: `google/${primary}`,
      model: google(primary),
      providerOptions: { google: { thinkingConfig: { thinkingBudget: Number(process.env.GEMINI_THINKING_BUDGET ?? 0) } } },
    });
    const secondary = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.0-flash";
    if (secondary !== primary) models.push({ id: `google/${secondary}`, model: google(secondary) });
  }
  if (process.env.FALLBACK_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.FALLBACK_API_KEY, baseURL: process.env.FALLBACK_BASE_URL || undefined });
    const name = process.env.FALLBACK_MODEL || "gpt-4o-mini";
    models.push({ id: `fallback/${name}`, model: openai.chat(name) });
  }
  return models;
}

export function hasAnyModel() {
  return getModels().length > 0;
}
