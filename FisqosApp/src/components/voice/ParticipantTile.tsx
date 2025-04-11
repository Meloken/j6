import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from '../common';

interface ParticipantTileProps {
  userId: string;
  username: string;
  stream?: any;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isCurrentUser: boolean;
}

const ParticipantTile: React.FC<ParticipantTileProps> = ({
  userId,
  username,
  stream,
  isMuted,
  isVideoEnabled,
  isCurrentUser,
}) => {
  return (
    <View style={styles.container}>
      {stream && isVideoEnabled ? (
        <RTCView
          streamURL={stream.toURL()}
          style={styles.videoStream}
          objectFit="cover"
        />
      ) : (
        <View style={styles.avatarContainer}>
          <Avatar
            name={username}
            size={80}
          />
        </View>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.username}>
          {username} {isCurrentUser ? '(Sen)' : ''}
        </Text>
        
        <View style={styles.statusContainer}>
          {isMuted && (
            <View style={styles.statusIconContainer}>
              <Icon name="mic-off" size={16} color="#f04747" />
            </View>
          )}
          
          {isVideoEnabled && (
            <View style={styles.statusIconContainer}>
              <Icon name="videocam" size={16} color="#43b581" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
    backgroundColor: '#2f3136',
    borderRadius: 8,
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
    backgroundColor: '#36393f',
  },
  infoContainer: {
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
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusIconContainer: {
    marginLeft: 6,
  },
});

export default ParticipantTile;
