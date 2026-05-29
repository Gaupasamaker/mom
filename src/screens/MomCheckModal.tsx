import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { PaperCard } from '../components/PaperCard';
import { PaperTexture } from '../components/PaperTexture';
import { t } from '../i18n';
import { colors, fonts, spacing } from '../theme';
import type { AppLanguage, MomCheckPriority, MomCheckResult, MomInsight } from '../types';

type Props = {
  visible: boolean;
  result: MomCheckResult;
  onClose: () => void;
  language: AppLanguage;
};

const iconFor = (insight: MomInsight) => {
  if (insight.type === 'weather') return 'umbrella-outline';
  if (insight.type === 'birthday') return 'cake-variant-outline';
  if (insight.type === 'medical-prep') return 'medical-bag';
  if (insight.type === 'shopping') return 'basket-outline';
  return 'calendar-heart';
};

const prioritySections: Array<{ key: MomCheckPriority; labelKey: Parameters<typeof t>[1]; captionKey: Parameters<typeof t>[1] }> = [
  { key: 'urgent', labelKey: 'momCheck.urgent', captionKey: 'momCheck.urgentCaption' },
  { key: 'important', labelKey: 'momCheck.important', captionKey: 'momCheck.importantCaption' },
  { key: 'later', labelKey: 'momCheck.later', captionKey: 'momCheck.laterCaption' },
];

export function MomCheckModal({ visible, result, onClose, language }: Props) {
  const grouped = result.groups ?? {
    urgent: result.insights.filter((insight) => insight.priority === 'high'),
    important: result.insights.filter((insight) => insight.priority === 'medium'),
    later: result.insights.filter((insight) => insight.priority === 'low'),
  };
  let cardIndex = 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.screen}>
        <PaperTexture />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t(language, 'momCheck.title')}</Text>
              <Text style={styles.subtitle}>{t(language, 'momCheck.subtitle')}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t(language, 'momCheck.close')} onPress={onClose} style={styles.close}>
              <Feather name="x" size={22} color={colors.coralDark} />
            </Pressable>
          </View>

          <PaperCard backgroundColor="#FFF1CD" tapeColor={colors.beige} style={styles.summaryCard}>
            <Text style={styles.summary}>{result.summary}</Text>
          </PaperCard>

          {result.insights.length === 0 ? (
            <PaperCard backgroundColor={colors.paper} style={styles.insight}>
              <Text style={styles.emptyTitle}>{t(language, 'momCheck.emptyTitle')}</Text>
              <Text style={styles.message}>{t(language, 'momCheck.emptyMessage')}</Text>
            </PaperCard>
          ) : null}

          {prioritySections.map((section) => {
            const insights = grouped[section.key];
            if (!insights.length) return null;

            return (
              <View key={section.key} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t(language, section.labelKey)}</Text>
                  <Text style={styles.sectionCaption}>{t(language, section.captionKey)}</Text>
                </View>
                {insights.map((insight) => {
                  cardIndex += 1;
                  return (
                    <PaperCard
                      key={insight.id}
                      pinned={cardIndex === 1}
                      backgroundColor={section.key === 'urgent' ? '#FFF1CD' : section.key === 'important' ? colors.paper : '#E8F1E6'}
                      style={styles.insight}
                    >
                      <View style={styles.insightRow}>
                        <View style={[styles.priority, styles[section.key]]}>
                          <Text style={styles.priorityText}>{cardIndex}</Text>
                        </View>
                        <View style={styles.icon}>
                          <MaterialCommunityIcons name={iconFor(insight)} size={29} color={colors.coral} />
                        </View>
                        <View style={styles.copy}>
                          {insight.categoryLabel ? <Text style={styles.category}>{insight.categoryLabel}</Text> : null}
                          <Text style={styles.insightTitle}>{insight.title}</Text>
                          <Text style={styles.message}>{insight.message}</Text>
                          {insight.momNote ? <Text style={styles.momNote}>{insight.momNote}</Text> : null}
                        </View>
                      </View>
                    </PaperCard>
                  );
                })}
              </View>
            );
          })}

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.doneButton}>
            <Text style={styles.doneText}>{t(language, 'momCheck.done')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  close: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 36,
    paddingTop: 58,
  },
  copy: {
    flex: 1,
  },
  doneButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.coral,
    borderRadius: 18,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  doneText: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyTitle: {
    color: colors.coralDark,
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  category: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  high: {
    backgroundColor: colors.coral,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#F8DE9F',
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  insight: {
    marginBottom: spacing.md,
  },
  insightRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  insightTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  low: {
    backgroundColor: colors.sage,
  },
  medium: {
    backgroundColor: colors.mustard,
  },
  important: {
    backgroundColor: colors.mustard,
  },
  message: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  momNote: {
    color: colors.blueDeep,
    fontFamily: fonts.body,
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  priority: {
    alignItems: 'center',
    borderRadius: 13,
    height: 28,
    justifyContent: 'center',
    marginTop: 9,
    width: 28,
  },
  priorityText: {
    color: colors.white,
    fontFamily: fonts.label,
    fontSize: 13,
    fontWeight: '900',
  },
  screen: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  subtitle: {
    color: colors.blueDeep,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  summary: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  later: {
    backgroundColor: colors.sage,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionCaption: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: '900',
  },
  urgent: {
    backgroundColor: colors.coral,
  },
});
