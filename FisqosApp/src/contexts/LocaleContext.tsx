import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n, { loadLocale, changeLocale, getCurrentLocale, getLocales } from '../i18n';

// Dil bağlamı türü
interface LocaleContextType {
  locale: string;
  locales: Array<{ name: string; code: string }>;
  t: (key: string, options?: any) => string;
  changeLocale: (locale: string) => Promise<void>;
}

// Dil bağlamı oluşturma
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Dil sağlayıcısı
export const LocaleProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [locale, setLocale] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dil tercihini yükleme
  useEffect(() => {
    const initializeLocale = async () => {
      try {
        const currentLocale = await loadLocale();
        setLocale(currentLocale);
      } catch (error) {
        console.error('Failed to initialize locale', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeLocale();
  }, []);
  
  // Dil değiştirme fonksiyonu
  const handleChangeLocale = async (newLocale: string) => {
    try {
      await changeLocale(newLocale);
      setLocale(newLocale);
    } catch (error) {
      console.error('Failed to change locale', error);
    }
  };
  
  // Çeviri fonksiyonu
  const t = (key: string, options?: any) => {
    const keys = key.split('.');
    let value = i18n.t(key, options);
    
    // Eğer çeviri bulunamazsa, anahtarı döndür
    if (value === key && keys.length > 1) {
      let current = i18n.translations[locale];
      for (const k of keys) {
        if (current && current[k]) {
          current = current[k];
        } else {
          return key;
        }
      }
      
      if (typeof current === 'string') {
        value = current;
      }
    }
    
    // Değişkenleri değiştir
    if (options && typeof value === 'string') {
      Object.keys(options).forEach(optionKey => {
        value = value.replace(`{${optionKey}}`, options[optionKey]);
      });
    }
    
    return value;
  };
  
  // Yükleme durumunda boş bir bileşen döndürme
  if (isLoading) {
    return null;
  }
  
  return (
    <LocaleContext.Provider
      value={{
        locale,
        locales: getLocales(),
        t,
        changeLocale: handleChangeLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

// Dil hook'u
export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
