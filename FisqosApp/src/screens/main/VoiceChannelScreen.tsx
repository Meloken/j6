import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RTCView } from 'react-native-webrtc';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import webrtcService from '../../services/webrtcService';
import { MainStackParamList } from '../../navigation/AppNavigator';

type VoiceChannelScreenRouteProp = RouteProp<MainStackParamList, 'VoiceChannel'>;
type VoiceChannelScreenNavigationProp = StackNavigationProp<MainStackParamList, 'VoiceChannel'>;

interface VoiceChannelScreenProps {
  route: VoiceChannelScreenRouteProp;
  navigation: VoiceChannelScreenNavigationProp;
}

interface Participant {
  userId: string;
  username: string;
  stream?: any;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

const VoiceChannelScreen: React.FC<VoiceChannelScreenProps> = ({ route, navigation }) => {
  const { channelId, channelName } = route.params;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  
  const { token, user } = useAuth();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    navigation.setOptions({
      title: channelName,
      headerLeft: () => (
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeaveChannel}
        >
          <Icon name="call-end" size={20} color="#fff" />
        </TouchableOpacity>
      ),
    });
    
    if (token && user && socket && isConnected) {
      joinVoiceChannel();
    }
    
    return () => {
      leaveVoiceChannel();
    };
  }, [token, user, socket, isConnected]);

  useEffect(() => {
    if (socket && isConnected) {
      // Yeni katılımcı geldiğinde
      socket.on('user_joined_voice', (data) => {
        if (data.channelId === channelId) {
          setParticipants(prev => [
            ...prev,
            {
              userId: data.userId,
              username: data.username,
              isMuted: data.isMuted,
              isVideoEnabled: data.isVideoEnabled,
            }
          ]);
        }
      });
      
      // Katılımcı ayrıldığında
      socket.on('user_left_voice', (data) => {
        if (data.channelId === channelId) {
          setParticipants(prev => 
            prev.filter(p => p.userId !== data.userId)
          );
        }
      });
      
      // Katılımcı durumu değiştiğinde
      socket.on('user_voice_state_changed', (data) => {
        if (data.channelId === channelId) {
          setParticipants(prev => 
            prev.map(p => 
              p.userId === data.userId
                ? { ...p, isMuted: data.isMuted, isVideoEnabled: data.isVideoEnabled }
                : p
            )
          );
        }
      });
      
      return () => {
        socket.off('user_joined_voice');
        socket.off('user_left_voice');
        socket.off('user_voice_state_changed');
      };
    }
  }, [socket, isConnected, channelId]);

  const joinVoiceChannel = async () => {
    if (!user || !socket) return;
    
    try {
      setIsJoining(true);
      
      // WebRTC servisini yapılandır
      webrtcService.setSocket(socket);
      webrtcService.setUserId(user.id);
      
      // Uzak akış callback'ini ayarla
      webrtcService.setOnRemoteStream((userId, stream) => {
        setParticipants(prev => 
          prev.map(p => 
            p.userId === userId ? { ...p, stream } : p
          )
        );
      });
      
      // Kullanıcı ayrıldı callback'ini ayarla
      webrtcService.setOnUserDisconnected((userId) => {
        setParticipants(prev => 
          prev.filter(p => p.userId !== userId)
        );
      });
      
      // Sesli kanala katıl
      const stream = await webrtcService.joinVoiceChannel(channelId, !isVideoEnabled);
      setLocalStream(stream);
      
      // Mevcut katılımcıları al
      socket.emit('get_voice_participants', { channelId }, (response: any) => {
        if (response.success) {
          setParticipants(response.participants);
        }
      });
      
      // Kendini katılımcı listesine ekle
      if (user) {
        setParticipants(prev => [
          ...prev,
          {
            userId: user.id,
            username: user.username,
            stream,
            isMuted,
            isVideoEnabled,
          }
        ]);
      }
    } catch (error) {
      console.error('Error joining voice channel:', error);
      Alert.alert(
        'Bağlantı Hatası',
        'Sesli kanala bağlanırken bir hata oluştu. Lütfen mikrofon izinlerinizi kontrol edin ve tekrar deneyin.',
        [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setIsJoining(false);
    }
  };

  const leaveVoiceChannel = () => {
    webrtcService.leaveVoiceChannel();
    
    if (localStream) {
      localStream.getTracks().forEach((track: any) => track.stop());
      setLocalStream(null);
    }
  };

  const handleLeaveChannel = () => {
    leaveVoiceChannel();
    navigation.goBack();
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    webrtcService.toggleMute(newMuteState);
    
    // Diğer kullanıcılara bildir
    if (socket && user) {
      socket.emit('voice_state_changed', {
        channelId,
        userId: user.id,
        isMuted: newMuteState,
        isVideoEnabled,
      });
    }
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    webrtcService.toggleVideo(!newVideoState);
    
    // Diğer kullanıcılara bildir
    if (socket && user) {
      socket.emit('voice_state_changed', {
        channelId,
        userId: user.id,
        isMuted,
        isVideoEnabled: newVideoState,
      });
    }
  };

  const toggleScreenShare = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Desteklenmiyor',
        'Ekran paylaşımı şu anda mobil cihazlarda desteklenmiyor.'
      );
      return;
    }
    
    const newScreenShareState = !isScreenSharing;
    
    if (newScreenShareState) {
      const success = await webrtcService.startScreenSharing();
      if (success) {
        setIsScreenSharing(true);
      }
    } else {
      // Ekran paylaşımını durdur
      setIsScreenSharing(false);
    }
  };

  const renderParticipant = ({ item }: { item: Participant }) => {
    const isCurrentUser = item.userId === user?.id;
    
    return (
      <View style={styles.participantContainer}>
        {item.stream && item.isVideoEnabled ? (
          <RTCView
            streamURL={item.stream.toURL()}
            style={styles.videoStream}
            objectFit="cover"
          />
        ) : (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>
            {item.username} {isCurrentUser ? '(Sen)' : ''}
          </Text>
          
          <View style={styles.statusIcons}>
            {item.isMuted && (
              <Icon name="mic-off" size={16} color="#f04747" style={styles.statusIcon} />
            )}
            {item.isVideoEnabled && (
              <Icon name="videocam" size={16} color="#43b581" style={styles.statusIcon} />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isJoining) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7289da" />
        <Text style={styles.loadingText}>Sesli kanala bağlanıyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.participantsContainer}>
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.userId}
          numColumns={2}
          contentContainerStyle={styles.participantsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="person-off" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Kanalda başka kimse yok</Text>
            </View>
          }
        />
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Icon
            name={isMuted ? 'mic-off' : 'mic'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, isVideoEnabled && styles.controlButtonActive]}
          onPress={toggleVideo}
        >
          <Icon
            name={isVideoEnabled ? 'videocam' : 'videocam-off'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, isScreenSharing && styles.controlButtonActive]}
          onPress={toggleScreenShare}
        >
          <Icon
            name="screen-share"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleLeaveChannel}
        >
          <Icon name="call-end" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#36393f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36393f',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  leaveButton: {
    backgroundColor: '#f04747',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  participantsContainer: {
    flex: 1,
  },
  participantsList: {
    padding: 10,
  },
  participantContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: '#2f3136',
    borderRadius: 10,
    overflow: 'hidden',
    height: 200,
  },
  videoStream: {
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7289da',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  participantInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusIcons: {
    flexDirection: 'row',
  },
  statusIcon: {
    marginLeft: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#2f3136',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4f545c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#7289da',
  },
  endCallButton: {
    backgroundColor: '#f04747',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default VoiceChannelScreen;
