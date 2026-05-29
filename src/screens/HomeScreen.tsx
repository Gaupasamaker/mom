import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { BirthdayCard } from '../components/BirthdayCard';
import { ChecklistCard } from '../components/ChecklistCard';
import { EmptyState } from '../components/EmptyState';
import { GreetingCard } from '../components/GreetingCard';
import { MomCTAButton } from '../components/MomCTAButton';
import { PaperTexture } from '../components/PaperTexture';
import { ReminderCard } from '../components/ReminderCard';
import { ScheduleCard } from '../components/ScheduleCard';
import { WeatherCard } from '../components/WeatherCard';
import { colors, fonts, spacing } from '../theme';
import { t } from '../i18n';
import type {
  AppLanguage,
  Birthday,
  CalendarEvent,
  DailySummary,
  LittleReminder,
  MomPersonality,
  PreparationTask,
  Routine,
  ShoppingList,
  WeatherForecast,
} from '../types';

type Props = {
  birthdays: Birthday[];
  calendarEvents: CalendarEvent[];
  dailySummary: DailySummary | null;
  littleReminders: LittleReminder[];
  currentRoutine: Routine | null;
  personality: MomPersonality;
  preparationTasks: PreparationTask[];
  shoppingLists: ShoppingList[];
  weatherForecast?: WeatherForecast | null;
  onMomCheckPress: () => void;
  onRefreshWeather: () => void;
  onSettingsPress: () => void;
  onToggleShoppingItem: (listId: string, itemId: string) => void;
  language: AppLanguage;
};

const daysBetween = (from: string, to: string) =>
  Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86400000);

