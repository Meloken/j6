import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage için yardımcı fonksiyonlar
 */
export const storage = {
  /**
   * Veri kaydetme
   * @param key Anahtar
   * @param value Değer
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Storage set error:', e);
      throw e;
    }
  },

  /**
   * Veri okuma
   * @param key Anahtar
   * @param defaultValue Varsayılan değer
   */
  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        return defaultValue || null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue || null;
    }
  },

  /**
   * Veri silme
   * @param key Anahtar
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Storage remove error:', e);
      throw e;
    }
  },

  /**
   * Tüm verileri silme
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Storage clear error:', e);
      throw e;
    }
  },

  /**
   * Tüm anahtarları getirme
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (e) {
      console.error('Storage getAllKeys error:', e);
      return [];
    }
  },

  /**
   * Birden fazla veri kaydetme
   * @param items Anahtar-değer çiftleri
   */
  async multiSet(items: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(items);
    } catch (e) {
      console.error('Storage multiSet error:', e);
      throw e;
    }
  },

  /**
   * Birden fazla veri okuma
   * @param keys Anahtarlar
   */
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      const result = await AsyncStorage.multiGet(keys);
      return [...result];
    } catch (e) {
      console.error('Storage multiGet error:', e);
      return [];
    }
  },

  /**
   * Birden fazla veri silme
   * @param keys Anahtarlar
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      console.error('Storage multiRemove error:', e);
      throw e;
    }
  },
};
