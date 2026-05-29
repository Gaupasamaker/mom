import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme';
import { EmptyStateTemplateService, EmptyStateKind } from '../services/EmptyStateTemplateService';
import type { AppLanguage, MomPersonality } from '../types';
import { PaperCard } from './PaperCard';

type Props = {
  title?: string;
  message?: string;
  kind?: EmptyStateKind;
  tone?: MomPersonality;
  language: AppLanguage;
};

export function EmptyState({ title, message, kind, tone, language }: Props) {
  const generated = kind ? EmptyStateTemplateService.get(kind, tone, language) : null;
  const resolvedTitle = title ?? generated?.title ?? (language === 'es' ? 'Aún no hay nada' : 'Nothing here yet');
  const resolvedMessage = message ?? generated?.message ?? (language === 'es' ? 'Añade una nota cuando quieras.' : 'Add a note when you are ready.');

  return (
    <PaperCard backgroundColor={colors.paper} style={styles.card}>
      <View>
        <Text style={styles.title}>{resolvedTitle}</Text>
        <Text style={styles.message}>{resolvedMessage}</Text>
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  message: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  title: {
    color: colors.coralDark,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
});
