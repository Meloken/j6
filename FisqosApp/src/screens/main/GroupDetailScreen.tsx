import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchGroupDetails, updateGroup } from '../../services/groupService';
import { fetchGroupChannels, createChannel } from '../../services/channelService';
import { MainStackParamList } from '../../navigation/AppNavigator';

type GroupDetailScreenRouteProp = RouteProp<MainStackParamList, 'GroupDetail'>;
type GroupDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'GroupDetail'>;

interface GroupDetailScreenProps {
  route: GroupDetailScreenRouteProp;
  navigation: GroupDetailScreenNavigationProp;
}

interface Channel {
  _id: string;
  name: string;
  type: 'text' | 'voice';
  description?: string;
  isPrivate: boolean;
}

interface GroupDetails {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount: number;
  isAdmin: boolean;
  createdAt: string;
}

const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [textChannels, setTextChannels] = useState<Channel[]>([]);
  const [voiceChannels, setVoiceChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createChannelModalVisible, setCreateChannelModalVisible] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  
  const { token, user } = useAuth();

  useEffect(() => {
    if (token) {
      loadGroupData();
    }
    
    // Grup başlığını güncelle
    navigation.setOptions({
      title: groupName,
      headerRight: () => (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleGroupSettings}
        >
          <Icon name="settings" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [token, groupId]);

  const loadGroupData = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      
      // Grup detaylarını yükle
      const groupResponse = await fetchGroupDetails(token, groupId);
      
      if (groupResponse.success) {
        setGroupDetails(groupResponse.data.group);
      } else {
        Alert.alert('Hata', groupResponse.message || 'Grup detayları yüklenirken bir hata oluştu');
      }
      
      // Kanalları yükle
      const channelsResponse = await fetchGroupChannels(token, groupId);
      
      if (channelsResponse.success) {
        const allChannels = channelsResponse.data.channels;
        setChannels(allChannels);
        
        // Kanalları türlerine göre ayır
        setTextChannels(allChannels.filter((channel: Channel) => channel.type === 'text'));
        setVoiceChannels(allChannels.filter((channel: Channel) => channel.type === 'voice'));
      } else {
        Alert.alert('Hata', channelsResponse.message || 'Kanallar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      Alert.alert('Hata', 'Grup verileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupSettings = () => {
    // Grup ayarları ekranına git
    // navigation.navigate('GroupSettings', { groupId, groupName });
    Alert.alert('Grup Ayarları', 'Bu özellik henüz uygulanmadı');
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      Alert.alert('Hata', 'Kanal adı gereklidir');
      return;
    }

    if (!token) return;
    
    try {
      setIsCreatingChannel(true);
      
      const channelData = {
        name: newChannelName.trim(),
        type: newChannelType,
        description: newChannelDescription.trim() || undefined,
        isPrivate: newChannelPrivate,
      };
      
      const response = await createChannel(token, groupId, channelData);
      
      if (response.success) {
        setCreateChannelModalVisible(false);
        setNewChannelName('');
        setNewChannelDescription('');
        setNewChannelType('text');
        setNewChannelPrivate(false);
        
        // Yeni kanalı listeye ekle
        const newChannel = response.data.channel;
        setChannels(prevChannels => [...prevChannels, newChannel]);
        
        if (newChannel.type === 'text') {
          setTextChannels(prevChannels => [...prevChannels, newChannel]);
        } else {
          setVoiceChannels(prevChannels => [...prevChannels, newChannel]);
        }
        
        // Yeni kanala git
        navigateToChannel(newChannel._id, newChannel.name, newChannel.type === 'voice');
      } else {
        Alert.alert('Hata', response.message || 'Kanal oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      Alert.alert('Hata', 'Kanal oluşturulurken bir hata oluştu');
    } finally {
      setIsCreatingChannel(false);
    }
  };

  const navigateToChannel = (channelId: string, channelName: string, isVoiceChannel: boolean) => {
    if (isVoiceChannel) {
      navigation.navigate('VoiceChannel', { channelId, channelName });
    } else {
      navigation.navigate('Channel', { channelId, channelName, isVoiceChannel });
    }
  };

  const renderChannelItem = ({ item }: { item: Channel }) => (
    <TouchableOpacity
      style={styles.channelItem}
      onPress={() => navigateToChannel(item._id, item.name, item.type === 'voice')}
    >
      <Icon
        name={item.type === 'text' ? 'tag' : 'volume-up'}
        size={20}
        color="#7289da"
      />
      <Text style={styles.channelName}>{item.name}</Text>
      {item.isPrivate && (
        <Icon name="lock" size={16} color="#999" style={styles.privateIcon} />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7289da" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groupDetails && (
        <View style={styles.groupInfoContainer}>
          <View style={styles.groupImageContainer}>
            {groupDetails.imageUrl ? (
              <Image source={{ uri: groupDetails.imageUrl }} style={styles.groupImage} />
            ) : (
              <Text style={styles.groupInitial}>{groupDetails.name.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{groupDetails.name}</Text>
            {groupDetails.description && (
              <Text style={styles.groupDescription}>{groupDetails.description}</Text>
            )}
            <Text style={styles.memberCount}>{groupDetails.memberCount} üye</Text>
          </View>
        </View>
      )}
      
      <View style={styles.channelsContainer}>
        <View style={styles.channelTypeHeader}>
          <Text style={styles.channelTypeTitle}>Metin Kanalları</Text>
          {groupDetails?.isAdmin && (
            <TouchableOpacity
              onPress={() => {
                setNewChannelType('text');
                setCreateChannelModalVisible(true);
              }}
            >
              <Icon name="add" size={20} color="#7289da" />
            </TouchableOpacity>
          )}
        </View>
        
        {textChannels.length === 0 ? (
          <Text style={styles.emptyChannelsText}>Metin kanalı yok</Text>
        ) : (
          <FlatList
            data={textChannels}
            renderItem={renderChannelItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        )}
        
        <View style={[styles.channelTypeHeader, styles.voiceChannelHeader]}>
          <Text style={styles.channelTypeTitle}>Ses Kanalları</Text>
          {groupDetails?.isAdmin && (
            <TouchableOpacity
              onPress={() => {
                setNewChannelType('voice');
                setCreateChannelModalVisible(true);
              }}
            >
              <Icon name="add" size={20} color="#7289da" />
            </TouchableOpacity>
          )}
        </View>
        
        {voiceChannels.length === 0 ? (
          <Text style={styles.emptyChannelsText}>Ses kanalı yok</Text>
        ) : (
          <FlatList
            data={voiceChannels}
            renderItem={renderChannelItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        )}
      </View>
      
      {/* Yeni Kanal Oluşturma Modal */}
      <Modal
        visible={createChannelModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateChannelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Kanal Oluştur</Text>
              <TouchableOpacity onPress={() => setCreateChannelModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Kanal Adı</Text>
                <TextInput
                  style={styles.input}
                  value={newChannelName}
                  onChangeText={setNewChannelName}
                  placeholder="Kanal adını girin"
                  maxLength={50}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Açıklama (İsteğe bağlı)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newChannelDescription}
                  onChangeText={setNewChannelDescription}
                  placeholder="Kanal açıklaması girin"
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Kanal Türü</Text>
                <View style={styles.channelTypeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.channelTypeOption,
                      newChannelType === 'text' && styles.channelTypeOptionSelected
                    ]}
                    onPress={() => setNewChannelType('text')}
                  >
                    <Icon
                      name="tag"
                      size={20}
                      color={newChannelType === 'text' ? '#fff' : '#7289da'}
                    />
                    <Text
                      style={[
                        styles.channelTypeText,
                        newChannelType === 'text' && styles.channelTypeTextSelected
                      ]}
                    >
                      Metin Kanalı
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.channelTypeOption,
                      newChannelType === 'voice' && styles.channelTypeOptionSelected
                    ]}
                    onPress={() => setNewChannelType('voice')}
                  >
                    <Icon
                      name="volume-up"
                      size={20}
                      color={newChannelType === 'voice' ? '#fff' : '#7289da'}
                    />
                    <Text
                      style={[
                        styles.channelTypeText,
                        newChannelType === 'voice' && styles.channelTypeTextSelected
                      ]}
                    >
                      Ses Kanalı
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <View style={styles.privateChannelContainer}>
                  <Text style={styles.inputLabel}>Özel Kanal</Text>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setNewChannelPrivate(!newChannelPrivate)}
                  >
                    <View
                      style={[
                        styles.toggleTrack,
                        newChannelPrivate && styles.toggleTrackActive
                      ]}
                    >
                      <View
                        style={[
                          styles.toggleThumb,
                          newChannelPrivate && styles.toggleThumbActive
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={styles.privateChannelDescription}>
                  Özel kanallar yalnızca belirli üyeler tarafından görülebilir ve erişilebilir.
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.createChannelButton}
                onPress={handleCreateChannel}
                disabled={isCreatingChannel}
              >
                {isCreatingChannel ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createChannelButtonText}>Kanal Oluştur</Text>
                )}
              </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 10,
  },
  groupInfoContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7289da',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  groupInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  groupInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
  },
  channelsContainer: {
    flex: 1,
    padding: 15,
  },
  channelTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  voiceChannelHeader: {
    marginTop: 20,
  },
  channelTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 5,
  },
  channelName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  privateIcon: {
    marginLeft: 5,
  },
  emptyChannelsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 15,
    marginBottom: 10,
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
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  channelTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  channelTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#7289da',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  channelTypeOptionSelected: {
    backgroundColor: '#7289da',
  },
  channelTypeText: {
    marginLeft: 5,
    color: '#7289da',
    fontWeight: 'bold',
  },
  channelTypeTextSelected: {
    color: '#fff',
  },
  privateChannelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privateChannelDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  toggleButton: {
    padding: 5,
  },
  toggleTrack: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: '#7289da',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginLeft: 2,
  },
  toggleThumbActive: {
    marginLeft: 28,
  },
  createChannelButton: {
    backgroundColor: '#7289da',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  createChannelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupDetailScreen;
