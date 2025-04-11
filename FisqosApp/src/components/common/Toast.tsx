import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';

// Toast türleri
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast özellikleri
interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  position?: 'top' | 'bottom';
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const { width } = Dimensions.get('window');

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  position = 'bottom',
  containerStyle,
  textStyle,
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(visible);
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Toast türüne göre renk ve ikon belirleme
  const getToastTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          icon: 'check-circle',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          icon: 'error',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
          icon: 'warning',
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.colors.primary,
          icon: 'info',
        };
    }
  };
  
  const { backgroundColor, icon } = getToastTypeStyles();
  
  // Toast'ı gösterme animasyonu
  const showToast = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Toast'ı gizleme animasyonu
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    });
  };
  
  // Toast görünürlüğü değiştiğinde animasyonları başlat
  useEffect(() => {
    if (visible) {
      showToast();
      
      // Otomatik kapanma
      const timer = setTimeout(() => {
        hideToast();
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);
  
  // Toast görünür değilse render etme
  if (!isVisible) {
    return null;
  }
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ translateY }],
          opacity,
          top: position === 'top' ? 50 : undefined,
          bottom: position === 'bottom' ? 50 : undefined,
        },
        containerStyle,
      ]}
    >
      <View style={styles.content}>
        <Icon name={icon} size={24} color="#fff" style={styles.icon} />
        <Text style={[styles.message, textStyle]}>{message}</Text>
      </View>
      
      <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
        <Icon name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    maxWidth: width - 40,
    minHeight: 50,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
    padding: 4,
  },
});

export default Toast;
