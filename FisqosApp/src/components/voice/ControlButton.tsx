import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ControlButtonProps {
  iconName: string;
  isActive?: boolean;
  isEndCall?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  iconName,
  isActive = false,
  isEndCall = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isActive && styles.activeButton,
        isEndCall && styles.endCallButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={iconName} size={24} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4f545c',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  activeButton: {
    backgroundColor: '#7289da',
  },
  endCallButton: {
    backgroundColor: '#f04747',
  },
});

export default ControlButton;
