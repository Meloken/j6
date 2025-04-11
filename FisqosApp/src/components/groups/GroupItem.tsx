import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from '../common';

interface GroupItemProps {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount: number;
  unreadCount?: number;
  isAdmin?: boolean;
  onPress: (id: string, name: string) => void;
}

const GroupItem: React.FC<GroupItemProps> = ({
  id,
  name,
  description,
  imageUrl,
  memberCount,
  unreadCount,
  isAdmin,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(id, name)}
      activeOpacity={0.7}
    >
      <Avatar
        uri={imageUrl}
        name={name}
        size={50}
      />
      
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>
        
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        
        <Text style={styles.memberCount}>{memberCount} üye</Text>
      </View>
      
      <View style={styles.rightContainer}>
        {unreadCount ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        ) : (
          <Icon name="chevron-right" size={24} color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 6,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: '#43b581',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
  },
  rightContainer: {
    marginLeft: 8,
  },
  unreadBadge: {
    backgroundColor: '#f04747',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default GroupItem;
