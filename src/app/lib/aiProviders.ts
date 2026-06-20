// The AI options shown in the Study Buddy panel. Selecting a model opens that
// provider's chat in the split view. Providers generally block in-page
// embedding, so each opens at its standard chat URL and the panel always offers
// "Open in new tab" as the reliable path. Model labels are starting points —
// you pick/confirm the exact model inside the provider's own UI.

export interface AiModel {
  label: string;
  url: string;
}

export interface AiProvider {
  name: string;
  blurb: string;
  models: AiModel[];
}

export const AI_PROVIDERS: AiProvider[] = [
  {
    name: "ChatGPT",
    blurb: "OpenAI",
    models: [
      { label: "GPT-5.1", url: "https://chatgpt.com/" },
      { label: "GPT-5", url: "https://chatgpt.com/" },
      { label: "GPT-4o", url: "https://chatgpt.com/" },
    ],
  },
  {
    name: "Claude",
    blurb: "Anthropic",
    models: [
      { label: "Opus 4.8", url: "https://claude.ai/new" },
      { label: "Sonnet 4.6", url: "https://claude.ai/new" },
      { label: "Haiku 4.5", url: "https://claude.ai/new" },
    ],
  },
  {
    name: "Gemini",
    blurb: "Google",
    models: [
      { label: "Gemini 3 Pro", url: "https://gemini.google.com/app" },
      { label: "Gemini 2.5 Pro", url: "https://gemini.google.com/app" },
      { label: "Gemini 2.5 Flash", url: "https://gemini.google.com/app" },
    ],
  },
];

export interface ActiveAi {
  provider: string;
  model: string;
  url: string;
}
