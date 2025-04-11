// Renk paletleri
export const palette = {
  // Ana renkler
  primary: {
    light: '#8ea1e1',
    main: '#7289da',
    dark: '#5a6cbd',
  },
  secondary: {
    light: '#b9bbbe',
    main: '#99aab5',
    dark: '#7a8891',
  },
  success: {
    light: '#57c997',
    main: '#43b581',
    dark: '#369167',
  },
  warning: {
    light: '#fbb43c',
    main: '#faa61a',
    dark: '#c88415',
  },
  error: {
    light: '#f26969',
    main: '#f04747',
    dark: '#c03939',
  },
  
  // Gri tonları
  gray: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#868e96',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
  
  // Discord renkleri
  discord: {
    blurple: '#7289da',
    greyple: '#99aab5',
    dark: '#2c2f33',
    darker: '#23272a',
  },
};

// Aydınlık tema renkleri
export const lightColors = {
  // Temel renkler
  primary: palette.primary.main,
  primaryLight: palette.primary.light,
  primaryDark: palette.primary.dark,
  secondary: palette.secondary.main,
  success: palette.success.main,
  warning: palette.warning.main,
  error: palette.error.main,
  
  // Arka plan renkleri
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    card: '#ffffff',
    input: '#f9f9f9',
  },
  
  // Metin renkleri
  text: {
    primary: palette.gray[900],
    secondary: palette.gray[700],
    disabled: palette.gray[500],
    hint: palette.gray[600],
  },
  
  // Sınır renkleri
  border: {
    light: palette.gray[200],
    main: palette.gray[300],
    dark: palette.gray[400],
  },
  
  // Durum renkleri
  status: {
    online: palette.success.main,
    idle: palette.warning.main,
    dnd: palette.error.main,
    offline: palette.gray[500],
  },
  
  // Diğer
  divider: palette.gray[200],
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Karanlık tema renkleri
export const darkColors = {
  // Temel renkler
  primary: palette.primary.main,
  primaryLight: palette.primary.light,
  primaryDark: palette.primary.dark,
  secondary: palette.secondary.main,
  success: palette.success.main,
  warning: palette.warning.main,
  error: palette.error.main,
  
  // Arka plan renkleri
  background: {
    default: palette.discord.darker,
    paper: palette.discord.dark,
    card: '#36393f',
    input: '#40444b',
  },
  
  // Metin renkleri
  text: {
    primary: '#ffffff',
    secondary: palette.gray[300],
    disabled: palette.gray[500],
    hint: palette.gray[400],
  },
  
  // Sınır renkleri
  border: {
    light: '#40444b',
    main: '#4f545c',
    dark: '#606670',
  },
  
  // Durum renkleri
  status: {
    online: palette.success.main,
    idle: palette.warning.main,
    dnd: palette.error.main,
    offline: palette.gray[500],
  },
  
  // Diğer
  divider: '#4f545c',
  shadow: 'rgba(0, 0, 0, 0.3)',
};
