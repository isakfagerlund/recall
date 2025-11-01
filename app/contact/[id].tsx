import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  ScrollView,
  View,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ContactWithNote } from '@/types';
import { getContactWithNote } from '@/services/contacts';
import { saveNote, deleteNote } from '@/services/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contact, setContact] = useState<ContactWithNote | null>(null);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadContact();
  }, [id]);

  async function loadContact() {
    try {
      setLoading(true);
      const contactData = await getContactWithNote(id);
      setContact(contactData);
      setNoteText(contactData?.note?.content || '');
    } catch (error) {
      console.error('Failed to load contact:', error);
      Alert.alert('Error', 'Failed to load contact details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNote() {
    if (!contact) return;

    try {
      setSaving(true);

      if (noteText.trim() === '') {
        // Delete note if empty
        await deleteNote(contact.id);
        Alert.alert('Success', 'Note deleted successfully.');
      } else {
        // Save note
        await saveNote({
          contactId: contact.id,
          content: noteText.trim(),
        });
        Alert.alert('Success', 'Note saved successfully.');
      }

      // Reload contact to get updated note
      await loadContact();
    } catch (error) {
      console.error('Failed to save note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function getInitials(contactData: ContactWithNote): string {
    if (contactData.firstName && contactData.lastName) {
      return `${contactData.firstName[0]}${contactData.lastName[0]}`.toUpperCase();
    }
    if (contactData.firstName) {
      return contactData.firstName.slice(0, 2).toUpperCase();
    }
    if (contactData.name) {
      const parts = contactData.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return contactData.name.slice(0, 2).toUpperCase();
    }
    return '??';
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </ThemedView>
    );
  }

  if (!contact) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Contact not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: contact.name }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}>
        <ScrollView style={styles.scrollView}>
          <ThemedView style={styles.content}>
            {/* Contact Header */}
            <View style={styles.contactHeader}>
              <View
                style={[
                  styles.largeAvatar,
                  { backgroundColor: Colors[colorScheme ?? 'light'].tint },
                ]}>
                <ThemedText style={styles.largeAvatarText}>{getInitials(contact)}</ThemedText>
              </View>
              <ThemedText type="title" style={styles.contactName}>
                {contact.name}
              </ThemedText>
            </View>

            {/* Contact Info */}
            {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
              <View style={styles.infoSection}>
                <ThemedText style={styles.infoLabel}>Phone</ThemedText>
                {contact.phoneNumbers.map((phone, index) => (
                  <ThemedText key={index} style={styles.infoValue}>
                    {phone.label && `${phone.label}: `}
                    {phone.number}
                  </ThemedText>
                ))}
              </View>
            )}

            {contact.emails && contact.emails.length > 0 && (
              <View style={styles.infoSection}>
                <ThemedText style={styles.infoLabel}>Email</ThemedText>
                {contact.emails.map((email, index) => (
                  <ThemedText key={index} style={styles.infoValue}>
                    {email.label && `${email.label}: `}
                    {email.email}
                  </ThemedText>
                ))}
              </View>
            )}

            {/* Notes Section */}
            <View style={styles.notesSection}>
              <ThemedText style={styles.notesLabel}>Notes</ThemedText>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    borderColor: Colors[colorScheme ?? 'light'].border,
                    color: Colors[colorScheme ?? 'light'].text,
                  },
                ]}
                placeholder="Add your notes about this person..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
              {contact.note && (
                <ThemedText style={styles.noteTimestamp}>
                  Last updated: {new Date(contact.note.updatedAt).toLocaleDateString()}{' '}
                  {new Date(contact.note.updatedAt).toLocaleTimeString()}
                </ThemedText>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  opacity: saving ? 0.6 : 1,
                },
              ]}
              onPress={handleSaveNote}
              disabled={saving}>
              <ThemedText style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Note'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  contactName: {
    fontSize: 24,
    fontWeight: '700',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    marginBottom: 2,
  },
  notesSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 200,
    marginBottom: 8,
  },
  noteTimestamp: {
    fontSize: 12,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
