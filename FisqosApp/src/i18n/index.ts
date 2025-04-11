import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

// Dil dosyaları
import en from './locales/en';
import tr from './locales/tr';

// Desteklenen diller
export const LANGUAGES: { [key: string]: { name: string; code: string; translation: any } } = {
  en: {
    name: 'English',
    code: 'en',
    translation: en,
  },
  tr: {
    name: 'Türkçe',
    code: 'tr',
    translation: tr,
  },
};

// i18n örneği oluşturma
const i18n = new I18n({
  en: en,
  tr: tr,
});

// Varsayılan dil
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Cihaz dilini alma
const getDeviceLocale = (): string => {
  let locale = 'en';

  if (Platform.OS === 'ios') {
    const deviceLocale =
      NativeModules.SettingsManager?.settings?.AppleLocale ||
      NativeModules.SettingsManager?.settings?.AppleLanguages[0] ||
      'en';
    locale = deviceLocale.slice(0, 2);
  } else if (Platform.OS === 'android') {
    const deviceLocale = NativeModules.I18nManager?.localeIdentifier || 'en';
    locale = deviceLocale.slice(0, 2);
  }

  // Desteklenen dil kontrolü
  return LANGUAGES[locale] ? locale : 'en';
};

// Dil yükleme
export const loadLocale = async (): Promise<string> => {
  try {
    // AsyncStorage'dan dil tercihini al
    const storedLocale = await AsyncStorage.getItem('user_locale');

    // Dil tercihini ayarla
    const locale = storedLocale || getDeviceLocale();
    i18n.locale = locale;

    return locale;
  } catch (error) {
    console.error('Failed to load locale', error);
    i18n.locale = 'en';
    return 'en';
  }
};

// Dil değiştirme
export const changeLocale = async (locale: string): Promise<void> => {
  try {
    // Desteklenen dil kontrolü
    if (!LANGUAGES[locale]) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    // Dil tercihini kaydet
    await AsyncStorage.setItem('user_locale', locale);

    // Dil tercihini ayarla
    i18n.locale = locale;
  } catch (error) {
    console.error('Failed to change locale', error);
  }
};

// Dil hook'u için yardımcı fonksiyonlar
export const getCurrentLocale = (): string => i18n.locale;
export const getLocales = () => Object.values(LANGUAGES);

// i18n örneğini dışa aktar
export default i18n;
