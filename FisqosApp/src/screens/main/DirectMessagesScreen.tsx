import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Avatar } from '../../components/common';
import { MainStackParamList } from '../../navigation/AppNavigator';

type DirectMessagesScreenNavigationProp = StackNavigationProp<MainStackParamList>;

interface Conversation {
  userId: string;
  username: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
}

const DirectMessagesScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { token } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigation = useNavigation<DirectMessagesScreenNavigationProp>();

  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token]);

  useEffect(() => {
    if (socket && isConnected) {
      // Yeni mesaj geldiğinde
      socket.on('new_direct_message', (data) => {
        updateConversation(data.senderId, data.message, true);
      });
      
      // Kullanıcı durumu değiştiğinde
      socket.on('user_status_changed', (data) => {
        setConversations(prev => 
          prev.map(conv => 
            conv.userId === data.userId
              ? { ...conv, isOnline: data.isOnline }
              : conv
          )
        );
      });
      
      return () => {
        socket.off('new_direct_message');
        socket.off('user_status_changed');
      };
    }
  }, [socket, isConnected]);

  const loadConversations = async () => {
    // Normalde API'den yüklenecek, şimdilik örnek veri kullanıyoruz
    setIsLoading(true);
    
    try {
      // Örnek veri
      const mockConversations: Conversation[] = [
        {
          userId: '1',
          username: 'Ahmet Yılmaz',
          profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
          lastMessage: 'Merhaba, nasılsın?',
          lastMessageTime: new Date(Date.now() - 5 * 60000).toISOString(),
          unreadCount: 2,
          isOnline: true,
        },
        {
          userId: '2',
          username: 'Ayşe Demir',
          profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
          lastMessage: 'Toplantı saat kaçta başlıyor?',
          lastMessageTime: new Date(Date.now() - 30 * 60000).toISOString(),
          unreadCount: 0,
          isOnline: false,
        },
        {
          userId: '3',
          username: 'Mehmet Kaya',
          profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg',
          lastMessage: 'Projeyi tamamladım, inceleyebilir misin?',
          lastMessageTime: new Date(Date.now() - 2 * 3600000).toISOString(),
          unreadCount: 0,
          isOnline: true,
        },
      ];
      
      setConversations(mockConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Hata', 'Konuşmalar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConversation = (userId: string, message: string, incrementUnread: boolean) => {
    setConversations(prev => {
      const conversationIndex = prev.findIndex(conv => conv.userId === userId);
      
      if (conversationIndex >= 0) {
        // Mevcut konuşmayı güncelle
        const updatedConversations = [...prev];
        const conversation = { ...updatedConversations[conversationIndex] };
        
        conversation.lastMessage = message;
        conversation.lastMessageTime = new Date().toISOString();
        
        if (incrementUnread) {
          conversation.unreadCount += 1;
        }
        
        // Konuşmayı en üste taşı
        updatedConversations.splice(conversationIndex, 1);
        updatedConversations.unshift(conversation);
        
        return updatedConversations;
      } else {
        // Yeni konuşma ekle (normalde API'den kullanıcı bilgilerini alacağız)
        return prev;
      }
    });
  };

  const navigateToChat = (userId: string, username: string) => {
    // Okunmamış mesaj sayısını sıfırla
    setConversations(prev => 
      prev.map(conv => 
        conv.userId === userId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
    
    navigation.navigate('Chat', { userId, username });
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '';
    
    const messageDate = new Date(timeString);
    const now = new Date();
    
    // Bugün içindeyse saat:dakika göster
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Dün ise "Dün" göster
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    }
    
    // Bu hafta içindeyse gün adı göster
    const daysOfWeek = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayDiff = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24);
    if (dayDiff < 7) {
      return daysOfWeek[messageDate.getDay()];
    }
    
    // Diğer durumlarda tarih göster
    return messageDate.toLocaleDateString();
  };

  const filteredConversations = searchQuery
    ? conversations.filter(conv => 
        conv.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigateToChat(item.userId, item.username)}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          uri={item.profilePicture}
          name={item.username}
          size={50}
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.username} numberOfLines={1}>{item.username}</Text>
          <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        
        <View style={styles.conversationFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Henüz mesaj yok'}
          </Text>
          
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Kullanıcı ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity style={styles.newChatButton}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7289da" />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="chat" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? 'Arama sonucu bulunamadı'
                  : 'Henüz mesajlaşma yok'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Farklı anahtar kelimelerle tekrar deneyin'
                  : 'Yeni bir sohbet başlatmak için sağ üstteki + butonuna tıklayın'}
              </Text>
            </View>
          )}
        />
      )}
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
  newChatButton: {
    backgroundColor: '#7289da',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  conversationItem: {
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
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#43b581',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#7289da',
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
});

export default DirectMessagesScreen;
