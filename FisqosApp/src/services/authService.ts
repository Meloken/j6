import { API_URL } from '../config';

// API isteği için yardımcı fonksiyon
const apiRequest = async (endpoint: string, method: string, data?: any, token?: string) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Giriş işlemi
export const apiLogin = async (username: string, password: string) => {
  return apiRequest('/api/auth/login', 'POST', { username, password });
};

// Kayıt işlemi
export const apiRegister = async (userData: any) => {
  return apiRequest('/api/auth/register', 'POST', userData);
};

// Çıkış işlemi
export const apiLogout = async (token: string) => {
  return apiRequest('/api/auth/logout', 'POST', {}, token);
};

// Kullanıcı bilgilerini getir
export const apiGetUserProfile = async (token: string) => {
  return apiRequest('/api/users/profile', 'GET', undefined, token);
};

// Kullanıcı bilgilerini güncelle
export const apiUpdateUserProfile = async (token: string, userData: any) => {
  return apiRequest('/api/users/profile', 'PUT', userData, token);
};

// Şifre değiştirme
export const apiChangePassword = async (token: string, currentPassword: string, newPassword: string) => {
  return apiRequest('/api/auth/change-password', 'POST', { currentPassword, newPassword }, token);
};

// Şifre sıfırlama isteği
export const apiRequestPasswordReset = async (email: string) => {
  return apiRequest('/api/auth/forgot-password', 'POST', { email });
};

// Şifre sıfırlama
export const apiResetPassword = async (token: string, newPassword: string) => {
  return apiRequest('/api/auth/reset-password', 'POST', { token, newPassword });
};
