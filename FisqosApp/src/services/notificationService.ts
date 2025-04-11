import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

// FCM token için AsyncStorage anahtarı
const FCM_TOKEN_KEY = 'fcm_token';

/**
 * Bildirim izinlerini kontrol eder ve gerekirse ister
 * @returns İzin durumu
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    return enabled;
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

/**
 * FCM token'ı alır ve kaydeder
 * @returns FCM token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // AsyncStorage'dan mevcut token'ı kontrol et
    const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    
    if (storedToken) {
      return storedToken;
    }
    
    // Yeni token al
    const fcmToken = await messaging().getToken();
    
    if (fcmToken) {
      // Token'ı AsyncStorage'a kaydet
      await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
      return fcmToken;
    }
    
    return null;
  } catch (error) {
    console.error('Get FCM token error:', error);
    return null;
  }
};

/**
 * FCM token'ı sunucuya kaydeder
 * @param token FCM token
 * @param userId Kullanıcı ID
 * @param authToken Kimlik doğrulama token'ı
 */
export const registerFCMTokenToServer = async (
  token: string,
  userId: string,
  authToken: string
): Promise<boolean> => {
  try {
    // API endpoint'i ve istek parametreleri
    const endpoint = 'https://api.fisqos.com/v1/users/fcm-token';
    const deviceType = Platform.OS;
    
    // API isteği
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        userId,
        token,
        deviceType,
      }),
    });
    
    if (response.ok) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Register FCM token error:', error);
    return false;
  }
};

/**
 * Bildirim dinleyicilerini ayarlar
 * @param onNotification Bildirim alındığında çağrılacak fonksiyon
 * @param onNotificationOpened Bildirim açıldığında çağrılacak fonksiyon
 */
export const setupNotificationListeners = (
  onNotification: (notification: any) => void,
  onNotificationOpened: (notification: any) => void
) => {
  // Uygulama ön plandayken bildirim alındığında
  const foregroundSubscription = messaging().onMessage(async (remoteMessage) => {
    onNotification(remoteMessage);
  });
  
  // Uygulama arka plandayken bildirim açıldığında
  const backgroundSubscription = messaging().onNotificationOpenedApp((remoteMessage) => {
    onNotificationOpened(remoteMessage);
  });
  
  // Uygulama kapalıyken bildirim açıldığında
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        onNotificationOpened(remoteMessage);
      }
    });
  
  // Dinleyicileri temizleme fonksiyonu
  return () => {
    foregroundSubscription();
    backgroundSubscription();
  };
};

/**
 * Bildirim kanalı oluşturur (Android için)
 * @param channelId Kanal ID
 * @param channelName Kanal adı
 * @param channelDescription Kanal açıklaması
 */
export const createNotificationChannel = async (
  channelId: string,
  channelName: string,
  channelDescription: string
): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      await messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message:', remoteMessage);
      });
      
      // Android için bildirim kanalı oluştur
      // Not: React Native Firebase, bildirim kanallarını otomatik olarak yönetir
    } catch (error) {
      console.error('Create notification channel error:', error);
    }
  }
};
