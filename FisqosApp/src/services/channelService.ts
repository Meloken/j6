import { API_URL } from '../config';

// API isteği için yardımcı fonksiyon
const apiRequest = async (endpoint: string, method: string, token: string, data?: any) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

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

// Grup kanallarını getir
export const fetchGroupChannels = async (token: string, groupId: string) => {
  return apiRequest(`/api/groups/${groupId}/channels`, 'GET', token);
};

// Kanal detaylarını getir
export const fetchChannelDetails = async (token: string, channelId: string) => {
  return apiRequest(`/api/channels/${channelId}`, 'GET', token);
};

// Yeni kanal oluştur
export const createChannel = async (token: string, groupId: string, channelData: any) => {
  return apiRequest(`/api/groups/${groupId}/channels`, 'POST', token, channelData);
};

// Kanal bilgilerini güncelle
export const updateChannel = async (token: string, channelId: string, channelData: any) => {
  return apiRequest(`/api/channels/${channelId}`, 'PUT', token, channelData);
};

// Kanalı sil
export const deleteChannel = async (token: string, channelId: string) => {
  return apiRequest(`/api/channels/${channelId}`, 'DELETE', token);
};

// Kanal mesajlarını getir
export const fetchChannelMessages = async (token: string, channelId: string, page: number = 1, limit: number = 50) => {
  return apiRequest(`/api/channels/${channelId}/messages?page=${page}&limit=${limit}`, 'GET', token);
};

// Mesaj gönder
export const sendMessage = async (token: string, channelId: string, content: string, attachments: any[] = []) => {
  return apiRequest(`/api/channels/${channelId}/messages`, 'POST', token, { content, attachments });
};

// Mesajı düzenle
export const editMessage = async (token: string, messageId: string, content: string) => {
  return apiRequest(`/api/messages/${messageId}`, 'PUT', token, { content });
};

// Mesajı sil
export const deleteMessage = async (token: string, messageId: string) => {
  return apiRequest(`/api/messages/${messageId}`, 'DELETE', token);
};

// Dosya yükle
export const uploadFile = async (token: string, channelId: string, file: any) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/api/channels/${channelId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    return await response.json();
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};