export function HomeScreen({
  birthdays,
  calendarEvents,
  dailySummary,
  littleReminders,
  currentRoutine,
  personality,
  preparationTasks,
  shoppingLists,
  weatherForecast,
  onMomCheckPress,
  onRefreshWeather,
  onSettingsPress,
  onToggleShoppingItem,
  language,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = calendarEvents
    .filter((event) => event.startsAt.startsWith(today))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 4);
  const nextBirthday = [...birthdays]
    .map((birthday) => ({ birthday, daysUntil: daysBetween(today, birthday.date) }))
    .filter(({ daysUntil }) => daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)[0];
  const shoppingList = shoppingLists[0];
  const urgentHighlights = dailySummary?.highlights.filter((highlight) => highlight.priority === 'urgent').slice(0, 2) ?? [];
  const essentialShopping = shoppingList?.items.filter((item) => (item.essential || item.isEssential) && !item.checked).slice(0, 4) ?? [];

  return (
    <View style={styles.screen}>
      <PaperTexture />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <View style={styles.brandRow}>
            <Ionicons name="leaf-outline" size={26} color={colors.sageDark} />
            <Text style={styles.logo}>MOM</Text>
            <Ionicons name="leaf-outline" size={26} color={colors.sageDark} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={onSettingsPress}>
            <Feather name="settings" size={28} color={colors.coralDark} />
          </Pressable>
        </View>

        <GreetingCard language={language} />
        <WeatherCard forecast={weatherForecast} cityLabel={t(language, 'home.chooseCity')} onRefresh={onRefreshWeather} language={language} />

        {preparationTasks.length > 0 ? (
          <View style={styles.prepBlock}>
            <Text style={styles.sectionLabel}>{t(language, 'home.prepTitle')}</Text>
            <View style={styles.prepCard}>
              {currentRoutine ? <Text style={styles.prepIntro}>{currentRoutine.message}</Text> : null}
              {preparationTasks.map((task) => (
                <View key={task.id} style={styles.prepRow}>
                  <View style={[styles.prepDot, task.priority === 'urgent' && styles.prepDotUrgent]} />
                  <View style={styles.prepCopy}>
                    <Text style={styles.prepTitle}>{task.title}</Text>
                    {task.message ? <Text style={styles.prepMessage}>{task.message}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : currentRoutine ? (
          <View style={styles.prepBlock}>
            <Text style={styles.sectionLabel}>{t(language, 'home.prepTitle')}</Text>
            <View style={styles.prepCard}>
              <Text style={styles.prepIntro}>{currentRoutine.message}</Text>
            </View>
          </View>
        ) : null}

        {dailySummary ? (
          <View style={styles.summaryWrap}>
            <Text style={styles.sectionLabel}>{t(language, 'home.summaryTitle')}</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{dailySummary.topMessage}</Text>
              <View style={styles.summaryStats}>
                <Text style={styles.stat}>{t(language, 'home.events', { count: dailySummary.eventCountToday })}</Text>
                <Text style={styles.stat}>{t(language, 'home.reminders', { count: dailySummary.dueReminderCount + dailySummary.overdueReminderCount })}</Text>
                <Text style={styles.stat}>{t(language, 'home.birthdaysSoon', { count: dailySummary.upcomingBirthdayCount })}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {urgentHighlights.length > 0 ? (
          <View style={styles.priorityBlock}>
            <Text style={styles.sectionLabel}>{t(language, 'home.needsLook')}</Text>
            {urgentHighlights.map((highlight) => (
              <View key={`${highlight.type}-${highlight.sourceId ?? highlight.title}`} style={styles.highlightRow}>
                <Text style={styles.highlightTitle}>{highlight.title}</Text>
                <Text style={styles.highlightMessage}>{highlight.message}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {todayEvents.length > 0 ? (
          <ScheduleCard events={todayEvents} maxItems={3} language={language} />
        ) : (
          <EmptyState kind="home-events" tone={personality} language={language} />
        )}
        <MomCTAButton onPress={onMomCheckPress} label={t(language, 'cta.momCheck')} />

        <Text style={styles.sectionLabel}>{t(language, 'home.pinnedLater')}</Text>
        {nextBirthday ? (
          <BirthdayCard birthday={nextBirthday.birthday} daysUntil={nextBirthday.daysUntil} language={language} />
        ) : (
          <EmptyState kind="birthdays" tone={personality} language={language} />
        )}
        <View style={styles.spacer} />
        {shoppingList && essentialShopping.length > 0 ? (
          <ChecklistCard
            title={t(language, 'home.shoppingEssentials')}
            items={essentialShopping}
            onToggleItem={(itemId) => onToggleShoppingItem(shoppingList.id, itemId)}
          />
        ) : shoppingList ? (
          <ChecklistCard title={shoppingList.title} items={shoppingList.items.slice(0, 5)} onToggleItem={(itemId) => onToggleShoppingItem(shoppingList.id, itemId)} />
        ) : (
          <EmptyState kind="shopping" tone={personality} language={language} />
        )}
        <View style={styles.spacer} />
        {littleReminders.length > 0 ? (
          <ReminderCard reminders={littleReminders} language={language} />
        ) : (
          <EmptyState kind="little-reminders" tone={personality} language={language} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 34,
    paddingTop: 54,
  },
  logo: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
  },
  screen: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  topBarSpacer: {
    width: 28,
  },
  sectionLabel: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  spacer: {
    height: spacing.lg,
  },
  highlightMessage: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  highlightRow: {
    backgroundColor: '#FFF7DF',
    borderColor: colors.line,
    borderRadius: 13,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  highlightTitle: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2,
  },
  priorityBlock: {
    marginBottom: spacing.md,
  },
  prepBlock: {
    marginBottom: spacing.lg,
  },
  prepCard: {
    backgroundColor: '#FFF7DF',
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
  },
  prepCopy: {
    flex: 1,
  },
  prepDot: {
    backgroundColor: colors.sage,
    borderRadius: 6,
    height: 12,
    marginTop: 6,
    width: 12,
  },
  prepDotUrgent: {
    backgroundColor: colors.coral,
  },
  prepIntro: {
    color: colors.blueDeep,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  prepMessage: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  prepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  prepTitle: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  stat: {
    backgroundColor: '#EBD4A5',
    borderRadius: 10,
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  summaryCard: {
    backgroundColor: '#FFF1CD',
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  summaryText: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 25,
  },
  summaryWrap: {
    marginBottom: spacing.lg,
  },
});
