# MOM Mobile MVP

MOM is a warm, proactive reminder assistant for everyday family life. This first milestone is an Expo + React Native + TypeScript MVP with mock data, template-based messages, and a simple rules engine. It does not use generative AI, chat UI, or external APIs yet.

## Setup

```bash
npm install
npm run start
```

For a browser preview similar to a web app workflow:

```bash
npm run web:local
```

Then open `http://localhost:8083`.

Useful checks:

```bash
npm run typecheck
npm test
npm run export:android
npm run export:ios
npm run export:web
```

## What Is Built

- Onboarding with personality mode and reminder interests.
- Home / Today board styled like a retro family fridge organizer.
- Bottom navigation: Home, Calendar, MOM Check heart button, Lists, Family.
- Settings access from the Home top icon.
- MOM Check modal opened from the center heart button or the main CTA.
- Daily Summary Engine that turns stored local data into structured highlights for Home / Today.
- Local-first persistence for reminders, calendar events, birthdays, shopping lists, little reminders, family members, and preferences.
- CRUD flows for calendar, lists/reminders, family members, birthdays, and shopping items, including metadata such as priority, repeat, category, essential items, gift ideas, favorite treats, and notes.
- MOM Check groups rule-based insights into Urgent, Important, and For later.
- Local notification scheduling is wired behind `NotificationScheduler` for reminder due dates, birthdays, next-day appointments, daily summaries, and evening reminders.
- Settings includes testing-only developer utilities to export/import JSON, reset local data, and restore demo data.
- Real weather integration through Open-Meteo using a manually selected city, with no API key, no GPS permissions, and local forecast caching.
- Rule-based preparation tasks and morning/evening routines help the user get ready for today and tomorrow.

The generated visual concept used for implementation is saved at:

`assets/design/mom-home-concept.png`

The polish reference for the V1 UX pass is saved at:

`assets/design/mom-home-polish-reference.png`

## Architecture

```text
src/
  components/      Reusable scrapbook UI primitives and cards
  data/            Mock data for the MVP
  features/        UI-facing hooks that orchestrate repositories and services
  repositories/    AsyncStorage-backed local repositories
  screens/         Onboarding, Home, Calendar, Lists, Family, Settings, MOM Check
  services/        MOM rules, daily summary, preparation, routines, template messages, MOM Check orchestration
  services/ai/     Optional AI provider boundary; template provider remains the default
  services/placeholders/
                  Future Firebase, weather, calendar, location, notifications, and AI boundaries
  theme.ts         Color, spacing, typography, radius, and shadow tokens
  types.ts         Product data models
```

## Design System

The UI uses warm cream and beige backgrounds, off-white cards, notebook paper, sticky note colors, tape labels, pushpins, paper shadows, vintage label typography, and handwritten-style heading accents. Components such as `PaperCard`, `TapeLabel`, `ChecklistCard`, `GreetingCard`, `ScheduleCard`, `BirthdayCard`, `MomCTAButton`, and `BottomNavBar` keep the scrapbook aesthetic reusable and maintainable.

## Local-First Data

The app uses AsyncStorage through repository classes instead of direct screen access. This keeps the current scrapbook UI replaceable later: future SQLite/Firebase work can change repository internals without rewriting the screens.

Current repository layer:

- `ReminderRepository`
- `CalendarRepository`
- `BirthdayRepository`
- `ShoppingRepository`
- `FamilyRepository`
- `LittleReminderRepository`
- `PreferencesRepository`
- `WeatherRepository`
- `WeatherForecastRepository`

Settings also includes a testing-only data panel:

- Export local data as JSON.
- Import local data from JSON.
- Reset all local user data.
- Restore the seeded demo board.

## Rule Engine

`DailySummaryService.create()` accepts stored data through `MomCheckInput` and returns structured daily counts plus `DailyHighlight[]` items for Home / Today.

`PreparationService.generate()` creates local, generated `PreparationTask[]` items from weather, calendar events, birthdays, reminders, and shopping essentials.

`RoutineService.generate()` creates Morning and Evening routine summaries from preparation tasks plus daily context.

`MomRulesEngine.evaluate()` accepts the same input and returns a prioritized `MomCheckResult` with grouped insights.

Current rules:

