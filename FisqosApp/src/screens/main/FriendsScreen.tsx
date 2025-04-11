import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, Button } from '../../components/common';
import { MainStackParamList } from '../../navigation/AppNavigator';

type FriendsScreenNavigationProp = StackNavigationProp<MainStackParamList>;

interface Friend {
  userId: string;
  username: string;
  profilePicture?: string;
  isOnline: boolean;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
}

interface FriendRequest {
  userId: string;
  username: string;
  profilePicture?: string;
  type: 'incoming' | 'outgoing';
}

const FriendsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'pending' | 'blocked'>('all');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const { token } = useAuth();
  const navigation = useNavigation<FriendsScreenNavigationProp>();

  useEffect(() => {
    if (token) {
      loadFriends();
    }
  }, [token]);

  const loadFriends = async () => {
    // Normalde API'den yüklenecek, şimdilik örnek veri kullanıyoruz
    setIsLoading(true);
    
    try {
      // Örnek veri
      const mockFriends: Friend[] = [
        {
          userId: '1',
          username: 'Ahmet Yılmaz',
          profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
          isOnline: true,
          status: 'online',
        },
        {
          userId: '2',
          username: 'Ayşe Demir',
          profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
          isOnline: false,
          status: 'offline',
        },
        {
          userId: '3',
          username: 'Mehmet Kaya',
          profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg',
          isOnline: true,
          status: 'idle',
        },
        {
          userId: '4',
          username: 'Zeynep Şahin',
          profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
          isOnline: true,
          status: 'dnd',
        },
      ];
      
      const mockFriendRequests: FriendRequest[] = [
        {
          userId: '5',
          username: 'Ali Yıldız',
          profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
          type: 'incoming',
        },
        {
          userId: '6',
          username: 'Fatma Çelik',
          profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
          type: 'outgoing',
        },
      ];
      
      const mockBlockedUsers: Friend[] = [
        {
          userId: '7',
          username: 'Hasan Kara',
          profilePicture: 'https://randomuser.me/api/portraits/men/4.jpg',
          isOnline: false,
          status: 'offline',
        },
      ];
      
      setFriends(mockFriends);
      setOnlineFriends(mockFriends.filter(friend => friend.isOnline));
      setFriendRequests(mockFriendRequests);
      setBlockedUsers(mockBlockedUsers);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Hata', 'Arkadaşlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı gereklidir');
      return;
    }

    if (!token) return;
    
    try {
      setIsSending(true);
      
      // Normalde API isteği yapılacak
      setTimeout(() => {
        setAddFriendModalVisible(false);
        setFriendUsername('');
        
        // Örnek olarak arkadaşlık isteği gönderildi olarak kabul ediyoruz
        const newFriendRequest: FriendRequest = {
          userId: Date.now().toString(),
          username: friendUsername,
          type: 'outgoing',
        };
        
        setFriendRequests(prev => [...prev, newFriendRequest]);
        
        Alert.alert('Başarılı', `${friendUsername} kullanıcısına arkadaşlık isteği gönderildi`);
      }, 1000);
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Hata', 'Arkadaşlık isteği gönderilirken bir hata oluştu');
    } finally {
      setIsSending(false);
    }
  };

  const handleAcceptFriendRequest = (userId: string, username: string) => {
    // Normalde API isteği yapılacak
    
    // Arkadaşlık isteğini kaldır
    setFriendRequests(prev => prev.filter(request => request.userId !== userId));
    
    // Arkadaş listesine ekle
    const newFriend: Friend = {
      userId,
      username,
      isOnline: false,
      status: 'offline',
    };
    
    setFriends(prev => [...prev, newFriend]);
    
    Alert.alert('Başarılı', `${username} artık arkadaşınız`);
  };

  const handleRejectFriendRequest = (userId: string) => {
    // Normalde API isteği yapılacak
    
    // Arkadaşlık isteğini kaldır
    setFriendRequests(prev => prev.filter(request => request.userId !== userId));
  };

  const handleCancelFriendRequest = (userId: string) => {
    // Normalde API isteği yapılacak
    
    // Arkadaşlık isteğini kaldır
    setFriendRequests(prev => prev.filter(request => request.userId !== userId));
  };

  const handleRemoveFriend = (userId: string, username: string) => {
    Alert.alert(
      'Arkadaşı Sil',
      `${username} arkadaşlıktan çıkarmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            // Normalde API isteği yapılacak
            
            // Arkadaş listesinden kaldır
            setFriends(prev => prev.filter(friend => friend.userId !== userId));
            setOnlineFriends(prev => prev.filter(friend => friend.userId !== userId));
          },
        },
      ]
    );
  };

  const handleBlockUser = (userId: string, username: string) => {
    Alert.alert(
      'Kullanıcıyı Engelle',
      `${username} engellemek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Engelle',
          style: 'destructive',
          onPress: () => {
            // Normalde API isteği yapılacak
            
            // Arkadaş listesinden kaldır
            setFriends(prev => prev.filter(friend => friend.userId !== userId));
            setOnlineFriends(prev => prev.filter(friend => friend.userId !== userId));
            
            // Engellenen kullanıcılar listesine ekle
            const friend = friends.find(f => f.userId === userId);
            if (friend) {
              setBlockedUsers(prev => [...prev, friend]);
            }
          },
        },
      ]
    );
  };

  const handleUnblockUser = (userId: string) => {
    // Normalde API isteği yapılacak
    
    // Engellenen kullanıcılar listesinden kaldır
    setBlockedUsers(prev => prev.filter(user => user.userId !== userId));
  };

  const navigateToChat = (userId: string, username: string) => {
    navigation.navigate('Chat', { userId, username });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online':
        return <View style={[styles.statusIndicator, styles.onlineStatus]} />;
      case 'idle':
        return <View style={[styles.statusIndicator, styles.idleStatus]} />;
      case 'dnd':
        return <View style={[styles.statusIndicator, styles.dndStatus]} />;
      default:
        return <View style={[styles.statusIndicator, styles.offlineStatus]} />;
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendInfo}>
        <View style={styles.avatarContainer}>
          <Avatar
            uri={item.profilePicture}
            name={item.username}
            size={40}
          />
          {getStatusIcon(item.status)}
        </View>
        
        <Text style={styles.username}>{item.username}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToChat(item.userId, item.username)}
        >
          <Icon name="chat" size={20} color="#7289da" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveFriend(item.userId, item.username)}
        >
          <Icon name="person-remove" size={20} color="#f04747" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBlockUser(item.userId, item.username)}
        >
          <Icon name="block" size={20} color="#f04747" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendInfo}>
        <Avatar
          uri={item.profilePicture}
          name={item.username}
          size={40}
        />
        <View>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.requestType}>
            {item.type === 'incoming' ? 'Gelen İstek' : 'Giden İstek'}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        {item.type === 'incoming' ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptFriendRequest(item.userId, item.username)}
            >
              <Icon name="check" size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectFriendRequest(item.userId)}
            >
              <Icon name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelFriendRequest(item.userId)}
          >
            <Icon name="cancel" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderBlockedUserItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendInfo}>
        <Avatar
          uri={item.profilePicture}
          name={item.username}
          size={40}
        />
        <Text style={styles.username}>{item.username}</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.actionButton, styles.unblockButton]}
        onPress={() => handleUnblockUser(item.userId)}
      >
        <Icon name="person-add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    
    switch (activeTab) {
      case 'all':
        return query
          ? friends.filter(friend => friend.username.toLowerCase().includes(query))
          : friends;
      case 'online':
        return query
          ? onlineFriends.filter(friend => friend.username.toLowerCase().includes(query))
          : onlineFriends;
      case 'pending':
        return query
          ? friendRequests.filter(request => request.username.toLowerCase().includes(query))
          : friendRequests;
      case 'blocked':
        return query
          ? blockedUsers.filter(user => user.username.toLowerCase().includes(query))
          : blockedUsers;
      default:
        return [];
    }
  };

  const renderEmptyComponent = () => {
    let message = '';
    let subMessage = '';
    
    switch (activeTab) {
      case 'all':
        message = searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz arkadaşınız yok';
        subMessage = searchQuery
          ? 'Farklı anahtar kelimelerle tekrar deneyin'
          : 'Yeni arkadaş eklemek için sağ üstteki + butonuna tıklayın';
        break;
      case 'online':
        message = searchQuery ? 'Arama sonucu bulunamadı' : 'Çevrimiçi arkadaşınız yok';
        subMessage = searchQuery
          ? 'Farklı anahtar kelimelerle tekrar deneyin'
          : 'Arkadaşlarınız çevrimiçi olduğunda burada görünecekler';
        break;
      case 'pending':
        message = searchQuery ? 'Arama sonucu bulunamadı' : 'Bekleyen arkadaşlık isteği yok';
        subMessage = searchQuery
          ? 'Farklı anahtar kelimelerle tekrar deneyin'
          : 'Yeni arkadaş eklemek için sağ üstteki + butonuna tıklayın';
        break;
      case 'blocked':
        message = searchQuery ? 'Arama sonucu bulunamadı' : 'Engellenen kullanıcı yok';
        subMessage = searchQuery
          ? 'Farklı anahtar kelimelerle tekrar deneyin'
          : 'Engellediğiniz kullanıcılar burada görünecek';
        break;
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="person-off" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>{message}</Text>
        <Text style={styles.emptySubtitle}>{subMessage}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Arkadaş ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddFriendModalVisible(true)}
        >
          <Icon name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tümü
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'online' && styles.activeTab]}
          onPress={() => setActiveTab('online')}
        >
          <Text style={[styles.tabText, activeTab === 'online' && styles.activeTabText]}>
            Çevrimiçi
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Bekleyen
            {friendRequests.length > 0 && (
              <Text style={styles.badgeText}> ({friendRequests.length})</Text>
            )}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'blocked' && styles.activeTab]}
          onPress={() => setActiveTab('blocked')}
        >
          <Text style={[styles.tabText, activeTab === 'blocked' && styles.activeTabText]}>
            Engellenen
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7289da" />
        </View>
      ) : (
        <FlatList
          data={getFilteredData()}
          renderItem={
            activeTab === 'pending'
              ? renderFriendRequestItem
              : activeTab === 'blocked'
              ? renderBlockedUserItem
              : renderFriendItem
          }
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
      
      {/* Arkadaş Ekleme Modal */}
      <Modal
        visible={addFriendModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddFriendModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Arkadaş Ekle</Text>
              <TouchableOpacity onPress={() => setAddFriendModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Arkadaşlık isteği göndermek için kullanıcı adını girin.
              </Text>
              
              <TextInput
                style={styles.modalInput}
                value={friendUsername}
                onChangeText={setFriendUsername}
                placeholder="Kullanıcı adı"
                autoCapitalize="none"
              />
              
              <Button
                title="Arkadaşlık İsteği Gönder"
                onPress={handleAddFriend}
                loading={isSending}
                disabled={!friendUsername.trim() || isSending}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#7289da',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7289da',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#7289da',
    fontWeight: 'bold',
  },
  badgeText: {
    color: '#f04747',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  onlineStatus: {
    backgroundColor: '#43b581',
  },
  idleStatus: {
    backgroundColor: '#faa61a',
  },
  dndStatus: {
    backgroundColor: '#f04747',
  },
  offlineStatus: {
    backgroundColor: '#747f8d',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  requestType: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
  },
  acceptButton: {
    backgroundColor: '#43b581',
  },
  rejectButton: {
    backgroundColor: '#f04747',
  },
  cancelButton: {
    backgroundColor: '#f04747',
  },
  unblockButton: {
    backgroundColor: '#7289da',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 15,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
});

export default FriendsScreen;
