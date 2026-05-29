import { Platform } from 'react-native';

export const colors = {
  cream: '#F8EEDB',
  warmCream: '#FFF7E8',
  paper: '#FFF9EC',
  paperDeep: '#F4E5C7',
  beige: '#E8D3AA',
  cork: '#D8B88A',
  coral: '#C75645',
  coralDark: '#9F3E34',
  sage: '#86A58B',
  sageDark: '#557962',
  blue: '#9BC6C7',
  blueDeep: '#5D8F92',
  mustard: '#D7A642',
  teal: '#A6D4C6',
  ink: '#352B25',
  mutedInk: '#6F6154',
  line: '#D8BFA0',
  white: '#FFFFFF',
  shadow: '#6E4B2A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  paper: 10,
  note: 8,
  button: 20,
  round: 999,
};

export const fonts = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
  script: Platform.select({ ios: 'Snell Roundhand', android: 'casual', default: 'Georgia' }),
  body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'system' }),
  label: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
};

export const shadows = {
  paper: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  floating: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
  },
};
