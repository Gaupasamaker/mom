import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { PaperCard } from '../components/PaperCard';
import { PaperTexture } from '../components/PaperTexture';
import { colors, fonts, spacing } from '../theme';
import type { MomPersonality, UserPreferences, WeatherCity, WeatherForecast } from '../types';
import { confirmDestructive } from '../utils/confirm';

type Props = {
  preferences: UserPreferences;
  onPreferencesChange: (patch: Partial<UserPreferences>) => void;
  onExportData: () => string;
  onImportData: (json: string) => void;
  onResetData: () => void;
  onRestoreDemoData: () => void;
  weatherForecast?: WeatherForecast | null;
  weatherLoading: boolean;
  weatherSearchMessage: string | null;
  weatherSearchResults: WeatherCity[];
  onSearchCities: (query: string) => void;
  onSelectWeatherCity: (city: WeatherCity) => void;
  onRefreshWeather: () => void;
  onBack: () => void;
};

const modes: Array<{ value: MomPersonality; label: string; sample: string }> = [
  { value: 'sweet', label: 'Sweet Mom', sample: 'Take your umbrella, sweetheart.' },
  { value: 'funny', label: 'Funny Mom', sample: 'Umbrella today. Drama avoided.' },
  { value: 'strict', label: 'Strict Mom', sample: 'Bring the umbrella. No debate.' },
  { value: 'minimal', label: 'Minimal Mom', sample: 'Umbrella today.' },
];

