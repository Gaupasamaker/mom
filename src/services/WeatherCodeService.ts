import type { WeatherCondition } from '../types';

type WeatherCodeInfo = {
  label: string;
  icon: string;
  condition: WeatherCondition;
};

const info = (label: string, icon: string, condition: WeatherCondition): WeatherCodeInfo => ({
  label,
  icon,
  condition,
});

const codeMap = new Map<number, WeatherCodeInfo>([
  [0, info('Clear', 'weather-sunny', 'clear')],
  [1, info('Partly cloudy', 'weather-partly-cloudy', 'partly-cloudy')],
  [2, info('Partly cloudy', 'weather-partly-cloudy', 'partly-cloudy')],
  [3, info('Cloudy', 'weather-cloudy', 'cloudy')],
  [45, info('Fog', 'weather-fog', 'fog')],
  [48, info('Fog', 'weather-fog', 'fog')],
  [51, info('Drizzle', 'weather-pouring', 'drizzle')],
  [53, info('Drizzle', 'weather-pouring', 'drizzle')],
  [55, info('Drizzle', 'weather-pouring', 'drizzle')],
  [56, info('Drizzle', 'weather-pouring', 'drizzle')],
  [57, info('Drizzle', 'weather-pouring', 'drizzle')],
  [61, info('Rain', 'weather-rainy', 'rain')],
  [63, info('Rain', 'weather-rainy', 'rain')],
  [65, info('Rain', 'weather-rainy', 'rain')],
  [66, info('Rain', 'weather-rainy', 'rain')],
  [67, info('Rain', 'weather-rainy', 'rain')],
  [71, info('Snow', 'weather-snowy', 'snow')],
  [73, info('Snow', 'weather-snowy', 'snow')],
  [75, info('Snow', 'weather-snowy-heavy', 'snow')],
  [77, info('Snow', 'weather-snowy', 'snow')],
  [80, info('Rain', 'weather-rainy', 'rain')],
  [81, info('Rain', 'weather-rainy', 'rain')],
  [82, info('Rain', 'weather-pouring', 'rain')],
  [85, info('Snow', 'weather-snowy', 'snow')],
  [86, info('Snow', 'weather-snowy-heavy', 'snow')],
  [95, info('Thunderstorm', 'weather-lightning-rainy', 'thunderstorm')],
  [96, info('Thunderstorm', 'weather-lightning-rainy', 'thunderstorm')],
  [99, info('Thunderstorm', 'weather-lightning-rainy', 'thunderstorm')],
]);

const fallback = info('Weather unavailable', 'weather-cloudy-alert', 'unknown');

export const WeatherCodeService = {
  fromCode(code?: number | null): WeatherCodeInfo {
    if (typeof code !== 'number') {
      return fallback;
    }

    return codeMap.get(code) ?? fallback;
  },

  isRainCode(code?: number | null) {
    const condition = this.fromCode(code).condition;
    return condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm';
  },
};
