import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, fonts, spacing } from '../theme';
import { t } from '../i18n';
import { WeatherCodeService } from '../services/WeatherCodeService';
import type { AppLanguage, WeatherForecast } from '../types';
import { PaperCard } from './PaperCard';

type Props = {
  forecast?: WeatherForecast | null;
  cityLabel?: string;
  onRefresh?: () => void;
  language: AppLanguage;
};

const recommendationFor = (language: AppLanguage, forecast?: WeatherForecast | null) => {
  if (!forecast || forecast.unavailable) {
    return {
      title: t(language, 'weather.unavailable.title'),
      message: t(language, 'weather.unavailable.message'),
      icon: 'weather-cloudy-alert',
    };
  }
  if (forecast.rainExpectedLaterToday) {
    return {
      title: t(language, 'weather.rain.title'),
      message: t(language, 'weather.rain.message'),
      icon: 'umbrella',
    };
  }
  if (forecast.hotDayExpected) {
    return {
      title: t(language, 'weather.hot.title'),
      message: t(language, 'weather.hot.message'),
      icon: 'water-outline',
    };
  }
  if (forecast.coldDayExpected) {
    return {
      title: t(language, 'weather.cold.title'),
      message: t(language, 'weather.cold.message'),
      icon: 'coat-rack',
    };
  }

  return {
    title: forecast.currentConditionLabel,
    message: t(language, 'weather.manageable'),
    icon: forecast.currentConditionIcon ?? 'weather-partly-cloudy',
  };
};

export function WeatherCard({ forecast, cityLabel, onRefresh, language }: Props) {
  const recommendation = recommendationFor(language, forecast);
  const temperature = typeof forecast?.currentTemperature === 'number' ? `${Math.round(forecast.currentTemperature)} C` : undefined;
  const place = forecast ? [forecast.cityName, forecast.admin1, forecast.country].filter(Boolean).join(', ') : cityLabel;
  const conditionLabel = forecast ? WeatherCodeService.fromCode(forecast.currentConditionCode, language).label : undefined;

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
              {temperature} - {conditionLabel ?? forecast?.currentConditionLabel}
            </Text>
          ) : null}
          {forecast?.stale ? <Text style={styles.meta}>{t(language, 'weather.saved')}</Text> : null}
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
