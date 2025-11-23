import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { db } from '@/db';
import { people as peopleTable } from '@/db/schema';
import { desc } from 'drizzle-orm';
import {
  clearSyncKey,
  getSyncKey,
  setSyncKey,
} from '@/lib/sync/key';
import { performSync } from '@/lib/sync/sync';
import { markAllAsUnsynced } from '@/db/sync';

export default function SettingsScreen() {
  const [syncKey, setSyncKeyState] = useState<string | null>(null);
  const [pastedKey, setPastedKey] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadSyncKey();
    loadLastSync();
  }, []);

  const loadSyncKey = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const key = await getSyncKey();
      setSyncKeyState(key);
    } catch (err) {
      console.error('Error loading sync key', err);
      setError('Failed to load sync key');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastSync = async () => {
    try {
      const result = await db
        .select()
        .from(peopleTable)
        .orderBy(desc(peopleTable.syncedAt))
        .limit(1);

      if (result.length > 0 && result[0].syncedAt) {
        const value = result[0].syncedAt;
        const date =
          value instanceof Date ? value : new Date(value);
        if (!isNaN(date.getTime())) {
          setLastSync(date);
        }
      }
    } catch (err) {
      console.error('Error loading last sync:', err);
    }
  };

  const handleCopyKey = async () => {
    if (!syncKey) return;
    await Clipboard.setStringAsync(syncKey);
    Alert.alert('Copied', 'Sync key copied to clipboard');
  };

  const handlePasteFromClipboard = async () => {
    const value = await Clipboard.getStringAsync();
    setPastedKey(value.trim());
  };

  const applyPastedKey = async () => {
    if (!pastedKey.trim()) {
      setError('Please enter a sync key to apply');
      return;
    }
    try {
      await setSyncKey(pastedKey.trim());
      setSyncKeyState(pastedKey.trim());
      await markAllAsUnsynced();
      setLastSync(null);
      setError(null);
      Alert.alert('Sync key updated', 'New key applied. Please sync now.');
    } catch (err) {
      console.error('Error applying key', err);
      const message =
        err instanceof Error ? err.message : 'Failed to apply key';
      setError(message);
      Alert.alert('Error', message);
    }
  };

  const regenerateKey = () => {
    Alert.alert(
      'Regenerate key',
      'This will replace your current key. The old key will no longer sync. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearSyncKey();
              const newKey = await getSyncKey();
              setSyncKeyState(newKey);
              setPastedKey('');
              await markAllAsUnsynced();
              setLastSync(null);
              setError(null);
              Alert.alert('Key regenerated', 'New key created. Please sync.');
            } catch (err) {
              console.error('Error regenerating key', err);
              const message =
                err instanceof Error ? err.message : 'Failed to regenerate key';
              setError(message);
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    if (!syncKey) {
      setError('No sync key available');
      return;
    }
    setIsSyncing(true);
    setError(null);
    try {
      await performSync(syncKey);
      await loadLastSync();
      Alert.alert('Success', 'Sync completed successfully');
    } catch (err) {
      console.error('Sync failed', err);
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
      Alert.alert('Sync Failed', message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#D9D9D9' }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Settings</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Sync Key</Text>
        <View
          style={{
            backgroundColor: '#f0f0f0',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ddd',
            minHeight: 50,
            justifyContent: 'center',
          }}
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={{ fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}
              selectable
              numberOfLines={2}
            >
              {syncKey ?? 'Not available'}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 12, color: '#666' }}>
          Copy, paste, or regenerate your sync key.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={handleCopyKey}
            style={{
              backgroundColor: '#007AFF',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
            disabled={!syncKey}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Copy</Text>
          </Pressable>
          <Pressable
            onPress={regenerateKey}
            style={{
              backgroundColor: '#ff3b30',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Regenerate</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Paste / Apply Key</Text>
        <TextInput
          value={pastedKey}
          onChangeText={setPastedKey}
          placeholder="Paste a sync key"
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ccc',
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
          multiline
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={handlePasteFromClipboard}
            style={{
              backgroundColor: '#666',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Paste from clipboard</Text>
          </Pressable>
          <Pressable
            onPress={applyPastedKey}
            style={{
              backgroundColor: '#007AFF',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Apply key</Text>
          </Pressable>
        </View>
        <Text style={{ fontSize: 12, color: '#666' }}>
          Applying a key replaces the current one. Old keys will no longer sync.
        </Text>
      </View>

      {lastSync && (
        <Text style={{ fontSize: 12, color: '#666' }}>
          Last synced: {lastSync.toLocaleString()}
        </Text>
      )}

      {error && (
        <View
          style={{
            backgroundColor: '#fee',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#fcc',
          }}
        >
          <Text style={{ color: '#c00', fontSize: 12 }}>{error}</Text>
        </View>
      )}

      <Pressable
        onPress={handleSync}
        disabled={isSyncing || isLoading || !syncKey}
        style={{
          backgroundColor: isSyncing || isLoading || !syncKey ? '#ccc' : '#007AFF',
          paddingVertical: 16,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        {isSyncing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '700' }}>Sync Now</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
