import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, fonts, spacing } from '../theme';
import type { ShoppingItem } from '../types';
import { PaperCard } from './PaperCard';
import { TapeLabel } from './TapeLabel';

type Props = {
  title: string;
  items: ShoppingItem[];
  variant?: 'yellow' | 'mint';
  onToggleItem?: (id: string) => void;
};

export function ChecklistCard({ title, items, variant = 'yellow', onToggleItem }: Props) {
  const isMint = variant === 'mint';

  return (
    <View style={styles.wrap}>
      <TapeLabel label={title} color={isMint ? colors.sage : '#D8B069'} tilt={isMint ? -3 : 2} />
      <PaperCard backgroundColor={isMint ? '#E5EFE4' : '#FFF0BF'} style={styles.card}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow} onTouchEnd={() => onToggleItem?.(item.id)}>
            <View style={styles.checkbox}>
              {item.checked ? <Feather name="check" size={16} color={colors.coral} /> : null}
            </View>
            <Text style={styles.item}>{item.label}</Text>
          </View>
        ))}
        <View style={styles.iconRow}>
          <MaterialCommunityIcons
            name={isMint ? 'book-open-page-variant-outline' : 'basket-outline'}
            size={36}
            color={isMint ? colors.blueDeep : colors.sageDark}
          />
        </View>
      </PaperCard>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: spacing.lg,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.mutedInk,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 18,
  },
  iconRow: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  item: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 27,
  },
  wrap: {
    flex: 1,
    minWidth: 0,
  },
});
