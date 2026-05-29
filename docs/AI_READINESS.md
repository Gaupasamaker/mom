# MOM AI Readiness

## Current Status

MOM does not use real AI today. Production behavior remains deterministic, offline-capable, and template-based through `TemplateAiProvider`.

Current provider boundary:

- `AiProvider`: shared provider contract.
- `AiService`: app-facing integration point.
- `AiProviderFactory`: selects a provider mode and safely falls back to templates.
- `TemplateAiProvider`: default production provider.
- `MockAiProvider`: deterministic provider for tests and development.
- `AndroidGeminiNanoProvider`, `CloudGeminiProvider`, `CloudOpenAIProvider`, `IOSFoundationModelsProvider`: placeholders only.

## Why AI Is Optional

MOM reminders can contain sensitive family, health, calendar, shopping, and routine data. Core functionality must never depend on AI availability. Rules and templates remain the source of truth for reminders, MOM Check, Daily Summary, and Routines.

## Privacy Principles

- Use the minimum context needed for any future AI request.
- Do not send raw app state directly to AI providers.
- Prefer local AI for private user data when available.
- Require explicit user opt-in before any cloud AI provider is used.
- Keep AI enhancement optional and reversible.
- If AI fails, is unavailable, or is unsupported, fall back to `TemplateAiProvider`.

## Future Provider Modes

Supported architecture modes:

- `template`
- `mock`
- `android_gemini_nano`
- `cloud_gemini`
- `cloud_openai`

The production default is always `template`.

Unsupported modes currently return `TemplateAiProvider` from `AiProviderFactory`.

## Android Local AI Path

Android local AI through Gemini Nano / AICore / ML Kit GenAI could be useful later because it may allow MOM to rewrite messages and summarize the day while keeping sensitive context on device.

It is not implemented yet because this Expo MVP currently avoids native modules and provider-specific SDKs.

Future Android work may require:

- Native Android/Kotlin bridge.
- Expo prebuild or Expo Dev Client.
- AICore / ML Kit GenAI availability checks.
- Device and model capability detection.
- Android-only runtime gating.
- Safe fallback when local AI is unavailable.

## Cloud Provider Path

Cloud Gemini or Cloud OpenAI providers should remain optional. Before enabling either:

- Add explicit user opt-in.
- Add clear privacy copy.
- Sanitize structured input.
- Avoid uploading raw local data.
- Add timeout and fallback behavior.
- Keep rules/templates as the deterministic core.

## How To Add A Provider Later

1. Implement `AiProvider`.
2. Add the provider to `AiProviderFactory`.
3. Keep `isAvailable()` conservative.
4. Add tests for provider selection, unavailable provider fallback, and sanitized input shape.
5. Keep `TemplateAiProvider` as fallback.
6. Do not introduce chat UI. MOM should remain proactive and card-based.
