import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ChannelItemProps {
  id: string;
  name: string;
  type: 'text' | 'voice';
  isPrivate?: boolean;
  unreadCount?: number;
  isActive?: boolean;
  onPress: (id: string, name: string, isVoice: boolean) => void;
}

const ChannelItem: React.FC<ChannelItemProps> = ({
  id,
  name,
  type,
  isPrivate,
  unreadCount,
  isActive,
  onPress,
}) => {
  const isVoice = type === 'voice';
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.activeContainer
      ]}
      onPress={() => onPress(id, name, isVoice)}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        <Icon
          name={isVoice ? 'volume-up' : 'tag'}
          size={20}
          color={isActive ? '#fff' : '#7289da'}
        />
        
        <Text
          style={[
            styles.name,
            isActive && styles.activeName
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
      
      <View style={styles.rightContainer}>
        {isPrivate && (
          <Icon
            name="lock"
            size={16}
            color={isActive ? '#fff' : '#999'}
            style={styles.icon}
          />
        )}
        
        {unreadCount ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  activeContainer: {
    backgroundColor: '#7289da',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  activeName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 8,
  },
  unreadBadge: {
    backgroundColor: '#f04747',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ChannelItem;
