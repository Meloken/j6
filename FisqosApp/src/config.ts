// API ve Socket.IO sunucu adresleri
export const API_URL = 'http://192.168.1.100:3000'; // Geliştirme ortamında yerel IP adresinizi kullanın
export const SOCKET_URL = 'http://192.168.1.100:3000'; // Socket.IO sunucusu

// WebRTC ve Mediasoup yapılandırması
export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

// Uygulama ayarları
export const APP_SETTINGS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'audio/mp3', 'video/mp4', 'application/pdf'],
  messagePageSize: 50,
  userListPageSize: 20
};
