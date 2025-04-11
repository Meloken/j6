import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { storage } from '../utils/storage';

// API URL
const API_BASE_URL = 'https://api.fisqos.com/v1';

// API istek zaman aşımı (ms)
const API_TIMEOUT = 30000;

// API istek türleri
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API istek seçenekleri
interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  requiresAuth?: boolean;
  useCache?: boolean;
  cacheKey?: string;
  cacheTTL?: number; // Saniye cinsinden
}

// API yanıt türü
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  fromCache?: boolean;
}

/**
 * API isteği gönderir
 * @param endpoint API endpoint'i
 * @param options İstek seçenekleri
 * @returns API yanıtı
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  // Varsayılan seçenekler
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_TIMEOUT,
    requiresAuth = true,
    useCache = false,
    cacheKey,
    cacheTTL = 300, // 5 dakika
  } = options;
  
  // Önbellekten veri al
  if (useCache && method === 'GET') {
    const cacheKeyToUse = cacheKey || `api_cache_${endpoint}`;
    const cachedData = await storage.get<{
      data: T;
      timestamp: number;
    }>(cacheKeyToUse);
    
    if (cachedData) {
      const now = Date.now();
      const cacheAge = (now - cachedData.timestamp) / 1000; // Saniye cinsinden
      
      if (cacheAge < cacheTTL) {
        return {
          success: true,
          data: cachedData.data,
          fromCache: true,
        };
      }
    }
  }
  
  // İnternet bağlantısını kontrol et
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    return {
      success: false,
      message: 'İnternet bağlantısı yok',
      statusCode: 0,
    };
  }
  
  try {
    // Kimlik doğrulama token'ı
    if (requiresAuth) {
      const token = await storage.get<string>('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        return {
          success: false,
          message: 'Kimlik doğrulama token\'ı bulunamadı',
          statusCode: 401,
        };
      }
    }
    
    // İstek seçenekleri
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': `FisqosApp/${Platform.OS}`,
        ...headers,
      },
    };
    
    // İstek gövdesi
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }
    
    // Zaman aşımı kontrolü için Promise.race kullan
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => {
        reject(new Error('İstek zaman aşımına uğradı'));
      }, timeout);
    });
    
    // API isteği
    const fetchPromise = fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
    
    // Yanıt durumunu kontrol et
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `HTTP error: ${response.status}`,
        statusCode: response.status,
        data: errorData,
      };
    }
    
    // Yanıt verilerini ayrıştır
    const responseData = await response.json() as T;
    
    // Önbelleğe kaydet
    if (useCache && method === 'GET') {
      const cacheKeyToUse = cacheKey || `api_cache_${endpoint}`;
      await storage.set(cacheKeyToUse, {
        data: responseData,
        timestamp: Date.now(),
      });
    }
    
    return {
      success: true,
      data: responseData,
      statusCode: response.status,
    };
  } catch (error) {
    console.error(`API request error (${endpoint}):`, error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      statusCode: 0,
    };
  }
};

/**
 * API önbelleğini temizler
 * @param pattern Önbellek anahtarı deseni (regex)
 */
export const clearApiCache = async (pattern?: RegExp): Promise<void> => {
  try {
    const keys = await storage.getAllKeys();
    const cacheKeys = keys.filter(key => 
      key.startsWith('api_cache_') && (!pattern || pattern.test(key))
    );
    
    if (cacheKeys.length > 0) {
      await storage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Clear API cache error:', error);
  }
};
