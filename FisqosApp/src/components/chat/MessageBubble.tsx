import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from '../common';

interface Attachment {
  url: string;
  type: string;
  name: string;
}

interface MessageBubbleProps {
  content: string;
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  createdAt: string;
  isCurrentUser: boolean;
  isEdited?: boolean;
  attachments?: Attachment[];
  onLongPress?: () => void;
  onAttachmentPress?: (attachment: Attachment) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  sender,
  createdAt,
  isCurrentUser,
  isEdited,
  attachments,
  onLongPress,
  onAttachmentPress,
}) => {
  const messageDate = new Date(createdAt);
  const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
      ]}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      delayLongPress={300}
    >
      {!isCurrentUser && (
        <View style={styles.avatarContainer}>
          <Avatar
            uri={sender.profilePicture}
            name={sender.username}
            size={30}
          />
        </View>
      )}
      
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        {!isCurrentUser && (
          <Text style={styles.senderName}>{sender.username}</Text>
        )}
        
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText
        ]}>
          {content}
        </Text>
        
        {attachments && attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {attachments.map((attachment, index) => (
              <TouchableOpacity
                key={index}
                style={styles.attachment}
                onPress={() => onAttachmentPress && onAttachmentPress(attachment)}
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
                  color={isCurrentUser ? '#fff' : '#7289da'}
                />
                <Text
                  style={[
                    styles.attachmentName,
                    isCurrentUser ? styles.currentUserText : styles.otherUserText
                  ]}
                  numberOfLines={1}
                >
                  {attachment.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={[
            styles.timeText,
            isCurrentUser ? styles.currentUserTimeText : styles.otherUserTimeText
          ]}>
            {formattedTime}
          </Text>
          
          {isEdited && (
            <Text style={[
              styles.editedText,
              isCurrentUser ? styles.currentUserTimeText : styles.otherUserTimeText
            ]}>
              (düzenlendi)
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 8,
    maxWidth: '80%',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 18,
    padding: 12,
    maxWidth: '100%',
  },
  currentUserBubble: {
    backgroundColor: '#7289da',
  },
  otherUserBubble: {
    backgroundColor: '#f0f0f0',
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserText: {
    color: '#333',
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  attachmentName: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
  },
  currentUserTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTimeText: {
    color: '#999',
  },
  editedText: {
    fontSize: 12,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

export default MessageBubble;
