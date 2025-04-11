import { Alert, Platform } from 'react-native';

/**
 * Hata türleri
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Hata bilgileri
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: any;
}

/**
 * Hata oluşturur
 * @param type Hata türü
 * @param message Hata mesajı
 * @param code Hata kodu
 * @param details Hata detayları
 * @returns Hata bilgileri
 */
export const createError = (
  type: ErrorType,
  message: string,
  code?: string | number,
  details?: any
): ErrorInfo => {
  return {
    type,
    message,
    code,
    details,
  };
};

/**
 * HTTP durum kodundan hata türünü belirler
 * @param statusCode HTTP durum kodu
 * @returns Hata türü
 */
export const getErrorTypeFromStatusCode = (statusCode: number): ErrorType => {
  if (statusCode === 0) {
    return ErrorType.NETWORK;
  } else if (statusCode === 401 || statusCode === 403) {
    return ErrorType.AUTH;
  } else if (statusCode === 404) {
    return ErrorType.NOT_FOUND;
  } else if (statusCode === 422) {
    return ErrorType.VALIDATION;
  } else if (statusCode >= 500) {
    return ErrorType.SERVER;
  } else {
    return ErrorType.UNKNOWN;
  }
};

/**
 * Hata mesajını kullanıcı dostu hale getirir
 * @param error Hata bilgileri
 * @returns Kullanıcı dostu hata mesajı
 */
export const getFriendlyErrorMessage = (error: ErrorInfo): string => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
    case ErrorType.SERVER:
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    case ErrorType.AUTH:
      return 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.';
    case ErrorType.VALIDATION:
      return error.message || 'Girdiğiniz bilgilerde hata var. Lütfen kontrol edin.';
    case ErrorType.PERMISSION:
      return 'Bu işlemi gerçekleştirmek için gerekli izinlere sahip değilsiniz.';
    case ErrorType.NOT_FOUND:
      return 'İstediğiniz içerik bulunamadı.';
    case ErrorType.TIMEOUT:
      return 'İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.';
    case ErrorType.UNKNOWN:
    default:
      return error.message || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
  }
};

/**
 * Hata mesajını gösterir
 * @param error Hata bilgileri
 * @param title Başlık
 */
export const showError = (error: ErrorInfo, title = 'Hata'): void => {
  const message = getFriendlyErrorMessage(error);
  
  Alert.alert(title, message, [{ text: 'Tamam' }]);
};

/**
 * Hata ayıklama bilgilerini konsola yazdırır
 * @param error Hata bilgileri
 * @param source Hata kaynağı
 */
export const logError = (error: ErrorInfo, source: string): void => {
  if (__DEV__) {
    console.error(`[${source}] Error:`, {
      type: error.type,
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }
};

/**
 * Hata raporlama servisi için hata bilgilerini hazırlar
 * @param error Hata bilgileri
 * @param source Hata kaynağı
 * @returns Hata raporu
 */
export const prepareErrorReport = (error: ErrorInfo, source: string): any => {
  return {
    type: error.type,
    message: error.message,
    code: error.code,
    details: error.details,
    source,
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
    platformVersion: Platform.Version,
    appVersion: '1.0.0', // TODO: Gerçek uygulama versiyonunu al
  };
};

/**
 * Hata raporlama servisine hata gönderir
 * @param error Hata bilgileri
 * @param source Hata kaynağı
 */
export const reportError = async (error: ErrorInfo, source: string): Promise<void> => {
  try {
    // Hata raporlama servisi entegrasyonu
    // Örnek: Sentry, Crashlytics, vb.
    const errorReport = prepareErrorReport(error, source);
    
    // TODO: Hata raporlama servisine gönder
    console.log('Error report:', errorReport);
  } catch (reportError) {
    console.error('Error reporting failed:', reportError);
  }
};
