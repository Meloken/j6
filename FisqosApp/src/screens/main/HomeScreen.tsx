import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { fetchUserGroups } from '../../services/groupService';
import { MainStackParamList } from '../../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList>;

interface Group {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount: number;
  unreadCount?: number;
  lastAccessed?: number;
}

const HomeScreen: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentGroups, setRecentGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { token, user } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  useEffect(() => {
    if (socket && isConnected) {
      // Yeni mesaj geldiğinde okunmamış mesaj sayısını güncelle
      socket.on('new_message', (data) => {
        updateUnreadCount(data.groupId);
      });

      // Yeni grup davetiyesi geldiğinde grupları yeniden yükle
      socket.on('group_invitation', () => {
        loadData();
      });

      return () => {
        socket.off('new_message');
        socket.off('group_invitation');
      };
    }
  }, [socket, isConnected]);

  const loadData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetchUserGroups(token);

      if (response.success) {
        setGroups(response.data.groups);

        // Son erişilen grupları al (en fazla 3)
        const recent = response.data.groups
          .sort((a: Group, b: Group) => {
            return (b.lastAccessed || 0) - (a.lastAccessed || 0);
          })
          .slice(0, 3);

        setRecentGroups(recent);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const updateUnreadCount = (groupId: string) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group._id === groupId
          ? { ...group, unreadCount: (group.unreadCount || 0) + 1 }
          : group
      )
    );

    setRecentGroups(prevGroups =>
      prevGroups.map(group =>
        group._id === groupId
          ? { ...group, unreadCount: (group.unreadCount || 0) + 1 }
          : group
      )
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const navigateToGroup = (groupId: string, groupName: string) => {
    navigation.navigate('GroupDetail', { groupId, groupName });
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => navigateToGroup(item._id, item.name)}
    >
      <View style={styles.groupImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.groupImage} />
        ) : (
          <Text style={styles.groupInitial}>{item.name.charAt(0).toUpperCase()}</Text>
        )}
      </View>

      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.groupDescription} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.memberCount}>{item.memberCount} üye</Text>
      </View>

      {item.unreadCount ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {item.unreadCount > 99 ? '99+' : item.unreadCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7289da" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Merhaba, {user?.username || 'Kullanıcı'}</Text>
      </View>

      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Son Erişilen Gruplar</Text>
              {recentGroups.length > 0 ? (
                <FlatList
                  data={recentGroups}
                  renderItem={renderGroupItem}
                  keyExtractor={(item) => `recent-${item._id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentGroupsContainer}
                />
              ) : (
                <Text style={styles.emptyText}>Henüz hiçbir gruba erişmediniz</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tüm Gruplar</Text>
              {groups.length === 0 && (
                <Text style={styles.emptyText}>Henüz hiçbir gruba üye değilsiniz</Text>
              )}
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="group" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Henüz hiçbir gruba üye değilsiniz</Text>
            <Text style={styles.emptySubtitle}>
              Yeni bir grup oluşturmak veya mevcut bir gruba katılmak için Gruplar sekmesine gidin
            </Text>
            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={() => navigation.navigate('Groups')}
            >
              <Text style={styles.createGroupButtonText}>Gruplara Git</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#7289da']}
            tintColor="#7289da"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 15,
    backgroundColor: '#7289da',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recentGroupsContainer: {
    paddingBottom: 10,
  },
  groupItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  groupImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7289da',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  createGroupButton: {
    backgroundColor: '#7289da',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  createGroupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
