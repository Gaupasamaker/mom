import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, fonts, spacing } from '../theme';
import type { CalendarEvent } from '../types';
import { PaperCard } from './PaperCard';
import { TapeLabel } from './TapeLabel';

type Props = {
  events: CalendarEvent[];
  title?: string;
  maxItems?: number;
};

const formatTime = (date: string) =>
  new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(date));

export function ScheduleCard({ events, title = "Today's Top Notes", maxItems }: Props) {
  const visibleEvents = typeof maxItems === 'number' ? events.slice(0, maxItems) : events;
  const hiddenCount = Math.max(events.length - visibleEvents.length, 0);

  return (
    <View style={styles.wrap}>
      <TapeLabel label={title} color="#88A7BD" />
      <PaperCard backgroundColor="#FFFDF6" style={styles.card}>
        {visibleEvents.map((event) => (
          <View key={event.id} style={styles.row}>
            <Text style={styles.time}>{formatTime(event.startsAt)}</Text>
            <Text style={styles.title}>{event.title}</Text>
            <Feather name={iconFor(event.category)} size={16} color={colors.sageDark} />
          </View>
        ))}
        {hiddenCount > 0 ? <Text style={styles.more}>+ {hiddenCount} more later today</Text> : null}
        <Text style={styles.footer}>You've got this.</Text>
      </PaperCard>
    </View>
  );
}

const iconFor = (category: CalendarEvent['category']): keyof typeof Feather.glyphMap => {
  if (category === 'work') return 'monitor';
  if (category === 'medical') return 'heart';
  if (category === 'family') return 'users';
  return 'smile';
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  footer: {
    color: colors.coral,
    fontFamily: fonts.script,
    fontSize: 22,
    lineHeight: 27,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  more: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    borderBottomColor: 'rgba(216, 191, 160, 0.7)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 38,
  },
  time: {
    color: colors.ink,
    fontFamily: fonts.label,
    fontSize: 12,
    width: 70,
  },
  title: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  wrap: {
    flex: 1,
    minWidth: 0,
  },
});
