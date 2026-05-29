import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, fonts, spacing } from '../theme';
import type { Reminder } from '../types';
import { PaperCard } from './PaperCard';
import { TapeLabel } from './TapeLabel';

type Props = {
  reminders: Array<Pick<Reminder, 'id' | 'title'>>;
};

export function ReminderCard({ reminders }: Props) {
  return (
    <View style={styles.wrap}>
      <TapeLabel label="Little Reminders" color={colors.sage} />
      <PaperCard backgroundColor="#E8F1E6" style={styles.card}>
        {reminders.map((reminder, index) => (
          <View key={reminder.id} style={styles.row}>
            <View style={[styles.dot, index === 1 && styles.dotRed]} />
            <Text style={styles.item}>{reminder.title}</Text>
            <Feather name={index === 0 ? 'sun' : index === 1 ? 'heart' : 'book-open'} size={18} color={colors.sageDark} />
          </View>
        ))}
        <Text style={styles.footer}>You're doing great.</Text>
      </PaperCard>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: spacing.lg,
  },
  dot: {
    backgroundColor: colors.sageDark,
    borderRadius: 4,
    height: 7,
    marginRight: spacing.sm,
    width: 7,
  },
  dotRed: {
    backgroundColor: colors.coral,
  },
  footer: {
    color: colors.blueDeep,
    fontFamily: fonts.script,
    fontSize: 22,
    lineHeight: 28,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  item: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 32,
  },
  wrap: {
    flex: 1,
    minWidth: 0,
  },
});
