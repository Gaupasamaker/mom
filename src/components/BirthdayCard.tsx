import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, fonts, spacing } from '../theme';
import type { Birthday } from '../types';
import { PaperCard } from './PaperCard';

type Props = {
  birthday: Birthday;
  daysUntil: number;
};

export function BirthdayCard({ birthday, daysUntil }: Props) {
  return (
    <PaperCard pinned backgroundColor="#FFF1CD" style={styles.card}>
      <Text style={styles.overline}>Upcoming</Text>
      <Text style={styles.heading}>Birthday!</Text>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="cake-variant-outline" size={44} color={colors.coral} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{birthday.name} turns 8!</Text>
          <Text style={styles.date}>May 16 (Sat)</Text>
        </View>
      </View>
      <Text style={styles.days}>{daysUntil} days to go!</Text>
      <Text style={styles.note}>Don't forget his favorite cake.</Text>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: '#E3BF5E',
    borderRadius: 36,
    borderWidth: 3,
    height: 72,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 72,
  },
  card: {
    flex: 1,
    minWidth: 0,
  },
  copy: {
    flex: 1,
  },
  date: {
    color: colors.coral,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
  },
  days: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9CD7D',
    color: colors.ink,
    fontFamily: fonts.label,
    fontSize: 17,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    transform: [{ rotate: '-2deg' }],
  },
  heading: {
    color: colors.coral,
    fontFamily: fonts.script,
    fontSize: 34,
    lineHeight: 36,
    textAlign: 'center',
  },
  name: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '800',
  },
  note: {
    color: colors.ink,
    fontFamily: fonts.label,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  overline: {
    color: colors.coral,
    fontFamily: fonts.script,
    fontSize: 24,
    lineHeight: 24,
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
});
