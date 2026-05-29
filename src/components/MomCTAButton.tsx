import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, fonts, radii, shadows, spacing } from '../theme';

type Props = {
  onPress: () => void;
  label?: string;
};

export function MomCTAButton({ onPress, label = 'What am I forgetting?' }: Props) {
  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [styles.button, shadows.floating, pressed && styles.pressed]}
    >
      <View style={styles.stitch} />
      <Ionicons name="heart" size={32} color={colors.warmCream} />
      <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.label}>
        {label}
      </Text>
      <View style={styles.cornerTape} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.coral,
    borderColor: colors.coralDark,
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginVertical: spacing.lg,
    minHeight: 68,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
  cornerTape: {
    backgroundColor: colors.beige,
    height: 21,
    opacity: 0.82,
    position: 'absolute',
    right: 12,
    top: -3,
    transform: [{ rotate: '18deg' }],
    width: 58,
  },
  label: {
    color: colors.white,
    flexShrink: 1,
    fontFamily: fonts.script,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  pressed: {
    transform: [{ translateY: 2 }],
  },
  stitch: {
    borderColor: 'rgba(255, 247, 232, 0.82)',
    borderRadius: radii.button - 5,
    borderStyle: 'dashed',
    borderWidth: 1,
    bottom: 7,
    left: 7,
    position: 'absolute',
    right: 7,
    top: 7,
  },
});