- Rain expected later today from the real forecast creates an umbrella insight.
- High wind, hot days, and cold days create weather preparation insights.
- Overdue reminders create a high-priority routine insight.
- Event within the next 2 hours creates an urgent insight.
- Birthday tomorrow creates an urgent insight; birthday within 7 days creates an important planning insight.
- Medical or health appointment tomorrow creates an urgent preparation insight.
- Unchecked essential shopping items create a grocery insight.
- Reminder due tomorrow creates an important preparation insight.
- More than 3 events today creates a busy-day pacing suggestion.
- Tomorrow morning events create a preparation insight.
- Incomplete little reminders and non-essential shopping create lower-priority later insights.
- Preparation tasks are added as `Preparation` insights when routine preferences are enabled.

`MomTemplateService` applies one of four MVP personality modes: Sweet Mom, Funny Mom, Strict Mom, and Minimal Mom.

## Routines

Routine preferences live in `UserPreferences` and are persisted locally:

- Morning routine enabled/time.
- Evening routine enabled/time.
- Include weather, birthdays, shopping, and calendar preparation.

The generated tasks are not permanently stored yet; they are deterministic outputs from local data, which keeps them easy to redesign later.

## Weather Integration

Weather is integrated through Open-Meteo:

- City search uses `https://geocoding-api.open-meteo.com/v1/search`.
- Forecasts use `https://api.open-meteo.com/v1/forecast`.
- The app requests current temperature/weather code, daily max/min temperature, hourly precipitation probability, hourly precipitation, hourly weather code, and hourly wind speed.
- `WeatherService` normalizes Open-Meteo responses into app-specific `WeatherForecast` data.
- `WeatherCodeService` maps Open-Meteo weather codes into friendly labels and MaterialCommunityIcons identifiers.
- `WeatherForecastRepository` caches the latest forecast locally and treats cached weather as fresh for 60 minutes.
- If refresh fails, MOM falls back to cached weather when available; otherwise it shows a safe unavailable state.

The user selects a city manually from Settings. MOM does not request GPS/location permissions.

## Notifications

`NotificationScheduler` is native-safe and skips scheduling on web. In native Expo environments it requests permission, clears existing scheduled local notifications, and rebuilds plans from current stored data. It currently schedules:

- Reminder notifications at each incomplete reminder due date.
- Birthday reminders the day before at 9:00.
- Next-day event reminders the evening before.
- Daily summary reminders using the saved summary time.
- Optional evening reset reminders.
- Morning and evening routine notification slots when enabled.

## Phase 2 AI Path

AI can be added without rewriting the app by implementing the provider interfaces under `src/services/ai`.

- `AiProvider` defines the future AI boundary, including message enhancement, tone rewrites, daily summaries, preparation notes, routine messages, and MOM Check insights.
- `AiService` and `AiProviderFactory` select providers by mode and safely fall back to templates for unsupported providers.
- `TemplateAiProvider` is the production default and keeps all behavior deterministic.
- `MockAiProvider` supports tests and dev flows.
- `CloudGeminiProvider`, `CloudOpenAIProvider`, `AndroidGeminiNanoProvider`, and `IOSFoundationModelsProvider` are placeholders only.
- `AiMessageEnhancer`, `AiDailySummaryService`, and `AiSuggestionService` delegate through the provider registry but still use templates by default.
- `FirebaseService` for user profiles, family data, and synced lists.
- `CalendarService` and `LocationService` for live context.
- `NotificationService` for proactive local or push reminders.

See `docs/AI_READINESS.md` for provider architecture, privacy principles, Gemini Nano notes, and fallback strategy.

Gemini Nano could be useful later for on-device message rewriting, daily summaries, and warmer preparation notes without sending family context to the cloud. It is not implemented yet because this Expo MVP has no native modules, no local model capability checks, and no Android-specific runtime layer. A future Android integration would need a native module or config plugin, device/model availability checks, privacy boundaries, and a reliable fallback to `TemplateAiProvider` whenever local AI is unavailable.

The important constraint remains: MOM should stay proactive and card-based, not become a chatbot.

## Suggested Next Milestones

1. Add search and filtering across reminders, lists, calendar, and family notes.
2. Add recurring reminder materialization for daily/weekly/monthly/yearly repeats.
3. Add calendar/weather integrations behind the existing service interfaces.
4. Move storage from AsyncStorage to SQLite if querying needs grow.
5. Add AI only as a message enhancer and suggestion layer, keeping rules as the deterministic core.
