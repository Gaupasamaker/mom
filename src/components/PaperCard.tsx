import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radii, shadows, spacing } from '../theme';
import { PaperTexture } from './PaperTexture';

type Props = {
  children: ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
  pinned?: boolean;
  tapeColor?: string;
};

export function PaperCard({ children, backgroundColor = colors.paper, style, pinned, tapeColor }: Props) {
  return (
    <View style={[styles.wrap, shadows.paper, { backgroundColor }, style]}>
      {tapeColor ? <View style={[styles.tape, { backgroundColor: tapeColor }]} /> : null}
      {pinned ? <View style={styles.pin} /> : null}
      <PaperTexture variant="paper" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderColor: 'rgba(116, 82, 47, 0.12)',
    borderWidth: 1,
    borderRadius: radii.paper,
    overflow: 'hidden',
    padding: spacing.lg,
    position: 'relative',
  },
  tape: {
    height: 20,
    left: 18,
    opacity: 0.55,
    position: 'absolute',
    top: -8,
    transform: [{ rotate: '-5deg' }],
    width: 86,
    zIndex: 4,
  },
  pin: {
    backgroundColor: colors.coral,
    borderColor: colors.coralDark,
    borderRadius: 8,
    borderWidth: 1,
    height: 16,
    position: 'absolute',
    right: 16,
    top: 12,
    width: 16,
    zIndex: 5,
  },
});
