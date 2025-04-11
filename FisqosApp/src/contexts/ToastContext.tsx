import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastType } from '../components/common/Toast';

// Toast bağlamı türü
interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

// Toast bağlamı oluşturma
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast sağlayıcısı
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(3000);
  
  // Toast gösterme fonksiyonu
  const showToast = useCallback((
    newMessage: string,
    newType: ToastType = 'info',
    newDuration: number = 3000
  ) => {
    setMessage(newMessage);
    setType(newType);
    setDuration(newDuration);
    setVisible(true);
  }, []);
  
  // Toast gizleme fonksiyonu
  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);
  
  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={visible}
        message={message}
        type={type}
        duration={duration}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
};

// Toast hook'u
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
