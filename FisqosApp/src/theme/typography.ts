// Yazı tipi aileleri
export const fontFamily = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

// Yazı tipi ağırlıkları
export const fontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// Yazı tipi boyutları
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
};

// Satır yükseklikleri
export const lineHeight = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
  h1: 36,
  h2: 32,
  h3: 28,
  h4: 26,
  h5: 24,
  h6: 20,
};

// Yazı tipi stilleri
export const createTypography = (color: any) => ({
  h1: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.h1,
    lineHeight: lineHeight.h1,
    color: color.text.primary,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.h2,
    lineHeight: lineHeight.h2,
    color: color.text.primary,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.h3,
    lineHeight: lineHeight.h3,
    color: color.text.primary,
  },
  h4: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.h4,
    lineHeight: lineHeight.h4,
    color: color.text.primary,
  },
  h5: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.h5,
    lineHeight: lineHeight.h5,
    color: color.text.primary,
  },
  h6: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.h6,
    lineHeight: lineHeight.h6,
    color: color.text.primary,
  },
  body1: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    color: color.text.primary,
  },
  body2: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: color.text.primary,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: color.text.secondary,
  },
  button: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: color.text.primary,
    textTransform: 'none',
  },
});
