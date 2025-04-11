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

// Kullanıcının gruplarını getir
export const fetchUserGroups = async (token: string) => {
  return apiRequest('/api/groups', 'GET', token);
};

// Grup detaylarını getir
export const fetchGroupDetails = async (token: string, groupId: string) => {
  return apiRequest(`/api/groups/${groupId}`, 'GET', token);
};

// Yeni grup oluştur
export const createGroup = async (token: string, groupData: any) => {
  return apiRequest('/api/groups', 'POST', token, groupData);
};

// Grup bilgilerini güncelle
export const updateGroup = async (token: string, groupId: string, groupData: any) => {
  return apiRequest(`/api/groups/${groupId}`, 'PUT', token, groupData);
};

// Grubu sil
export const deleteGroup = async (token: string, groupId: string) => {
  return apiRequest(`/api/groups/${groupId}`, 'DELETE', token);
};

// Gruba kullanıcı davet et
export const inviteUserToGroup = async (token: string, groupId: string, userId: string) => {
  return apiRequest(`/api/groups/${groupId}/invite`, 'POST', token, { userId });
};

// Grup davetini kabul et
export const acceptGroupInvitation = async (token: string, invitationId: string) => {
  return apiRequest(`/api/invitations/${invitationId}/accept`, 'POST', token);
};

// Grup davetini reddet
export const rejectGroupInvitation = async (token: string, invitationId: string) => {
  return apiRequest(`/api/invitations/${invitationId}/reject`, 'POST', token);
};

// Gruptan çık
export const leaveGroup = async (token: string, groupId: string) => {
  return apiRequest(`/api/groups/${groupId}/leave`, 'POST', token);
};

// Grup üyelerini getir
export const fetchGroupMembers = async (token: string, groupId: string) => {
  return apiRequest(`/api/groups/${groupId}/members`, 'GET', token);
};

// Grup üyesini çıkar
export const removeGroupMember = async (token: string, groupId: string, userId: string) => {
  return apiRequest(`/api/groups/${groupId}/members/${userId}`, 'DELETE', token);
};

// Grup üyesinin rolünü güncelle
export const updateMemberRole = async (token: string, groupId: string, userId: string, role: string) => {
  return apiRequest(`/api/groups/${groupId}/members/${userId}/role`, 'PUT', token, { role });
};
