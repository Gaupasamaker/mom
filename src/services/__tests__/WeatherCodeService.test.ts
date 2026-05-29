import { describe, expect, it } from 'vitest';

import { WeatherCodeService } from '../WeatherCodeService';

describe('WeatherCodeService', () => {
  it('maps Open-Meteo weather codes to friendly labels and app icons', () => {
    expect(WeatherCodeService.fromCode(0)).toEqual({
      label: 'Clear',
      icon: 'weather-sunny',
      condition: 'clear',
    });
    expect(WeatherCodeService.fromCode(61)).toMatchObject({
      label: 'Rain',
      icon: 'weather-rainy',
      condition: 'rain',
    });
    expect(WeatherCodeService.fromCode(95)).toMatchObject({
      label: 'Thunderstorm',
      icon: 'weather-lightning-rainy',
      condition: 'thunderstorm',
    });
  });

  it('returns a safe unknown condition for unmapped codes', () => {
    expect(WeatherCodeService.fromCode(999)).toEqual({
      label: 'Weather unavailable',
      icon: 'weather-cloudy-alert',
      condition: 'unknown',
    });
  });
});
