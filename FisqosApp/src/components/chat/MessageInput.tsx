import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MessageInputProps {
  onSend: (text: string) => void;
  onAttach?: () => void;
  placeholder?: string;
  isSending?: boolean;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onAttach,
  placeholder = 'Mesajınızı yazın...',
  isSending = false,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  
  const handleSend = () => {
    if (text.trim() && !isSending && !disabled) {
      onSend(text);
      setText('');
    }
  };
  
  return (
    <View style={styles.container}>
      {onAttach && (
        <TouchableOpacity
          style={styles.attachButton}
          onPress={onAttach}
          disabled={disabled}
        >
          <Icon name="attach-file" size={24} color="#7289da" />
        </TouchableOpacity>
      )}
      
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        maxLength={2000}
        editable={!disabled}
      />
      
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!text.trim() || isSending || disabled) ? styles.sendButtonDisabled : null
        ]}
        onPress={handleSend}
        disabled={!text.trim() || isSending || disabled}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="send" size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
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
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
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
});

export default MessageInput;
