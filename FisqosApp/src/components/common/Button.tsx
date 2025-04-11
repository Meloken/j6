import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    let buttonStyle: any[] = [styles.button];

    // Type styles
    if (type === 'primary') {
      buttonStyle.push(styles.primaryButton);
    } else if (type === 'secondary') {
      buttonStyle.push(styles.secondaryButton);
    } else if (type === 'danger') {
      buttonStyle.push(styles.dangerButton);
    }

    // Size styles
    if (size === 'small') {
      buttonStyle.push(styles.smallButton);
    } else if (size === 'large') {
      buttonStyle.push(styles.largeButton);
    }

    // Disabled style
    if (disabled || loading) {
      buttonStyle.push(styles.disabledButton);
    }

    // Custom style
    if (style) {
      buttonStyle.push(style);
    }

    return buttonStyle;
  };

  const getTextStyle = () => {
    let textStyleArray: any[] = [styles.buttonText];

    // Type styles
    if (type === 'secondary') {
      textStyleArray.push(styles.secondaryButtonText);
    }

    // Size styles
    if (size === 'small') {
      textStyleArray.push(styles.smallButtonText);
    } else if (size === 'large') {
      textStyleArray.push(styles.largeButtonText);
    }

    // Disabled style
    if (disabled || loading) {
      textStyleArray.push(styles.disabledButtonText);
    }

    // Custom style
    if (textStyle) {
      textStyleArray.push(textStyle);
    }

    return textStyleArray;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={type === 'secondary' ? '#7289da' : '#fff'}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#7289da',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7289da',
  },
  dangerButton: {
    backgroundColor: '#f04747',
  },
  smallButton: {
    height: 32,
    paddingHorizontal: 12,
  },
  mediumButton: {
    height: 44,
  },
  largeButton: {
    height: 52,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#7289da',
  },
  smallButtonText: {
    fontSize: 14,
  },
  largeButtonText: {
    fontSize: 18,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
});

export default Button;
