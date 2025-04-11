import { Platform } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { APP_CONFIG } from '../config';

/**
 * Dosya türleri
 */
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

/**
 * Dosya bilgileri
 */
export interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size: number;
  fileType: FileType;
}

/**
 * Dosya türünü belirler
 * @param mimeType MIME türü
 * @returns Dosya türü
 */
export const getFileType = (mimeType: string): FileType => {
  if (mimeType.startsWith('image/')) {
    return FileType.IMAGE;
  } else if (mimeType.startsWith('video/')) {
    return FileType.VIDEO;
  } else if (mimeType.startsWith('audio/')) {
    return FileType.AUDIO;
  } else if (
    mimeType === 'application/pdf' ||
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-powerpoint' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimeType === 'text/plain'
  ) {
    return FileType.DOCUMENT;
  } else {
    return FileType.OTHER;
  }
};

/**
 * Dosya boyutunu formatlar
 * @param bytes Bayt cinsinden boyut
 * @param decimals Ondalık basamak sayısı
 * @returns Formatlanmış dosya boyutu
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Dosya boyutunu kontrol eder
 * @param size Dosya boyutu
 * @param fileType Dosya türü
 * @returns Geçerli mi?
 */
export const isValidFileSize = (size: number, fileType: FileType): boolean => {
  switch (fileType) {
    case FileType.IMAGE:
      return size <= APP_CONFIG.maxImageUploadSize;
    case FileType.VIDEO:
      return size <= APP_CONFIG.maxVideoUploadSize;
    case FileType.AUDIO:
      return size <= APP_CONFIG.maxAudioUploadSize;
    default:
      return size <= APP_CONFIG.maxFileUploadSize;
  }
};

/**
 * Dosya türünü kontrol eder
 * @param mimeType MIME türü
 * @returns Geçerli mi?
 */
export const isValidFileType = (mimeType: string): boolean => {
  // İzin verilen MIME türleri
  const allowedMimeTypes = [
    // Resimler
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    
    // Videolar
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    
    // Sesler
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
    
    // Belgeler
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];
  
  return allowedMimeTypes.includes(mimeType);
};

/**
 * Dosya uzantısından MIME türünü tahmin eder
 * @param filename Dosya adı
 * @returns MIME türü
 */
export const getMimeTypeFromFilename = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const mimeTypes: Record<string, string> = {
    // Resimler
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    
    // Videolar
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    
    // Sesler
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    
    // Belgeler
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Kamera izinlerini kontrol eder
 * @returns İzin durumu
 */
export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;
    
    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) {
      return true;
    } else if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }
    
    return false;
  } catch (error) {
    console.error('Check camera permission error:', error);
    return false;
  }
};

/**
 * Galeri izinlerini kontrol eder
 * @returns İzin durumu
 */
export const checkGalleryPermission = async (): Promise<boolean> => {
  try {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.PHOTO_LIBRARY
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    
    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) {
      return true;
    } else if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }
    
    return false;
  } catch (error) {
    console.error('Check gallery permission error:', error);
    return false;
  }
};

/**
 * Galeriden resim seçer
 * @returns Dosya bilgileri
 */
export const pickImage = async (): Promise<FileInfo | null> => {
  try {
    const hasPermission = await checkGalleryPermission();
    if (!hasPermission) {
      return null;
    }
    
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1280,
      maxHeight: 1280,
    });
    
    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return null;
    }
    
    const asset = result.assets[0];
    
    if (!asset.uri || !asset.fileName || !asset.type || !asset.fileSize) {
      return null;
    }
    
    const fileType = getFileType(asset.type);
    
    if (!isValidFileType(asset.type)) {
      throw new Error('Geçersiz dosya türü');
    }
    
    if (!isValidFileSize(asset.fileSize, fileType)) {
      throw new Error(`Dosya boyutu çok büyük (Maksimum: ${formatFileSize(APP_CONFIG.maxImageUploadSize)})`);
    }
    
    return {
      uri: asset.uri,
      name: asset.fileName,
      type: asset.type,
      size: asset.fileSize,
      fileType,
    };
  } catch (error) {
    console.error('Pick image error:', error);
    throw error;
  }
};

/**
 * Kameradan resim çeker
 * @returns Dosya bilgileri
 */
export const takePhoto = async (): Promise<FileInfo | null> => {
  try {
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      return null;
    }
    
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1280,
      maxHeight: 1280,
    });
    
    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return null;
    }
    
    const asset = result.assets[0];
    
    if (!asset.uri || !asset.fileName || !asset.type || !asset.fileSize) {
      return null;
    }
    
    const fileType = getFileType(asset.type);
    
    if (!isValidFileType(asset.type)) {
      throw new Error('Geçersiz dosya türü');
    }
    
    if (!isValidFileSize(asset.fileSize, fileType)) {
      throw new Error(`Dosya boyutu çok büyük (Maksimum: ${formatFileSize(APP_CONFIG.maxImageUploadSize)})`);
    }
    
    return {
      uri: asset.uri,
      name: asset.fileName,
      type: asset.type,
      size: asset.fileSize,
      fileType,
    };
  } catch (error) {
    console.error('Take photo error:', error);
    throw error;
  }
};
