import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { MomCTAButton } from '../components/MomCTAButton';
import { PaperCard } from '../components/PaperCard';
import { PaperTexture } from '../components/PaperTexture';
import { colors, fonts, spacing } from '../theme';
import type { MomPersonality, ReminderInterest } from '../types';

type Props = {
  onComplete: (personality: MomPersonality, interests: ReminderInterest[]) => void;
};

const personalities: Array<{ value: MomPersonality; label: string; note: string }> = [
  { value: 'sweet', label: 'Sweet Mom', note: "Soft nudges and you're-loved energy." },
  { value: 'funny', label: 'Funny Mom', note: 'Caring reminders with a tiny wink.' },
  { value: 'strict', label: 'Strict Mom', note: 'Clear, firm, no procrastinating.' },
  { value: 'minimal', label: 'Minimal Mom', note: 'Just the useful part.' },
];

const interests: Array<{ value: ReminderInterest; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { value: 'weather', label: 'Weather', icon: 'cloud-rain' },
  { value: 'birthdays', label: 'Birthdays', icon: 'gift' },
  { value: 'calendar', label: 'Appointments', icon: 'calendar' },
  { value: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { value: 'family', label: 'Family', icon: 'users' },
  { value: 'routines', label: 'Routines', icon: 'repeat' },
];

export function OnboardingScreen({ onComplete }: Props) {
  const [personality, setPersonality] = useState<MomPersonality>('sweet');
  const [selected, setSelected] = useState<ReminderInterest[]>([
    'weather',
    'birthdays',
    'calendar',
    'shopping',
    'family',
  ]);

  const toggleInterest = (interest: ReminderInterest) => {
    setSelected((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
    );
  };

  return (
    <View style={styles.screen}>
      <PaperTexture />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoRow}>
          <Ionicons name="heart-outline" size={30} color={colors.coral} />
          <Text style={styles.logo}>MOM</Text>
          <Ionicons name="leaf-outline" size={30} color={colors.sageDark} />
        </View>

        <PaperCard pinned tapeColor={colors.beige} style={styles.welcomeCard}>
          <Text style={styles.script}>I will help you remember the things that matter.</Text>
          <Text style={styles.body}>I've got you. Because someone has to remind you.</Text>
        </PaperCard>

        <Text style={styles.sectionTitle}>Choose MOM's tone</Text>
        <View style={styles.optionGrid}>
          {personalities.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              onPress={() => setPersonality(item.value)}
              style={[styles.personalityCard, personality === item.value && styles.selectedCard]}
            >
              <Text style={styles.optionTitle}>{item.label}</Text>
              <Text style={styles.optionNote}>{item.note}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>What should MOM watch?</Text>
        <View style={styles.chipGrid}>
          {interests.map((interest) => {
            const isSelected = selected.includes(interest.value);
            return (
              <Pressable
                key={interest.value}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                onPress={() => toggleInterest(interest.value)}
                style={[styles.chip, isSelected && styles.selectedChip]}
              >
                <Feather name={interest.icon} size={18} color={isSelected ? colors.white : colors.coralDark} />
                <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>{interest.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <MomCTAButton label="Start my MOM board" onPress={() => onComplete(personality, selected)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 25,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chipText: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: 56,
  },
  logo: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 62,
    fontWeight: '900',
    letterSpacing: 0,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  optionGrid: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionNote: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  optionTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  personalityCard: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
  },
  screen: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  script: {
    color: colors.blueDeep,
    fontFamily: fonts.script,
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  selectedCard: {
    backgroundColor: '#FCE2CC',
    borderColor: colors.coral,
  },
  selectedChip: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  selectedChipText: {
    color: colors.white,
  },
  welcomeCard: {
    marginBottom: spacing.lg,
  },
});
