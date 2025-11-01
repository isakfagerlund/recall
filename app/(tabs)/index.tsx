import { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Contact } from '@/types';
import {
  getAllContacts,
  requestContactsPermission,
  checkContactsPermission,
  searchContacts,
} from '@/services/contacts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) => {
        const query = searchQuery.toLowerCase();
        return (
          contact.name.toLowerCase().includes(query) ||
          contact.firstName?.toLowerCase().includes(query) ||
          contact.lastName?.toLowerCase().includes(query)
        );
      });
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  async function loadContacts() {
    try {
      setLoading(true);

      // Check permission
      const hasExistingPermission = await checkContactsPermission();

      if (!hasExistingPermission) {
        // Request permission
        const granted = await requestContactsPermission();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Recall needs access to your contacts to help you take notes about the people you know.',
            [{ text: 'OK' }]
          );
          setHasPermission(false);
          setLoading(false);
          return;
        }
      }

      setHasPermission(true);

      // Load contacts
      const allContacts = await getAllContacts();
      setContacts(allContacts);
      setFilteredContacts(allContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleContactPress(contact: Contact) {
    router.push(`/contact/${contact.id}` as any);
  }

  function renderContact({ item }: { item: Contact }) {
    const initials = getInitials(item);

    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          { borderBottomColor: Colors[colorScheme ?? 'light'].border },
        ]}
        onPress={() => handleContactPress(item)}>
        <View
          style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
          <ThemedText style={styles.avatarText}>{initials}</ThemedText>
        </View>
        <View style={styles.contactInfo}>
          <ThemedText style={styles.contactName}>{item.name}</ThemedText>
          {item.phoneNumbers && item.phoneNumbers.length > 0 && (
            <ThemedText style={styles.contactDetail}>
              {item.phoneNumbers[0].number}
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  function getInitials(contact: Contact): string {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
    }
    if (contact.firstName) {
      return contact.firstName.slice(0, 2).toUpperCase();
    }
    if (contact.name) {
      const parts = contact.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return contact.name.slice(0, 2).toUpperCase();
    }
    return '??';
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText style={styles.loadingText}>Loading contacts...</ThemedText>
      </ThemedView>
    );
  }

  if (!hasPermission) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>No contacts permission</ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={loadContacts}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Contacts
        </ThemedText>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              borderColor: Colors[colorScheme ?? 'light'].border,
              color: Colors[colorScheme ?? 'light'].text,
            },
          ]}
          placeholder="Search contacts..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedView style={styles.centered}>
            <ThemedText style={styles.emptyText}>No contacts found</ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    marginBottom: 16,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 14,
    opacity: 0.6,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
