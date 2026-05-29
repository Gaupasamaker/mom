import { defaultAppData } from '../data/defaultData';
import type {
  Birthday,
  CalendarEvent,
  FamilyMember,
  LittleReminder,
  Reminder,
  ShoppingList,
  UserPreferences,
  WeatherAlert,
} from '../types';
import { JsonCollectionRepository } from './JsonCollectionRepository';
import { LocalStorageService } from './LocalStorageService';
import { WeatherCacheRepository } from './WeatherCacheRepository';

const keys = {
  preferences: 'mom.preferences.v1',
  reminders: 'mom.reminders.v1',
  calendarEvents: 'mom.calendarEvents.v1',
  birthdays: 'mom.birthdays.v1',
  familyMembers: 'mom.familyMembers.v1',
  shoppingLists: 'mom.shoppingLists.v1',
  littleReminders: 'mom.littleReminders.v1',
  weatherAlerts: 'mom.weatherAlerts.v1',
  weatherForecast: 'mom.weatherForecast.v1',
};

class PreferencesRepositoryImpl {
  async get(): Promise<UserPreferences> {
    const raw = await LocalStorageService.getItem(keys.preferences);
    return raw ? { ...defaultAppData.preferences, ...(JSON.parse(raw) as Partial<UserPreferences>) } : defaultAppData.preferences;
  }

  async save(preferences: UserPreferences) {
    await LocalStorageService.setItem(keys.preferences, JSON.stringify(preferences));
  }

  async seed() {
    const raw = await LocalStorageService.getItem(keys.preferences);
    if (!raw) {
      await this.save(defaultAppData.preferences);
    }
  }
}

export const PreferencesRepository = new PreferencesRepositoryImpl();
export const ReminderRepository = new JsonCollectionRepository<Reminder>(keys.reminders);
export const CalendarRepository = new JsonCollectionRepository<CalendarEvent>(keys.calendarEvents);
export const BirthdayRepository = new JsonCollectionRepository<Birthday>(keys.birthdays);
export const ShoppingRepository = new JsonCollectionRepository<ShoppingList>(keys.shoppingLists);
export const FamilyRepository = new JsonCollectionRepository<FamilyMember>(keys.familyMembers);
export const LittleReminderRepository = new JsonCollectionRepository<LittleReminder>(keys.littleReminders);
export const WeatherRepository = new JsonCollectionRepository<WeatherAlert>(keys.weatherAlerts);
export const WeatherForecastRepository = new WeatherCacheRepository(keys.weatherForecast);

export async function seedRepositories() {
  await Promise.all([
    PreferencesRepository.seed(),
    ReminderRepository.seed(defaultAppData.reminders),
    CalendarRepository.seed(defaultAppData.calendarEvents),
    BirthdayRepository.seed(defaultAppData.birthdays),
    ShoppingRepository.seed(defaultAppData.shoppingLists),
    FamilyRepository.seed(defaultAppData.familyMembers),
    LittleReminderRepository.seed(defaultAppData.littleReminders),
    WeatherRepository.seed(defaultAppData.weatherAlerts),
  ]);
}
