import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '../theme';

type Props = {
  label?: string;
  color?: string;
  tilt?: number;
};

export function TapeLabel({ label, color = colors.blue, tilt = -2 }: Props) {
  return (
    <View style={[styles.tape, { backgroundColor: color, transform: [{ rotate: `${tilt}deg` }] }]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tape: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.note,
    marginBottom: -spacing.sm,
    minHeight: 28,
    minWidth: 112,
    opacity: 0.9,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    zIndex: 3,
  },
  label: {
    color: colors.white,
    fontFamily: fonts.script,
    fontSize: 22,
    lineHeight: 24,
  },
});
