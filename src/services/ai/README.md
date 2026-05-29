# MOM AI Provider Layer

MOM does not use real AI in production yet. The default provider is `TemplateAiProvider`, which preserves the current rule-based and template-based behavior.

## Providers

- `TemplateAiProvider`: production default. Returns deterministic template output.
- `MockAiProvider`: test/dev provider for deterministic assertions.
- `CloudGeminiProvider`: placeholder for a future cloud Gemini integration.
- `CloudOpenAIProvider`: placeholder for a future cloud OpenAI integration.
- `AndroidGeminiNanoProvider`: placeholder for future Android on-device Gemini Nano.
- `IOSFoundationModelsProvider`: placeholder for future iOS local model support.

## Why Gemini Nano Could Be Useful Later

Gemini Nano could make MOM feel more natural while keeping sensitive family context on device. It would be useful for:

- Rewriting template reminders in a warmer tone.
- Summarizing a busy day locally.
- Turning deterministic preparation tasks into more natural MOM notes.
- Avoiding cloud round-trips for small, personal copy improvements.

## Why It Is Not Implemented Yet

This Expo MVP currently avoids native modules and AI dependencies. Gemini Nano access would require platform-specific Android integration, model availability checks, runtime capability checks, and careful fallback behavior. Adding that now would make the MVP harder to test and redesign.

## Android Requirements Later

To integrate Gemini Nano later, MOM would need:

- A native Android module or config-plugin compatible implementation.
- Device/model availability detection.
- Runtime checks for unsupported devices.
- Privacy and safety boundaries for what local prompts may include.
- A fallback to `TemplateAiProvider` when local AI is unavailable.
- Tests around provider selection and failure paths.

## Fallback Strategy

Provider selection should always prefer safe deterministic behavior:

1. Use local AI only if explicitly enabled and available.
2. If local AI fails or is unavailable, fall back to `TemplateAiProvider`.
3. If a cloud provider is enabled later, keep it optional and never required for core reminders.
4. MOM Check, Daily Summary, and Routines must remain functional without AI.
