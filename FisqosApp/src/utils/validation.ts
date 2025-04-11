/**
 * Form doğrulama yardımcı fonksiyonları
 */

/**
 * E-posta doğrulama
 * @param email E-posta adresi
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Şifre doğrulama (en az 6 karakter, en az 1 büyük harf, 1 küçük harf ve 1 rakam)
 * @param password Şifre
 */
export const isStrongPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

/**
 * Kullanıcı adı doğrulama (3-20 karakter, harf, rakam, alt çizgi ve nokta içerebilir)
 * @param username Kullanıcı adı
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * URL doğrulama
 * @param url URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Boş değer kontrolü
 * @param value Değer
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
};

/**
 * Minimum uzunluk kontrolü
 * @param value Değer
 * @param minLength Minimum uzunluk
 */
export const minLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Maksimum uzunluk kontrolü
 * @param value Değer
 * @param maxLength Maksimum uzunluk
 */
export const maxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * İki değerin eşitlik kontrolü
 * @param value1 Birinci değer
 * @param value2 İkinci değer
 */
export const isEqual = (value1: any, value2: any): boolean => {
  return value1 === value2;
};

/**
 * Sayı kontrolü
 * @param value Değer
 */
export const isNumber = (value: any): boolean => {
  return !isNaN(Number(value));
};

/**
 * Tam sayı kontrolü
 * @param value Değer
 */
export const isInteger = (value: any): boolean => {
  return Number.isInteger(Number(value));
};

/**
 * Pozitif sayı kontrolü
 * @param value Değer
 */
export const isPositive = (value: number): boolean => {
  return value > 0;
};

/**
 * Negatif sayı kontrolü
 * @param value Değer
 */
export const isNegative = (value: number): boolean => {
  return value < 0;
};

/**
 * Aralık kontrolü
 * @param value Değer
 * @param min Minimum değer
 * @param max Maksimum değer
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};
