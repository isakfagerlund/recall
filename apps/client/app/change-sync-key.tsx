import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { setSyncKey } from '@/lib/sync/key';
import { markAllAsUnsynced } from '@/db/sync';

export default function ChangeSyncKeyModal() {
  const [pastedKey, setPastedKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handlePasteFromClipboard = async () => {
    try {
      const value = await Clipboard.getStringAsync();
      setPastedKey(value.trim());
      setError(null);
    } catch (err) {
      console.error('Error pasting from clipboard', err);
      setError('Failed to read clipboard');
    }
  };

  const applyPastedKey = async () => {
    if (!pastedKey.trim()) {
      setError('Please enter a sync key to apply');
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      await setSyncKey(pastedKey.trim());
      await markAllAsUnsynced();
      Alert.alert('Sync key updated', 'New key applied. Please sync now.', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (err) {
      console.error('Error applying key', err);
      const message =
        err instanceof Error ? err.message : 'Failed to apply key';
      setError(message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#D9D9D9' }}
        contentContainerStyle={{ padding: 20, gap: 16 }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
          Change Sync Key
        </Text>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>
            Paste Sync Key
          </Text>
          <TextInput
            value={pastedKey}
            onChangeText={(text) => {
              setPastedKey(text);
              setError(null);
            }}
            placeholder="Paste a sync key"
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#ccc',
              paddingHorizontal: 12,
              paddingVertical: 10,
              minHeight: 100,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
              fontSize: 12,
            }}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={handlePasteFromClipboard}
            style={{
              backgroundColor: '#007AFF',

              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              Paste from clipboard
            </Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 12, color: '#666' }}>
          Applying a key replaces the current one. Old keys will no longer sync.
        </Text>

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

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={handleCancel}
            disabled={isApplying}
            style={{
              flex: 1,
              backgroundColor: '#fff',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
              opacity: isApplying ? 0.6 : 1,
            }}
          >
            <Text style={{ color: '#007AFF', fontWeight: '600' }}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={applyPastedKey}
            disabled={isApplying || !pastedKey.trim()}
            style={{
              flex: 1,
              backgroundColor:
                isApplying || !pastedKey.trim() ? '#ccc' : '#007AFF',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {isApplying ? 'Applying...' : 'Apply key'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
