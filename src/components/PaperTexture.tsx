import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  variant?: 'board' | 'paper';
};

export function PaperTexture({ variant = 'board' }: Props) {
  const fiberColor = variant === 'board' ? colors.cork : colors.line;

  return (
    <View style={styles.fill}>
      {Array.from({ length: 18 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.fiber,
            {
              backgroundColor: fiberColor,
              left: `${(index * 17) % 97}%`,
              top: `${(index * 29) % 91}%`,
              opacity: variant === 'board' ? 0.15 : 0.11,
              transform: [{ rotate: `${(index % 7) * 18 - 36}deg` }],
              width: 18 + (index % 4) * 9,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fiber: {
    height: 1,
    position: 'absolute',
  },
  fill: {
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
