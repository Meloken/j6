import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Input } from '../../components/common';
import { apiUpdateUserProfile, apiChangePassword } from '../../services/authService';

const ProfileScreen: React.FC = () => {
  const { user, token, updateUser, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  const handleSaveProfile = async () => {
    if (!token) return;
    
    try {
      setIsSaving(true);
      
      const userData = {
        name,
        surname,
        email,
      };
      
      const response = await apiUpdateUserProfile(token, userData);
      
      if (response.success) {
        updateUser(userData);
        setIsEditing(false);
        Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
      } else {
        Alert.alert('Hata', response.message || 'Profil güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!token) return;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const response = await apiChangePassword(token, currentPassword, newPassword);
      
      if (response.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
        Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi');
      } else {
        Alert.alert('Hata', response.message || 'Şifre değiştirilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Hata', 'Şifre değiştirilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.defaultProfileImage}>
              <Text style={styles.profileInitial}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.editImageButton}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.username}>{user?.username}</Text>
      </View>
      
      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Icon name="edit" size={20} color="#7289da" />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        
        {isEditing ? (
          <View>
            <Input
              label="Ad"
              value={name}
              onChangeText={setName}
              placeholder="Adınız"
            />
            
            <Input
              label="Soyad"
              value={surname}
              onChangeText={setSurname}
              placeholder="Soyadınız"
            />
            
            <Input
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta adresiniz"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.buttonContainer}>
              <Button
                title="İptal"
                onPress={() => {
                  setIsEditing(false);
                  setName(user?.name || '');
                  setSurname(user?.surname || '');
                  setEmail(user?.email || '');
                }}
                type="secondary"
                style={{ flex: 1, marginRight: 8 }}
              />
              
              <Button
                title="Kaydet"
                onPress={handleSaveProfile}
                loading={isSaving}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ad:</Text>
              <Text style={styles.infoValue}>{user?.name || '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Soyad:</Text>
              <Text style={styles.infoValue}>{user?.surname || '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-posta:</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>
        )}
      </Card>
      
      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
          {!isChangingPassword ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsChangingPassword(true)}
            >
              <Icon name="lock" size={20} color="#7289da" />
              <Text style={styles.editButtonText}>Değiştir</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        
        {isChangingPassword ? (
          <View>
            <Input
              label="Mevcut Şifre"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Mevcut şifreniz"
              secureTextEntry
            />
            
            <Input
              label="Yeni Şifre"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Yeni şifreniz"
              secureTextEntry
            />
            
            <Input
              label="Yeni Şifre Tekrar"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Yeni şifrenizi tekrar girin"
              secureTextEntry
            />
            
            <View style={styles.buttonContainer}>
              <Button
                title="İptal"
                onPress={() => {
                  setIsChangingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                type="secondary"
                style={{ flex: 1, marginRight: 8 }}
              />
              
              <Button
                title="Değiştir"
                onPress={handleChangePassword}
                loading={isSaving}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <Text style={styles.passwordInfo}>
            Şifrenizi değiştirmek için "Değiştir" butonuna tıklayın.
          </Text>
        )}
      </Card>
      
      <Card>
        <Text style={styles.sectionTitle}>Uygulama Ayarları</Text>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Karanlık Mod</Text>
            <Text style={styles.settingDescription}>
              Uygulamayı karanlık temada görüntüle
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#ddd', true: '#7289da' }}
            thumbColor={darkMode ? '#fff' : '#fff'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Bildirimler</Text>
            <Text style={styles.settingDescription}>
              Yeni mesaj ve etkinlik bildirimlerini al
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#ddd', true: '#7289da' }}
            thumbColor={notifications ? '#fff' : '#fff'}
          />
        </View>
      </Card>
      
      <Button
        title="Çıkış Yap"
        onPress={handleLogout}
        type="danger"
        style={styles.logoutButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#7289da',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  defaultProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5a6cbd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7289da',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 4,
    color: '#7289da',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  passwordInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
  logoutButton: {
    margin: 16,
  },
});

export default ProfileScreen;
