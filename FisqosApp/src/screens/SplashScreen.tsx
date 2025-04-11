import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isLoading, token } = useAuth();
  const navigation = useNavigation<SplashScreenNavigationProp>();
  
  // Animasyon değerleri
  const logoOpacity = new Animated.Value(0);
  const logoScale = new Animated.Value(0.3);
  
  useEffect(() => {
    // Logo animasyonu
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Yönlendirme
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (token) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        }
      }
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [isLoading, token, navigation]);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../assets/splash/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.6,
    height: height * 0.3,
  },
});

export default SplashScreen;
