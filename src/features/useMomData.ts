import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { defaultAppData } from '../data/defaultData';
import { userProfile } from '../data/mockData';
import {
  BirthdayRepository,
  CalendarRepository,
  FamilyRepository,
  LittleReminderRepository,
  PreferencesRepository,
  ReminderRepository,
  seedRepositories,
  ShoppingRepository,
  WeatherRepository,
  WeatherForecastRepository,
} from '../repositories/MomRepositories';
import { NotificationScheduler } from '../services/NotificationScheduler';
import { WeatherService } from '../services/WeatherService';
import type {
  Birthday,
  CalendarEvent,
  FamilyMember,
  LittleReminder,
  MomAppData,
  Reminder,
  ShoppingItem,
  ShoppingList,
  WeatherCity,
  WeatherForecast,
  UserPreferences,
} from '../types';

type EntityInput<T extends { id: string }> = Omit<T, 'id'> & { id?: string };

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;

const cloneDefaultData = (): MomAppData => JSON.parse(JSON.stringify(defaultAppData)) as MomAppData;

const normalizeImportedData = (input: unknown, currentPreferences: UserPreferences): MomAppData => {
  const candidate = input && typeof input === 'object' ? (input as Partial<MomAppData>) : {};
  const fallback = cloneDefaultData();

  return {
    preferences: {
      ...fallback.preferences,
      ...currentPreferences,
      ...(candidate.preferences ?? {}),
      hasCompletedOnboarding: true,
    },
    reminders: Array.isArray(candidate.reminders) ? candidate.reminders : [],
    calendarEvents: Array.isArray(candidate.calendarEvents) ? candidate.calendarEvents : [],
    birthdays: Array.isArray(candidate.birthdays) ? candidate.birthdays : [],
    familyMembers: Array.isArray(candidate.familyMembers) ? candidate.familyMembers : [],
    shoppingLists: Array.isArray(candidate.shoppingLists) ? candidate.shoppingLists : [],
    littleReminders: Array.isArray(candidate.littleReminders) ? candidate.littleReminders : [],
    weatherAlerts: Array.isArray(candidate.weatherAlerts) ? candidate.weatherAlerts : fallback.weatherAlerts,
    weatherForecast: candidate.weatherForecast ?? null,
  };
};