export function SettingsScreen({
  preferences,
  onPreferencesChange,
  onExportData,
  onImportData,
  onResetData,
  onRestoreDemoData,
  weatherForecast,
  weatherLoading,
  weatherSearchMessage,
  weatherSearchResults,
  onSearchCities,
  onSelectWeatherCity,
  onRefreshWeather,
  onBack,
}: Props) {
  const [debugJson, setDebugJson] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const selectedCity = preferences.selectedCity;
  const selectedCityLabel = selectedCity
    ? [selectedCity.name, selectedCity.admin1, selectedCity.country].filter(Boolean).join(', ')
    : null;

  return (
    <View style={styles.screen}>
      <PaperTexture />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={colors.coralDark} />
          <Text style={styles.backText}>Back to board</Text>
        </Pressable>

        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>MOM keeps these notes on this device.</Text>

        <PaperCard tapeColor={colors.beige} style={styles.card}>
          <Text style={styles.cardTitle}>Personality Mode</Text>
          {modes.map((mode) => {
            const active = preferences.personality === mode.value;
            return (
              <Pressable
                key={mode.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => onPreferencesChange({ personality: mode.value })}
                style={[styles.modeRow, active && styles.activeMode]}
              >
                <View style={[styles.radio, active && styles.activeRadio]} />
                <View style={styles.modeCopy}>
                  <Text style={styles.modeLabel}>{mode.label}</Text>
                  <Text style={styles.modeSample}>{mode.sample}</Text>
                </View>
              </Pressable>
            );
          })}
        </PaperCard>

        <PaperCard backgroundColor="#E5EFE4" style={styles.card}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <SettingToggle
            label="Enable notifications"
            active={preferences.notificationsEnabled}
            onPress={() => onPreferencesChange({ notificationsEnabled: !preferences.notificationsEnabled })}
          />
          <SettingToggle
            label="Evening reminder"
            active={preferences.eveningReminderEnabled}
            onPress={() => onPreferencesChange({ eveningReminderEnabled: !preferences.eveningReminderEnabled })}
          />
          <Text style={styles.label}>Daily summary time</Text>
          <TextInput
            value={preferences.dailySummaryTime}
            onChangeText={(dailySummaryTime) => onPreferencesChange({ dailySummaryTime })}
            placeholder="08:00"
            style={styles.input}
          />
        </PaperCard>

        <PaperCard backgroundColor="#FFF1CD" style={styles.card}>
          <Text style={styles.cardTitle}>Routines</Text>
          <SettingToggle
            label="Morning routine"
            active={preferences.morningRoutineEnabled}
            onPress={() => onPreferencesChange({ morningRoutineEnabled: !preferences.morningRoutineEnabled })}
          />
          <Text style={styles.label}>Morning time</Text>
          <TextInput
            value={preferences.morningRoutineTime}
            onChangeText={(morningRoutineTime) => onPreferencesChange({ morningRoutineTime })}
            placeholder="07:30"
            style={styles.input}
          />
          <SettingToggle
            label="Evening routine"
            active={preferences.eveningRoutineEnabled}
            onPress={() => onPreferencesChange({ eveningRoutineEnabled: !preferences.eveningRoutineEnabled })}
          />
          <Text style={styles.label}>Evening time</Text>
          <TextInput
            value={preferences.eveningRoutineTime}
            onChangeText={(eveningRoutineTime) => onPreferencesChange({ eveningRoutineTime })}
            placeholder="20:30"
            style={styles.input}
          />
          <SettingToggle
            label="Include weather"
            active={preferences.includeWeatherInRoutines}
            onPress={() => onPreferencesChange({ includeWeatherInRoutines: !preferences.includeWeatherInRoutines })}
          />
          <SettingToggle
            label="Include birthdays"
            active={preferences.includeBirthdaysInRoutines}
            onPress={() => onPreferencesChange({ includeBirthdaysInRoutines: !preferences.includeBirthdaysInRoutines })}
          />
          <SettingToggle
            label="Include shopping"
            active={preferences.includeShoppingInRoutines}
            onPress={() => onPreferencesChange({ includeShoppingInRoutines: !preferences.includeShoppingInRoutines })}
          />
          <SettingToggle
            label="Include calendar prep"
            active={preferences.includeCalendarPrepInRoutines}
            onPress={() => onPreferencesChange({ includeCalendarPrepInRoutines: !preferences.includeCalendarPrepInRoutines })}
          />
        </PaperCard>

        <PaperCard backgroundColor={colors.paper} style={styles.card}>
          <Text style={styles.cardTitle}>Weather City</Text>
          {selectedCityLabel ? (
            <View style={styles.citySummary}>
              <Text style={styles.cityName}>{selectedCityLabel}</Text>
              <Text style={styles.body}>
                {weatherForecast?.currentConditionLabel ?? 'Weather not checked yet'}
                {typeof weatherForecast?.currentTemperature === 'number' ? ` - ${Math.round(weatherForecast.currentTemperature)} C` : ''}
              </Text>
              <Text style={styles.metaText}>
                Last update: {weatherForecast?.updatedAt ? new Date(weatherForecast.updatedAt).toLocaleString() : 'Not yet'}
              </Text>
            </View>
          ) : (
            <Text style={styles.body}>No city selected yet. Add one and I'll keep an eye on the sky for you.</Text>
          )}
          <View style={styles.utilityGrid}>
            <UtilityButton label={weatherLoading ? 'Checking...' : 'Refresh weather'} onPress={onRefreshWeather} />
          </View>
          <Text style={styles.label}>Search city</Text>
          <TextInput
            value={cityQuery}
            onChangeText={setCityQuery}
            placeholder="Alicante"
            style={styles.input}
          />
          <View style={styles.utilityGrid}>
            <UtilityButton label={weatherLoading ? 'Searching...' : 'Search'} onPress={() => onSearchCities(cityQuery)} />
          </View>
          {weatherSearchMessage ? <Text style={styles.metaText}>{weatherSearchMessage}</Text> : null}
          {weatherSearchResults.map((city) => (
            <Pressable
              key={city.id}
              accessibilityRole="button"
              onPress={() => onSelectWeatherCity(city)}
              style={styles.cityResult}
            >
              <Text style={styles.cityResultName}>{[city.name, city.admin1, city.country].filter(Boolean).join(', ')}</Text>
              <Text style={styles.metaText}>
                {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
              </Text>
            </Pressable>
          ))}

          <Text style={styles.label}>Time format</Text>
          <View style={styles.segment}>
            {(['12h', '24h'] as const).map((format) => (
              <Pressable
                key={format}
                onPress={() => onPreferencesChange({ timeFormat: format })}
                style={[styles.segmentOption, preferences.timeFormat === format && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, preferences.timeFormat === format && styles.segmentTextActive]}>{format}</Text>
              </Pressable>
            ))}
          </View>
        </PaperCard>

        <PaperCard backgroundColor="#FFF1CD" style={styles.card}>
          <Text style={styles.cardTitle}>Developer Utilities</Text>
          <Text style={styles.body}>Testing-only tools for local data. Import replaces the current board on this device.</Text>
          <View style={styles.utilityGrid}>
            <UtilityButton label="Export JSON" onPress={() => setDebugJson(onExportData())} />
            <UtilityButton label="Import JSON" onPress={() => onImportData(debugJson)} />
            <UtilityButton label="Restore demo" onPress={onRestoreDemoData} />
            <UtilityButton
              label="Reset all"
              danger
              onPress={() => confirmDestructive('Reset local data?', 'This clears reminders, events, lists, birthdays, and family notes.', onResetData)}
            />
          </View>
          <Text style={styles.label}>Local JSON</Text>
          <TextInput
            value={debugJson}
            onChangeText={setDebugJson}
            multiline
            placeholder="Export data here, or paste JSON to import."
            style={[styles.input, styles.jsonInput]}
          />
        </PaperCard>

        <PaperCard backgroundColor="#E5EFE4" style={styles.card}>
          <Text style={styles.cardTitle}>Phase 2 Ready</Text>
          <Text style={styles.body}>
            Storage, rules, notifications, and preferences now sit behind services, so a future redesign can replace the
            screens without rewriting MOM's local brain.
          </Text>
        </PaperCard>
      </ScrollView>
    </View>
  );
}

function UtilityButton({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.utilityButton, danger && styles.dangerButton]}>
      <Text style={[styles.utilityButtonText, danger && styles.dangerButtonText]}>{label}</Text>
    </Pressable>
  );
}

