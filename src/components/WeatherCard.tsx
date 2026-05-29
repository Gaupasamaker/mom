import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, fonts, spacing } from '../theme';
import type { WeatherForecast } from '../types';
import { PaperCard } from './PaperCard';

type Props = {
  forecast?: WeatherForecast | null;
  cityLabel?: string;
  onRefresh?: () => void;
};

const recommendationFor = (forecast?: WeatherForecast | null) => {
  if (!forecast || forecast.unavailable) {
    return {
      title: 'Weather unavailable',
      message: "I can't check the sky right now. Try again in a bit.",
      icon: 'weather-cloudy-alert',
    };
  }
  if (forecast.rainExpectedLaterToday) {
    return {
      title: 'Rain later today',
      message: 'Take your umbrella before leaving.',
      icon: 'umbrella',
    };
  }
  if (forecast.hotDayExpected) {
    return {
      title: 'Warm day ahead',
      message: "Take water if you're going out.",
      icon: 'water-outline',
    };
  }
  if (forecast.coldDayExpected) {
    return {
      title: 'Chilly start',
      message: 'Take a jacket, just in case.',
      icon: 'coat-rack',
    };
  }

  return {
    title: forecast.currentConditionLabel,
    message: 'The sky looks manageable for now.',
    icon: forecast.currentConditionIcon ?? 'weather-partly-cloudy',
  };
};

export function WeatherCard({ forecast, cityLabel, onRefresh }: Props) {
  const recommendation = recommendationFor(forecast);
  const temperature = typeof forecast?.currentTemperature === 'number' ? `${Math.round(forecast.currentTemperature)} C` : undefined;
  const place = forecast ? [forecast.cityName, forecast.admin1, forecast.country].filter(Boolean).join(', ') : cityLabel;

  return (
    <PaperCard backgroundColor="#DDEDEA" tapeColor={colors.beige} style={styles.card}>
      <View style={styles.row}>
        <MaterialCommunityIcons
          name={(forecast?.currentConditionIcon ?? 'weather-partly-cloudy') as never}
          size={48}
          color={colors.blueDeep}
        />
        <View style={styles.textWrap}>
          {place ? <Text style={styles.place}>{place}</Text> : null}
          <Text style={styles.text}>{recommendation.title}</Text>
          <Text style={styles.script}>{recommendation.message}</Text>
          {temperature ? (
            <Text style={styles.meta}>
              {temperature} - {forecast?.currentConditionLabel}
            </Text>
          ) : null}
          {forecast?.stale ? <Text style={styles.meta}>Using saved weather for now.</Text> : null}
        </View>
        <MaterialCommunityIcons name={recommendation.icon as never} size={48} color={colors.blueDeep} onPress={onRefresh} />
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  meta: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  place: {
    color: colors.coralDark,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    marginBottom: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  script: {
    color: colors.blueDeep,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
  },
  text: {
    color: colors.ink,
    fontFamily: fonts.label,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  textWrap: {
    flex: 1,
  },
});
