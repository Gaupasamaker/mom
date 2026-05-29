import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, spacing } from '../theme';
import { t } from '../i18n';
import type { AppLanguage } from '../types';
import { PaperCard } from './PaperCard';

type Props = {
  language: AppLanguage;
};

export function GreetingCard({ language }: Props) {
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'greeting.morning' : hour < 18 ? 'greeting.afternoon' : 'greeting.evening';

  return (
    <PaperCard pinned tapeColor={colors.beige} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.portrait}>
          <Ionicons name="person" size={54} color={colors.coral} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>{t(language, greetingKey)},</Text>
          <Text style={styles.name}>{t(language, 'greeting.name')}</Text>
          <Text style={styles.body}>{t(language, 'greeting.body')}</Text>
        </View>
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    marginBottom: spacing.md,
  },
  copy: {
    flex: 1,
  },
  kicker: {
    color: colors.ink,
    fontFamily: fonts.script,
    fontSize: 25,
    lineHeight: 29,
  },
  name: {
    color: colors.blueDeep,
    fontFamily: fonts.script,
    fontSize: 34,
    lineHeight: 39,
  },
  portrait: {
    alignItems: 'center',
    backgroundColor: '#F8DE9F',
    borderColor: colors.paper,
    borderRadius: 45,
    borderWidth: 5,
    height: 82,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 82,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
