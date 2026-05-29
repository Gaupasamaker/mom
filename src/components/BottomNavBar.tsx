import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, fonts, shadows, spacing } from '../theme';

export type TabKey = 'home' | 'calendar' | 'lists' | 'family';

type Props = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  onMomCheckPress: () => void;
};

const tabs: Array<{ key: TabKey; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar' },
  { key: 'lists', label: 'Lists', icon: 'clipboard' },
  { key: 'family', label: 'Family', icon: 'users' },
];

export function BottomNavBar({ activeTab, onTabPress, onMomCheckPress }: Props) {
  const openMomCheck = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMomCheckPress();
  };

  return (
    <View style={[styles.nav, shadows.paper]}>
      {tabs.slice(0, 2).map((tab) => (
        <NavItem key={tab.key} tab={tab} active={activeTab === tab.key} onPress={() => onTabPress(tab.key)} />
      ))}
      <Pressable accessibilityRole="button" accessibilityLabel="MOM Check" onPress={openMomCheck} style={styles.heartButton}>
        <Ionicons name="heart" size={34} color={colors.warmCream} />
      </Pressable>
      {tabs.slice(2).map((tab) => (
        <NavItem key={tab.key} tab={tab} active={activeTab === tab.key} onPress={() => onTabPress(tab.key)} />
      ))}
    </View>
  );
}

function NavItem({
  tab,
  active,
  onPress,
}: {
  tab: { key: TabKey; label: string; icon: keyof typeof Feather.glyphMap };
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={styles.item}>
      <Feather name={tab.icon} size={24} color={active ? colors.coral : colors.mutedInk} />
      <Text style={[styles.itemLabel, active && styles.activeLabel]}>{tab.label}</Text>
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
    borderWidth: 7,
    bottom: 18,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  itemLabel: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
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
