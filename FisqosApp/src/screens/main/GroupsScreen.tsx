import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserGroups, createGroup } from '../../services/groupService';
import { MainStackParamList } from '../../navigation/AppNavigator';

type GroupsScreenNavigationProp = StackNavigationProp<MainStackParamList>;

interface Group {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount: number;
  isAdmin?: boolean;
}

const GroupsScreen: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { token } = useAuth();
  const navigation = useNavigation<GroupsScreenNavigationProp>();

  useEffect(() => {
    if (token) {
      loadGroups();
    }
  }, [token]);

  const loadGroups = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetchUserGroups(token);

      if (response.success) {
        setGroups(response.data.groups);
      } else {
        Alert.alert('Hata', response.message || 'Gruplar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Hata', 'Gruplar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadGroups();
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Hata', 'Grup adı gereklidir');
      return;
    }

    if (!token) return;

    try {
      setIsCreating(true);

      const groupData = {
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
      };

      const response = await createGroup(token, groupData);

      if (response.success) {
        setModalVisible(false);
        setNewGroupName('');
        setNewGroupDescription('');

        // Yeni grubu listeye ekle
        const newGroup = response.data.group;
        setGroups(prevGroups => [...prevGroups, newGroup]);

        // Yeni gruba git
        navigation.navigate('GroupDetail', {
          groupId: newGroup._id,
          groupName: newGroup.name,
        });
      } else {
        Alert.alert('Hata', response.message || 'Grup oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Hata', 'Grup oluşturulurken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  const navigateToGroup = (groupId: string, groupName: string) => {
    navigation.navigate('GroupDetail', { groupId, groupName });
  };

  const filteredGroups = searchQuery
    ? groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : groups;

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => navigateToGroup(item._id, item.name)}
    >
      <View style={styles.groupImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.groupImage} />
        ) : (
          <Text style={styles.groupInitial}>{item.name.charAt(0).toUpperCase()}</Text>
        )}
      </View>

      <View style={styles.groupInfo}>
        <View style={styles.groupNameContainer}>
          <Text style={styles.groupName}>{item.name}</Text>
          {item.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>

        {item.description ? (
          <Text style={styles.groupDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <Text style={styles.memberCount}>{item.memberCount} üye</Text>
      </View>

      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Grup ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7289da" />
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="group" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? 'Arama sonucu bulunamadı'
                  : 'Henüz hiçbir gruba üye değilsiniz'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Farklı anahtar kelimelerle tekrar deneyin'
                  : 'Yeni bir grup oluşturmak için sağ üstteki + butonuna tıklayın'}
              </Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#7289da']}
              tintColor="#7289da"
            />
          }
        />
      )}

      {/* Yeni Grup Oluşturma Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Grup Oluştur</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Grup Adı</Text>
                <TextInput
                  style={styles.input}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder="Grup adını girin"
                  maxLength={50}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Açıklama (İsteğe bağlı)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newGroupDescription}
                  onChangeText={setNewGroupDescription}
                  placeholder="Grup açıklaması girin"
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />
              </View>

              <TouchableOpacity
                style={styles.createGroupButton}
                onPress={handleCreateGroup}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createGroupButtonText}>Grup Oluştur</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#7289da',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  groupItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  groupImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7289da',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  groupInfo: {
    flex: 1,
  },
  groupNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  adminBadge: {
    backgroundColor: '#43b581',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createGroupButton: {
    backgroundColor: '#7289da',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  createGroupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupsScreen;
