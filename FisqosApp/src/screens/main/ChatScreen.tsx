import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { MessageBubble, MessageInput, DateSeparator } from '../../components/chat';
import { MainStackParamList } from '../../navigation/AppNavigator';

type ChatScreenRouteProp = RouteProp<MainStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Chat'>;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { userId, username } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const { token, user } = useAuth();
  const { socket, isConnected } = useSocket();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({
      title: username,
      headerRight: () => (
        <View style={styles.headerRight}>
          <Icon name="call" size={24} color="#333" style={styles.headerIcon} />
          <Icon name="videocam" size={24} color="#333" style={styles.headerIcon} />
        </View>
      ),
    });
    
    if (token) {
      loadMessages();
    }
  }, [token, userId]);

  useEffect(() => {
    if (socket && isConnected) {
      // Özel mesaj geldiğinde
      socket.on('direct_message', (data) => {
        if (data.senderId === userId || data.receiverId === userId) {
          const newMessage: Message = {
            _id: data.message._id,
            content: data.message.content,
            sender: data.message.sender,
            attachments: data.message.attachments,
            createdAt: data.message.createdAt,
            isEdited: false,
          };
          
          setMessages(prevMessages => [newMessage, ...prevMessages]);
        }
      });
      
      // Mesaj düzenlendiğinde
      socket.on('direct_message_updated', (data) => {
        if (data.senderId === userId || data.receiverId === userId) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg._id === data.message._id ? data.message : msg
            )
          );
        }
      });
      
      // Mesaj silindiğinde
      socket.on('direct_message_deleted', (data) => {
        if (data.senderId === userId || data.receiverId === userId) {
          setMessages(prevMessages => 
            prevMessages.filter(msg => msg._id !== data.messageId)
          );
        }
      });
      
      // Kullanıcı durumu değiştiğinde
      socket.on('user_status_changed', (data) => {
        if (data.userId === userId) {
          navigation.setOptions({
            title: `${username} ${data.isOnline ? '(Çevrimiçi)' : ''}`,
          });
        }
      });
      
      // Kullanıcıya bağlandığını bildir
      socket.emit('join_direct_chat', { userId });
      
      return () => {
        socket.off('direct_message');
        socket.off('direct_message_updated');
        socket.off('direct_message_deleted');
        socket.off('user_status_changed');
        
        // Kullanıcıdan ayrıldığını bildir
        socket.emit('leave_direct_chat', { userId });
      };
    }
  }, [socket, isConnected, userId]);

  const loadMessages = async (loadMore = false) => {
    // Normalde API'den yüklenecek, şimdilik örnek veri kullanıyoruz
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      // Örnek veri
      setTimeout(() => {
        const mockMessages: Message[] = Array.from({ length: 20 }).map((_, index) => ({
          _id: `msg_${Date.now()}_${index}`,
          content: `Bu bir örnek mesajdır. #${index + 1}`,
          sender: {
            _id: index % 2 === 0 ? (user?.id || 'current_user') : userId,
            username: index % 2 === 0 ? (user?.username || 'Ben') : username,
            profilePicture: index % 2 === 0 ? user?.profilePicture : undefined,
          },
          createdAt: new Date(Date.now() - index * 1000 * 60 * 5).toISOString(),
          isEdited: index % 5 === 0,
        }));
        
        if (loadMore) {
          setMessages(prevMessages => [...prevMessages, ...mockMessages]);
        } else {
          setMessages(mockMessages);
        }
        
        setPage(loadMore ? page + 1 : 1);
        setHasMore(page < 3); // Örnek olarak 3 sayfa var
        
        setIsLoading(false);
        setIsLoadingMore(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Hata', 'Mesajlar yüklenirken bir hata oluştu');
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user) return;
    
    try {
      setIsSending(true);
      
      // Normalde API isteği yapılacak
      setTimeout(() => {
        const newMessage: Message = {
          _id: `msg_${Date.now()}`,
          content: text,
          sender: {
            _id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
          createdAt: new Date().toISOString(),
          isEdited: false,
        };
        
        setMessages(prevMessages => [newMessage, ...prevMessages]);
        setIsSending(false);
        
        // Socket.IO ile mesajı gönder
        if (socket && isConnected) {
          socket.emit('send_direct_message', {
            receiverId: userId,
            content: text,
          });
        }
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi');
      setIsSending(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadMessages(true);
    }
  };

  const handleAttachment = () => {
    Alert.alert('Bilgi', 'Dosya ekleme özelliği henüz uygulanmadı');
  };

  const handleMessageLongPress = (message: Message) => {
    if (message.sender._id !== user?.id) return;
    
    Alert.alert(
      'Mesaj İşlemleri',
      'Bu mesaj için ne yapmak istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Düzenle',
          onPress: () => Alert.alert('Bilgi', 'Mesaj düzenleme özelliği henüz uygulanmadı'),
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => Alert.alert('Bilgi', 'Mesaj silme özelliği henüz uygulanmadı'),
        },
      ]
    );
  };

  const handleAttachmentPress = (attachment: any) => {
    Alert.alert('Bilgi', 'Dosya görüntüleme özelliği henüz uygulanmadı');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender._id === user?.id;
    
    return (
      <MessageBubble
        content={item.content}
        sender={item.sender}
        createdAt={item.createdAt}
        isCurrentUser={isCurrentUser}
        isEdited={item.isEdited}
        attachments={item.attachments}
        onLongPress={() => handleMessageLongPress(item)}
        onAttachmentPress={handleAttachmentPress}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7289da" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messageList}
          inverted
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator size="small" color="#7289da" style={styles.loadingMore} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="chat" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Henüz mesaj yok</Text>
              <Text style={styles.emptySubtext}>İlk mesajı gönderen siz olun!</Text>
            </View>
          }
        />
      )}
      
      <MessageInput
        onSend={handleSendMessage}
        onAttach={handleAttachment}
        placeholder={`${username} kullanıcısına mesaj yaz...`}
        isSending={isSending}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 10,
  },
  headerIcon: {
    marginLeft: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 10,
  },
  loadingMore: {
    marginVertical: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default ChatScreen;