export function useMomData() {
  const [data, setData] = useState<MomAppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherSearchResults, setWeatherSearchResults] = useState<WeatherCity[]>([]);
  const [weatherSearchMessage, setWeatherSearchMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const weatherBootstrapped = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    await seedRepositories();
    const [
      preferences,
      reminders,
      calendarEvents,
      birthdays,
      familyMembers,
      shoppingLists,
      littleReminders,
      weatherAlerts,
      weatherForecast,
    ] = await Promise.all([
      PreferencesRepository.get(),
      ReminderRepository.list(),
      CalendarRepository.list(),
      BirthdayRepository.list(),
      FamilyRepository.list(),
      ShoppingRepository.list(),
      LittleReminderRepository.list(),
      WeatherRepository.list(),
      WeatherForecastRepository.get(),
    ]);

    setData({
      preferences,
      reminders,
      calendarEvents,
      birthdays,
      familyMembers,
      shoppingLists,
      littleReminders,
      weatherAlerts,
      weatherForecast,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = useCallback(async (next: MomAppData, message?: string) => {
    setSaving(true);
    await Promise.all([
      PreferencesRepository.save(next.preferences),
      ReminderRepository.replace(next.reminders),
      CalendarRepository.replace(next.calendarEvents),
      BirthdayRepository.replace(next.birthdays),
      FamilyRepository.replace(next.familyMembers),
      ShoppingRepository.replace(next.shoppingLists),
      LittleReminderRepository.replace(next.littleReminders),
      WeatherRepository.replace(next.weatherAlerts),
      next.weatherForecast ? WeatherForecastRepository.save(next.weatherForecast) : WeatherForecastRepository.clear(),
    ]);
    setData(next);
    setSaving(false);
    if (message) {
      setFeedback(message);
    }

    void NotificationScheduler.syncSchedules({
      preferences: next.preferences,
      reminders: next.reminders,
      birthdays: next.birthdays,
      calendarEvents: next.calendarEvents,
    });
  }, []);

  const updatePreferences = useCallback(
    async (patch: Partial<UserPreferences>) => {
      if (!data) return;
      await persist({ ...data, preferences: { ...data.preferences, ...patch } }, 'Settings saved.');
    },
    [data, persist],
  );

  const exportData = useCallback(() => {
    if (!data) return '';
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importDataFromJson = useCallback(
    async (json: string) => {
      if (!data) return;
      try {
        const parsed = JSON.parse(json) as unknown;
        await persist(normalizeImportedData(parsed, data.preferences), 'Local data imported.');
      } catch {
        setFeedback('That JSON did not import. Check the format and try again.');
      }
    },
    [data, persist],
  );

  const resetLocalData = useCallback(async () => {
    if (!data) return;
    await persist(
      {
        preferences: { ...data.preferences, hasCompletedOnboarding: true },
        reminders: [],
        calendarEvents: [],
        birthdays: [],
        familyMembers: [],
        shoppingLists: [],
        littleReminders: [],
        weatherAlerts: data.weatherAlerts,
        weatherForecast: null,
      },
      'Local data reset.',
    );
  }, [data, persist]);

  const restoreDemoData = useCallback(async () => {
    if (!data) return;
    const demoData = cloneDefaultData();
    await persist(
      {
        ...demoData,
        preferences: {
          ...demoData.preferences,
          personality: data.preferences.personality,
          hasCompletedOnboarding: true,
        },
        weatherForecast: null,
      },
      'Demo data restored.',
    );
  }, [data, persist]);

  const searchCities = useCallback(async (query: string) => {
    setWeatherSearchMessage(null);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setWeatherSearchResults([]);
      setWeatherSearchMessage('Type at least two letters so MOM knows where to look.');
      return;
    }

    setWeatherLoading(true);
    try {
      const results = await WeatherService.searchCities(trimmed);
      setWeatherSearchResults(results);
      setWeatherSearchMessage(results.length ? null : 'No matching cities found. Try a nearby city or a simpler name.');
    } catch {
      setWeatherSearchResults([]);
      setWeatherSearchMessage('I could not search cities right now. Try again in a bit.');
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const applyForecast = useCallback(
    async (forecast: WeatherForecast, message?: string) => {
      if (!data) return;
      await persist({ ...data, weatherForecast: forecast }, message);
    },
    [data, persist],
  );

  const refreshWeather = useCallback(
    async (force = true) => {
      if (!data) return;
      const city = data.preferences.selectedCity;
      if (!city) {
        setFeedback('Choose a city first and MOM will check the sky.');
        return;
      }

      setWeatherLoading(true);
      try {
        if (!force) {
          const fresh = await WeatherForecastRepository.getFresh(new Date(), 60);
          if (fresh) {
            await applyForecast(fresh);
            return;
          }
        }

        const forecast = await WeatherService.fetchForecast(city);
        await applyForecast(forecast, 'Weather updated.');
      } catch {
        const cached = await WeatherForecastRepository.get();
        if (cached) {
          await applyForecast({ ...cached, stale: true }, 'Using the last saved weather. MOM could not refresh it right now.');
        } else {
          await applyForecast(WeatherService.normalizeForecast(city, null), 'Weather is unavailable right now.');
        }
      } finally {
        setWeatherLoading(false);
      }
    },
    [applyForecast, data],
  );

  const selectWeatherCity = useCallback(
    async (city: WeatherCity) => {
      if (!data) return;
      setWeatherSearchResults([]);
      setWeatherSearchMessage(null);
      const nextData: MomAppData = {
        ...data,
        preferences: {
          ...data.preferences,
          preferredCity: city.admin1 && city.country ? `${city.name}, ${city.admin1}, ${city.country}` : city.name,
          selectedCity: city,
        },
      };
      await persist(nextData, 'City saved.');
      setWeatherLoading(true);
      try {
        const forecast = await WeatherService.fetchForecast(city);
        await persist({ ...nextData, weatherForecast: forecast }, 'City and weather saved.');
      } catch {
        const cached = await WeatherForecastRepository.get();
        await persist(
          { ...nextData, weatherForecast: cached ? { ...cached, stale: true } : WeatherService.normalizeForecast(city, null) },
          cached ? 'City saved. Using the last saved weather for now.' : 'City saved. Weather is unavailable right now.',
        );
      } finally {
        setWeatherLoading(false);
      }
    },
    [data, persist],
  );

  useEffect(() => {
    if (weatherBootstrapped.current || !data?.preferences.selectedCity) {
      return;
    }

    weatherBootstrapped.current = true;
    void refreshWeather(false);
  }, [data?.preferences.selectedCity, refreshWeather]);

  const saveReminder = useCallback(
    async (input: EntityInput<Reminder>) => {
      if (!data) return;
      const reminder: Reminder = { ...input, id: input.id ?? createId('reminder') };
      await persist(
        {
          ...data,
          reminders: data.reminders.some((item) => item.id === reminder.id)
            ? data.reminders.map((item) => (item.id === reminder.id ? reminder : item))
            : [...data.reminders, reminder],
        },
        'Reminder saved.',
      );
    },
    [data, persist],
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({ ...data, reminders: data.reminders.filter((item) => item.id !== id) }, 'Reminder deleted.');
    },
    [data, persist],
  );

  const toggleReminder = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({
        ...data,
        reminders: data.reminders.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
      });
    },
    [data, persist],
  );

  const saveCalendarEvent = useCallback(
    async (input: EntityInput<CalendarEvent>) => {
      if (!data) return;
      const event: CalendarEvent = { ...input, id: input.id ?? createId('event') };
      await persist(
        {
          ...data,
          calendarEvents: data.calendarEvents.some((item) => item.id === event.id)
            ? data.calendarEvents.map((item) => (item.id === event.id ? event : item))
            : [...data.calendarEvents, event],
        },
        'Calendar event saved.',
      );
    },
    [data, persist],
  );

  const deleteCalendarEvent = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({ ...data, calendarEvents: data.calendarEvents.filter((item) => item.id !== id) }, 'Event deleted.');
    },
    [data, persist],
  );

  const saveBirthday = useCallback(
    async (input: EntityInput<Birthday>) => {
      if (!data) return;
      const birthday: Birthday = { ...input, id: input.id ?? createId('birthday') };
      await persist(
        {
          ...data,
          birthdays: data.birthdays.some((item) => item.id === birthday.id)
            ? data.birthdays.map((item) => (item.id === birthday.id ? birthday : item))
            : [...data.birthdays, birthday],
        },
        'Birthday saved.',
      );
    },
    [data, persist],
  );

  const deleteBirthday = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({ ...data, birthdays: data.birthdays.filter((item) => item.id !== id) }, 'Birthday deleted.');
    },
    [data, persist],
  );

  const saveFamilyMember = useCallback(
    async (input: EntityInput<FamilyMember>) => {
      if (!data) return;
      const member: FamilyMember = { ...input, id: input.id ?? createId('family') };
      await persist(
        {
          ...data,
          familyMembers: data.familyMembers.some((item) => item.id === member.id)
            ? data.familyMembers.map((item) => (item.id === member.id ? member : item))
            : [...data.familyMembers, member],
        },
        'Family member saved.',
      );
    },
    [data, persist],
  );

  const deleteFamilyMember = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({ ...data, familyMembers: data.familyMembers.filter((item) => item.id !== id) }, 'Family member deleted.');
    },
    [data, persist],
  );

  const saveLittleReminder = useCallback(
    async (input: EntityInput<LittleReminder>) => {
      if (!data) return;
      const reminder: LittleReminder = { ...input, id: input.id ?? createId('little') };
      await persist(
        {
          ...data,
          littleReminders: data.littleReminders.some((item) => item.id === reminder.id)
            ? data.littleReminders.map((item) => (item.id === reminder.id ? reminder : item))
            : [...data.littleReminders, reminder],
        },
        'Little reminder saved.',
      );
    },
    [data, persist],
  );

  const deleteLittleReminder = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({ ...data, littleReminders: data.littleReminders.filter((item) => item.id !== id) }, 'Little reminder deleted.');
    },
    [data, persist],
  );

  const toggleLittleReminder = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({
        ...data,
        littleReminders: data.littleReminders.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
      });
    },
    [data, persist],
  );

  const saveShoppingList = useCallback(
    async (input: EntityInput<ShoppingList>) => {
      if (!data) return;
      const list: ShoppingList = { ...input, id: input.id ?? createId('list') };
      await persist(
        {
          ...data,
          shoppingLists: data.shoppingLists.some((item) => item.id === list.id)
            ? data.shoppingLists.map((item) => (item.id === list.id ? list : item))
            : [...data.shoppingLists, list],
        },
        'Shopping list saved.',
      );
    },
    [data, persist],
  );

  const deleteShoppingList = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({ ...data, shoppingLists: data.shoppingLists.filter((item) => item.id !== id) }, 'Shopping list deleted.');
    },
    [data, persist],
  );

  const saveShoppingItem = useCallback(
    async (listId: string, input: EntityInput<ShoppingItem>) => {
      if (!data) return;
      const item: ShoppingItem = { ...input, id: input.id ?? createId('item') };
      await persist(
        {
          ...data,
          shoppingLists: data.shoppingLists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.some((current) => current.id === item.id)
                    ? list.items.map((current) => (current.id === item.id ? item : current))
                    : [...list.items, item],
                }
              : list,
          ),
        },
        'Shopping item saved.',
      );
    },
    [data, persist],
  );

  const deleteShoppingItem = useCallback(
    async (listId: string, itemId: string) => {
      if (!data) return;
      await persist({
        ...data,
        shoppingLists: data.shoppingLists.map((list) =>
          list.id === listId ? { ...list, items: list.items.filter((item) => item.id !== itemId) } : list,
        ),
      }, 'Shopping item deleted.');
    },
    [data, persist],
  );

  const toggleShoppingItem = useCallback(
    async (listId: string, itemId: string) => {
      if (!data) return;
      await persist({
        ...data,
        shoppingLists: data.shoppingLists.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)),
              }
            : list,
        ),
      });
    },
    [data, persist],
  );

  const momCheckInput = useMemo(() => {
    if (!data) {
      return null;
    }

    const shoppingList = data.shoppingLists[0] ?? { id: 'empty', title: 'Shopping List', items: [] };

    return {
      today: new Date().toISOString().slice(0, 10),
      userProfile: {
        ...userProfile,
        personality: data.preferences.personality,
      },
      preferences: data.preferences,
      reminders: data.reminders,
      calendarEvents: data.calendarEvents,
      birthdays: data.birthdays,
      familyMembers: data.familyMembers,
      shoppingList,
      shoppingLists: data.shoppingLists,
      littleReminders: data.littleReminders,
      weatherAlerts: data.weatherAlerts,
      weatherForecast: data.weatherForecast,
    };
  }, [data]);

  return {
    data,
    loading,
    saving,
    weatherLoading,
    weatherSearchResults,
    weatherSearchMessage,
    feedback,
    clearFeedback: () => setFeedback(null),
    reload: load,
    momCheckInput,
    updatePreferences,
    exportData,
    importDataFromJson,
    resetLocalData,
    restoreDemoData,
    searchCities,
    selectWeatherCity,
    refreshWeather,
    saveReminder,
    deleteReminder,
    toggleReminder,
    saveCalendarEvent,
    deleteCalendarEvent,
    saveBirthday,
    deleteBirthday,
    saveFamilyMember,
    deleteFamilyMember,
    saveLittleReminder,
    deleteLittleReminder,
    toggleLittleReminder,
    saveShoppingList,
    deleteShoppingList,
    saveShoppingItem,
    deleteShoppingItem,
    toggleShoppingItem,
  };
}
