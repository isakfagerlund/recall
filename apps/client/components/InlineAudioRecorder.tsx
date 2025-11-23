import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import {
  AudioModule,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
} from 'expo-audio';
import { createStyles } from '@/theme/styles';

export default function InlineAudioRecorder() {
  const player = useAudioPlayer();
  const [recording, setRecording] = useState<string | null>();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
    setRecording(audioRecorder.uri);

    if (audioRecorder.uri) {
      player.replace(audioRecorder.uri);
      player.play();
    }
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={recorderState.isRecording ? stopRecording : record}
      />
      <Text style={createStyles.buttonPrimary}>Recording: {recording}</Text>
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
