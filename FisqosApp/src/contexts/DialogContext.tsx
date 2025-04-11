import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';

// İletişim kutusu bağlamı türü
interface DialogContextType {
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      confirmButtonType?: 'primary' | 'danger' | 'success';
    }
  ) => void;
  hideConfirmDialog: () => void;
}

// İletişim kutusu bağlamı oluşturma
const DialogContext = createContext<DialogContextType | undefined>(undefined);

// İletişim kutusu sağlayıcısı
export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirmText, setConfirmText] = useState('Onayla');
  const [cancelText, setCancelText] = useState('İptal');
  const [confirmButtonType, setConfirmButtonType] = useState<'primary' | 'danger' | 'success'>('primary');
  const [onConfirmCallback, setOnConfirmCallback] = useState<() => void>(() => {});
  
  // İletişim kutusu gösterme fonksiyonu
  const showConfirmDialog = useCallback(
    (
      dialogTitle: string,
      dialogMessage: string,
      onConfirm: () => void,
      options?: {
        confirmText?: string;
        cancelText?: string;
        confirmButtonType?: 'primary' | 'danger' | 'success';
      }
    ) => {
      setTitle(dialogTitle);
      setMessage(dialogMessage);
      setOnConfirmCallback(() => onConfirm);
      
      if (options?.confirmText) {
        setConfirmText(options.confirmText);
      } else {
        setConfirmText('Onayla');
      }
      
      if (options?.cancelText) {
        setCancelText(options.cancelText);
      } else {
        setCancelText('İptal');
      }
      
      if (options?.confirmButtonType) {
        setConfirmButtonType(options.confirmButtonType);
      } else {
        setConfirmButtonType('primary');
      }
      
      setVisible(true);
    },
    []
  );
  
  // İletişim kutusu gizleme fonksiyonu
  const hideConfirmDialog = useCallback(() => {
    setVisible(false);
  }, []);
  
  // Onay işlemi
  const handleConfirm = useCallback(() => {
    hideConfirmDialog();
    onConfirmCallback();
  }, [onConfirmCallback, hideConfirmDialog]);
  
  return (
    <DialogContext.Provider value={{ showConfirmDialog, hideConfirmDialog }}>
      {children}
      <ConfirmDialog
        visible={visible}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        confirmButtonType={confirmButtonType}
        onConfirm={handleConfirm}
        onCancel={hideConfirmDialog}
      />
    </DialogContext.Provider>
  );
};

// İletişim kutusu hook'u
export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
