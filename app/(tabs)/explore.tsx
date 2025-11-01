import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ContactNote } from '@/types';
import { getAllNotes } from '@/services/database';
import { getContactById } from '@/services/contacts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface NoteWithContactInfo extends ContactNote {
  contactName?: string;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<NoteWithContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  async function loadNotes() {
    try {
      setLoading(true);
      const allNotes = await getAllNotes();

      // Enrich notes with contact names
      const notesWithContactInfo = await Promise.all(
        allNotes.map(async (note) => {
          try {
            const contact = await getContactById(note.contactId);
            return {
              ...note,
              contactName: contact?.name || 'Unknown Contact',
            };
          } catch {
            return {
              ...note,
              contactName: 'Unknown Contact',
            };
          }
        })
      );

      setNotes(notesWithContactInfo);
    } catch (error) {
      console.error('Failed to load notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleNotePress(note: NoteWithContactInfo) {
    router.push(`/contact/${note.contactId}` as any);
  }

  function renderNote({ item }: { item: NoteWithContactInfo }) {
    const preview = item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '');
    const date = new Date(item.updatedAt);
    const formattedDate = date.toLocaleDateString();

    return (
      <TouchableOpacity
        style={[
          styles.noteItem,
          { borderBottomColor: Colors[colorScheme ?? 'light'].border },
        ]}
        onPress={() => handleNotePress(item)}>
        <View style={styles.noteHeader}>
          <ThemedText style={styles.contactName}>{item.contactName}</ThemedText>
          <ThemedText style={styles.noteDate}>{formattedDate}</ThemedText>
        </View>
        <ThemedText style={styles.notePreview} numberOfLines={2}>
          {preview}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText style={styles.loadingText}>Loading notes...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          All Notes
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </ThemedText>
      </View>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedView style={styles.centered}>
            <ThemedText style={styles.emptyText}>No notes yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Tap on a contact to add your first note
            </ThemedText>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  listContent: {
    flexGrow: 1,
  },
  noteItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  noteDate: {
    fontSize: 12,
    opacity: 0.5,
    marginLeft: 8,
  },
  notePreview: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
});
