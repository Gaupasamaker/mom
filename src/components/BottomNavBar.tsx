import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, fonts, shadows, spacing } from '../theme';
import { t } from '../i18n';
import type { AppLanguage } from '../types';

export type TabKey = 'home' | 'calendar' | 'lists' | 'family' | 'settings';

type Props = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  onMomCheckPress: () => void;
  language: AppLanguage;
};

const tabs: Array<{ key: TabKey; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar' },
  { key: 'lists', label: 'Lists', icon: 'clipboard' },
  { key: 'family', label: 'Family', icon: 'users' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

export function BottomNavBar({ activeTab, onTabPress, onMomCheckPress, language }: Props) {
  const openMomCheck = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMomCheckPress();
  };

  return (
    <View style={[styles.nav, shadows.paper]}>
      {tabs.slice(0, 2).map((tab) => (
        <NavItem key={tab.key} tab={tab} active={activeTab === tab.key} onPress={() => onTabPress(tab.key)} language={language} />
      ))}
      <Pressable accessibilityRole="button" accessibilityLabel={t(language, 'nav.momCheck')} onPress={openMomCheck} style={styles.heartButton}>
        <Ionicons name="heart" size={34} color={colors.warmCream} />
      </Pressable>
      {tabs.slice(2).map((tab) => (
        <NavItem key={tab.key} tab={tab} active={activeTab === tab.key} onPress={() => onTabPress(tab.key)} language={language} />
      ))}
    </View>
  );
}

function NavItem({
  tab,
  active,
  onPress,
  language,
}: {
  tab: { key: TabKey; label: string; icon: keyof typeof Feather.glyphMap };
  active: boolean;
  onPress: () => void;
  language: AppLanguage;
}) {
  const labelKey = `nav.${tab.key}` as Parameters<typeof t>[1];
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={styles.item}>
      <Feather name={tab.icon} size={23} color={active ? colors.coral : colors.mutedInk} />
      <Text style={[styles.itemLabel, active && styles.activeLabel]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
        {t(language, labelKey)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeLabel: {
    color: colors.coral,
    fontWeight: '700',
  },
  heartButton: {
    alignItems: 'center',
    backgroundColor: colors.sage,
    borderColor: colors.warmCream,
    borderRadius: 36,
    borderWidth: 6,
    bottom: 16,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minWidth: 0,
  },
  itemLabel: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  nav: {
    alignItems: 'center',
    backgroundColor: '#F2E2C4',
    borderColor: 'rgba(93, 72, 50, 0.13)',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 86,
    paddingBottom: 12,
    paddingHorizontal: spacing.md,
  },
});
