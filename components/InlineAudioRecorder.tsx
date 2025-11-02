import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {
  AudioModule,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
} from 'expo-audio';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function InlineAudioRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);

  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.warn('Microphone permission not granted');
      }
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    })();
  }, []);

  const handleStart = async () => {
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      setUri(null);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const handleStop = async () => {
    try {
      await recorder.stop();
      const status = recorder.getStatus();
      setUri(status.url ?? null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleDownload = async () => {
    if (!uri) return;

    try {
      // Native (iOS/Android): use system share sheet (lets user save to Files/Drive, etc.)
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Export recording',
          mimeType: 'audio/m4a',
          UTI: 'com.apple.m4a-audio', // iOS hint
        });
        return;
      }

      // Fallback if Sharing isn't available (very rare):
      // copy into app's documents so at least it's persisted,
      // then tell user where it is.
      const dest = FileSystem.Directory + 'recording.m4a';
      await FileSystem.copyAsync({ from: uri, to: dest });
      Alert.alert('Saved', `Saved to app documents:\n${dest}`);
    } catch (e) {
      console.error('Download/export failed', e);
      Alert.alert('Error', 'Could not export the recording.');
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={state.isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={state.isRecording ? handleStop : handleStart}
      />

      {uri && (
        <TouchableOpacity onPress={handleDownload} activeOpacity={0.7}>
          <Text style={styles.link}>
            Recorded URI (tap to {Platform.OS === 'web' ? 'download' : 'export'}
            ):
            {'\n'}
            {uri}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  link: {
    marginTop: 12,
    textDecorationLine: 'underline',
  },
});
