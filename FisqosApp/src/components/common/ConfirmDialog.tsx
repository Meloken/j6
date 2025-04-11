import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonType?: 'primary' | 'danger' | 'success';
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
  confirmButtonType = 'primary',
  containerStyle,
  titleStyle,
  messageStyle,
  buttonStyle,
  buttonTextStyle,
}) => {
  const { theme } = useTheme();
  
  // Onay düğmesi rengini belirleme
  const getConfirmButtonColor = () => {
    switch (confirmButtonType) {
      case 'danger':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'primary':
      default:
        return theme.colors.primary;
    }
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.container,
                { backgroundColor: theme.colors.background.paper },
                containerStyle,
              ]}
            >
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.text.primary },
                  titleStyle,
                ]}
              >
                {title}
              </Text>
              
              <Text
                style={[
                  styles.message,
                  { color: theme.colors.text.secondary },
                  messageStyle,
                ]}
              >
                {message}
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { borderColor: theme.colors.border.main },
                    buttonStyle,
                  ]}
                  onPress={onCancel}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.colors.text.primary },
                      buttonTextStyle,
                    ]}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: getConfirmButtonColor() },
                    buttonStyle,
                  ]}
                  onPress={onConfirm}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      styles.confirmButtonText,
                      buttonTextStyle,
                    ]}
                  >
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#fff',
  },
});

export default ConfirmDialog;
