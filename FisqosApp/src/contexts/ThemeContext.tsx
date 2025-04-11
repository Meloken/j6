import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme';

// Tema bağlamı türü
interface ThemeContextType {
  theme: typeof lightTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

// Tema bağlamı oluşturma
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Tema sağlayıcısı
export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tema tercihini AsyncStorage'dan yükleme
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme_preference');
        if (storedTheme !== null) {
          setIsDark(storedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setIsDark(!isDark);
    AsyncStorage.setItem('theme_preference', !isDark ? 'dark' : 'light');
  };
  
  // Doğrudan tema ayarlama fonksiyonu
  const setDarkMode = (dark: boolean) => {
    setIsDark(dark);
    AsyncStorage.setItem('theme_preference', dark ? 'dark' : 'light');
  };
  
  // Mevcut temayı seçme
  const theme = isDark ? darkTheme : lightTheme;
  
  // Yükleme durumunda boş bir bileşen döndürme
  if (isLoading) {
    return null;
  }
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Tema hook'u
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
