import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { fetchChannelMessages, sendMessage } from '../../services/channelService';
import { MainStackParamList } from '../../navigation/AppNavigator';

type ChannelScreenRouteProp = RouteProp<MainStackParamList, 'Channel'>;
type ChannelScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Channel'>;

interface ChannelScreenProps {
  route: ChannelScreenRouteProp;
  navigation: ChannelScreenNavigationProp;
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

const ChannelScreen: React.FC<ChannelScreenProps> = ({ route, navigation }) => {
  const { channelId, channelName, isVoiceChannel } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const { token, user } = useAuth();
  const { socket, isConnected } = useSocket();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (token) {
      loadMessages();
    }
    
    // Kanal başlığını güncelle
    navigation.setOptions({
      title: channelName,
      headerRight: () => isVoiceChannel ? (
        <TouchableOpacity
          style={styles.joinVoiceButton}
          onPress={handleJoinVoiceChannel}
        >
          <Icon name="call" size={20} color="#fff" />
          <Text style={styles.joinVoiceButtonText}>Katıl</Text>
        </TouchableOpacity>
      ) : null,
    });
  }, [token, channelId]);

  useEffect(() => {
    if (socket && isConnected) {
      // Yeni mesaj geldiğinde
      socket.on('new_message', (data) => {
        if (data.channelId === channelId) {
          setMessages(prevMessages => [data.message, ...prevMessages]);
        }
      });
      
      // Mesaj düzenlendiğinde
      socket.on('message_updated', (data) => {
        if (data.channelId === channelId) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg._id === data.message._id ? data.message : msg
            )
          );
        }
      });
      
      // Mesaj silindiğinde
      socket.on('message_deleted', (data) => {
        if (data.channelId === channelId) {
          setMessages(prevMessages => 
            prevMessages.filter(msg => msg._id !== data.messageId)
          );
        }
      });
      
      // Kanala katıldığını bildir
      socket.emit('join_channel', { channelId });
      
      return () => {
        socket.off('new_message');
        socket.off('message_updated');
        socket.off('message_deleted');
        
        // Kanaldan ayrıldığını bildir
        socket.emit('leave_channel', { channelId });
      };
    }
  }, [socket, isConnected, channelId]);

  const loadMessages = async (loadMore = false) => {
    if (!token) return;
    
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      const currentPage = loadMore ? page + 1 : 1;
      const response = await fetchChannelMessages(token, channelId, currentPage);
      
      if (response.success) {
        const newMessages = response.data.messages;
        
        if (loadMore) {
          setMessages(prevMessages => [...prevMessages, ...newMessages]);
        } else {
          setMessages(newMessages);
        }
        
        setPage(currentPage);
        setHasMore(newMessages.length === 50); // 50 mesaj yükleniyorsa daha fazla olabilir
      } else {
        Alert.alert('Hata', response.message || 'Mesajlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Hata', 'Mesajlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !token || !user) return;
    
    try {
      setIsSending(true);
      
      const response = await sendMessage(token, channelId, messageText);
      
      if (response.success) {
        setMessageText('');
      } else {
        Alert.alert('Hata', response.message || 'Mesaj gönderilemedi');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    } finally {
      setIsSending(false);
    }
  };

  const handleJoinVoiceChannel = () => {
    navigation.navigate('VoiceChannel', {
      channelId,
      channelName,
    });
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadMessages(true);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender._id === user?.id;
    const messageDate = new Date(item.createdAt);
    const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = messageDate.toLocaleDateString();
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            {item.sender.profilePicture ? (
              <Image
                source={{ uri: item.sender.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.defaultAvatarText}>
                  {item.sender.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          {!isCurrentUser && (
            <Text style={styles.senderName}>{item.sender.username}</Text>
          )}
          
          <Text style={styles.messageText}>{item.content}</Text>
          
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {item.attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.attachment}
                  onPress={() => {/* Dosyayı aç */}}
                >
                  <Icon
                    name={
                      attachment.type.startsWith('image')
                        ? 'image'
                        : attachment.type.startsWith('video')
                        ? 'videocam'
                        : attachment.type.startsWith('audio')
                        ? 'audiotrack'
                        : 'insert-drive-file'
                    }
                    size={24}
                    color="#7289da"
                  />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{formattedTime}</Text>
            {item.isEdited && (
              <Text style={styles.editedText}>(düzenlendi)</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderDateSeparator = (date: string) => (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateText}>{date}</Text>
      <View style={styles.dateLine} />
    </View>
  );

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
      
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="attach-file" size={24} color="#7289da" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Mesajınızı yazın..."
          multiline
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || isSending) ? styles.sendButtonDisabled : null
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messageList: {
    padding: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  defaultAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7289da',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    maxWidth: '100%',
  },
  currentUserBubble: {
    backgroundColor: '#7289da',
  },
  otherUserBubble: {
    backgroundColor: '#fff',
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  attachmentName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  editedText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#7289da',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#a8b7e0',
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
  joinVoiceButton: {
    flexDirection: 'row',
    backgroundColor: '#43b581',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    marginRight: 10,
  },
  joinVoiceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default ChannelScreen;