function SettingToggle({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: active }} onPress={onPress} style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggle, active && styles.toggleActive]}>
        <View style={[styles.knob, active && styles.knobActive]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeMode: {
    backgroundColor: '#FCE2CC',
    borderColor: colors.coral,
  },
  activeRadio: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  backText: {
    color: colors.coralDark,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '800',
  },
  body: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: 58,
  },
  cityName: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  cityResult: {
    backgroundColor: '#FFF7DF',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  cityResultName: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '900',
  },
  citySummary: {
    backgroundColor: '#FFF7DF',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
  },
  input: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  jsonInput: {
    minHeight: 160,
    textAlignVertical: 'top',
  },
  knob: {
    backgroundColor: colors.white,
    borderRadius: 9,
    height: 18,
    transform: [{ translateX: 1 }],
    width: 18,
  },
  knobActive: {
    transform: [{ translateX: 20 }],
  },
  label: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  modeCopy: {
    flex: 1,
  },
  modeLabel: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '800',
  },
  modeRow: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  modeSample: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  metaText: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  radio: {
    borderColor: colors.mutedInk,
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    width: 18,
  },
  screen: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  segment: {
    backgroundColor: colors.paperDeep,
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  segmentActive: {
    backgroundColor: colors.coral,
  },
  segmentOption: {
    alignItems: 'center',
    borderRadius: 11,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  segmentText: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: colors.white,
  },
  subtitle: {
    color: colors.blueDeep,
    fontFamily: fonts.script,
    fontSize: 27,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: '900',
  },
  toggle: {
    backgroundColor: colors.paperDeep,
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    width: 46,
  },
  toggleActive: {
    backgroundColor: colors.sage,
  },
  toggleLabel: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '800',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dangerButton: {
    backgroundColor: '#FCE3D8',
    borderColor: colors.coral,
  },
  dangerButtonText: {
    color: colors.coralDark,
  },
  utilityButton: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minWidth: '44%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  utilityButtonText: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '900',
  },
  utilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
