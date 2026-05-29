import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, spacing } from '../theme';

type Props = {
  message: string | null;
  onDismiss: () => void;
};

export function FeedbackBanner({ message, onDismiss }: Props) {
  if (!message) {
    return null;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.sage,
    borderRadius: 14,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
});
