/**
 * Tarih ve saat işlemleri için yardımcı fonksiyonlar
 */

/**
 * Tarih formatını yerelleştirir
 * @param date Tarih
 * @param locale Yerel
 * @returns Formatlanmış tarih
 */
export const formatDate = (date: Date | string, locale = 'tr-TR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Saat formatını yerelleştirir
 * @param date Tarih
 * @param locale Yerel
 * @returns Formatlanmış saat
 */
export const formatTime = (date: Date | string, locale = 'tr-TR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Tarih ve saat formatını yerelleştirir
 * @param date Tarih
 * @param locale Yerel
 * @returns Formatlanmış tarih ve saat
 */
export const formatDateTime = (date: Date | string, locale = 'tr-TR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Göreceli tarih formatını yerelleştirir
 * @param date Tarih
 * @param locale Yerel
 * @returns Göreceli tarih
 */
export const formatRelativeTime = (date: Date | string, locale = 'tr-TR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);

  // Yerelleştirilmiş zaman birimleri
  interface TimeUnit {
    second: { singular: string; plural: string };
    minute: { singular: string; plural: string };
    hour: { singular: string; plural: string };
    day: { singular: string; plural: string };
    month: { singular: string; plural: string };
    year: { singular: string; plural: string };
    ago: string;
    now: string;
  }

  const timeUnits: Record<string, TimeUnit> = {
    'tr-TR': {
      second: { singular: 'saniye', plural: 'saniye' },
      minute: { singular: 'dakika', plural: 'dakika' },
      hour: { singular: 'saat', plural: 'saat' },
      day: { singular: 'gün', plural: 'gün' },
      month: { singular: 'ay', plural: 'ay' },
      year: { singular: 'yıl', plural: 'yıl' },
      ago: 'önce',
      now: 'şimdi',
    },
    'en-US': {
      second: { singular: 'second', plural: 'seconds' },
      minute: { singular: 'minute', plural: 'minutes' },
      hour: { singular: 'hour', plural: 'hours' },
      day: { singular: 'day', plural: 'days' },
      month: { singular: 'month', plural: 'months' },
      year: { singular: 'year', plural: 'years' },
      ago: 'ago',
      now: 'just now',
    },
  };

  // Varsayılan yerel
  const units = timeUnits[locale] || timeUnits['en-US'];

  if (diffSec < 5) {
    return units.now;
  } else if (diffSec < 60) {
    return `${diffSec} ${diffSec === 1 ? units.second.singular : units.second.plural} ${units.ago}`;
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? units.minute.singular : units.minute.plural} ${units.ago}`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? units.hour.singular : units.hour.plural} ${units.ago}`;
  } else if (diffDay < 30) {
    return `${diffDay} ${diffDay === 1 ? units.day.singular : units.day.plural} ${units.ago}`;
  } else if (diffMonth < 12) {
    return `${diffMonth} ${diffMonth === 1 ? units.month.singular : units.month.plural} ${units.ago}`;
  } else {
    return `${diffYear} ${diffYear === 1 ? units.year.singular : units.year.plural} ${units.ago}`;
  }
};

/**
 * Mesaj tarihini formatlar
 * @param date Tarih
 * @param locale Yerel
 * @returns Formatlanmış mesaj tarihi
 */
export const formatMessageDate = (date: Date | string, locale = 'tr-TR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  // Bugün
  if (dateObj.toDateString() === now.toDateString()) {
    return formatTime(dateObj, locale);
  }

  // Dün
  if (dateObj.toDateString() === yesterday.toDateString()) {
    const yesterdayText = locale === 'tr-TR' ? 'Dün' : 'Yesterday';
    return `${yesterdayText} ${formatTime(dateObj, locale)}`;
  }

  // Bu hafta
  const diffDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return dateObj.toLocaleDateString(locale, { weekday: 'long' });
  }

  // Bu yıl
  if (dateObj.getFullYear() === now.getFullYear()) {
    return dateObj.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  }

  // Diğer
  return dateObj.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * İki tarih arasında gün farkını hesaplar
 * @param date1 Birinci tarih
 * @param date2 İkinci tarih
 * @returns Gün farkı
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  // Saat, dakika, saniye ve milisaniye bilgilerini sıfırla
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

  // Milisaniye cinsinden farkı gün cinsine çevir
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

/**
 * Tarih aynı gün mü kontrol eder
 * @param date1 Birinci tarih
 * @param date2 İkinci tarih
 * @returns Aynı gün mü?
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Tarih bugün mü kontrol eder
 * @param date Tarih
 * @returns Bugün mü?
 */
export const isToday = (date: Date | string): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Tarih dün mü kontrol eder
 * @param date Tarih
 * @returns Dün mü?
 */
export const isYesterday = (date: Date | string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};
