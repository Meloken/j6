import { lightColors, darkColors } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { createTypography } from './typography';

// Aydınlık tema
export const lightTheme = {
  colors: lightColors,
  spacing,
  borderRadius,
  shadows,
  typography: createTypography(lightColors),
  isDark: false,
};

// Karanlık tema
export const darkTheme = {
  colors: darkColors,
  spacing,
  borderRadius,
  shadows,
  typography: createTypography(darkColors),
  isDark: true,
};

// Varsayılan tema
export default lightTheme;
