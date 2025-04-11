import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Modal,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  transparent?: boolean;
  spinnerSize?: 'small' | 'large';
  spinnerColor?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const { width, height } = Dimensions.get('window');

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text,
  transparent = true,
  spinnerSize = 'large',
  spinnerColor,
  containerStyle,
  textStyle,
}) => {
  const { theme } = useTheme();
  
  if (!visible) {
    return null;
  }
  
  return (
    <Modal
      transparent={transparent}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: transparent
              ? 'rgba(0, 0, 0, 0.5)'
              : theme.colors.background.default,
          },
          containerStyle,
        ]}
      >
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.colors.background.paper },
          ]}
        >
          <ActivityIndicator
            size={spinnerSize}
            color={spinnerColor || theme.colors.primary}
            style={styles.spinner}
          />
          
          {text && (
            <Text
              style={[
                styles.text,
                { color: theme.colors.text.primary },
                textStyle,
              ]}
            >
              {text}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width,
    height,
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 120,
    minHeight: 100,
  },
  spinner: {
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoadingOverlay;
