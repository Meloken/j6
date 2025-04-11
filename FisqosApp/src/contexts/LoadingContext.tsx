import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import LoadingOverlay from '../components/common/LoadingOverlay';

// Yükleme bağlamı türü
interface LoadingContextType {
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  isLoading: boolean;
}

// Yükleme bağlamı oluşturma
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Yükleme sağlayıcısı
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState<string | undefined>(undefined);
  
  // Yükleme gösterme fonksiyonu
  const showLoading = useCallback((loadingText?: string) => {
    setText(loadingText);
    setVisible(true);
  }, []);
  
  // Yükleme gizleme fonksiyonu
  const hideLoading = useCallback(() => {
    setVisible(false);
  }, []);
  
  return (
    <LoadingContext.Provider
      value={{ showLoading, hideLoading, isLoading: visible }}
    >
      {children}
      <LoadingOverlay visible={visible} text={text} />
    </LoadingContext.Provider>
  );
};

// Yükleme hook'u
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
