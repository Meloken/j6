import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  textStyle?: TextStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 40,
  containerStyle,
  imageStyle,
  textStyle,
}) => {
  const getInitials = (name: string) => {
    if (!name) return '';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      return (
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      );
    }
  };
  
  const containerStyles = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    containerStyle,
  ];
  
  const imageStyles = [
    styles.image,
    { width: size, height: size, borderRadius: size / 2 },
    imageStyle,
  ];
  
  const textStyles = [
    styles.text,
    { fontSize: size * 0.4 },
    textStyle,
  ];
  
  return (
    <View style={containerStyles}>
      {uri ? (
        <Image source={{ uri }} style={imageStyles} />
      ) : (
        <Text style={textStyles}>{getInitials(name)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7289da',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Avatar;
