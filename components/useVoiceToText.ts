import { useState, useCallback } from 'react';
import {
  AudioModule,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import { File } from 'expo-file-system';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

/**
 * Get the API URL for transcription endpoint
 */
function getTranscribeApiUrl(): string {
  // Check for production API URL from environment
  const productionUrl = process.env.EXPO_PUBLIC_TRANSCRIBE_API_URL;
  if (productionUrl) {
    return productionUrl;
  }

  // Development: use relative URL
  if (Constants.expoConfig?.hostUri) {
    return `http://${Constants.expoConfig.hostUri}/api/transcribe`;
  }

  return '/api/transcribe';
}

interface UseVoiceToTextReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  requestPermissions: () => Promise<boolean>;
}

export function useVoiceToText(): UseVoiceToTextReturn {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setError('Microphone permission denied');
        Alert.alert(
          'Permission Required',
          'Please allow microphone access to use voice-to-text'
        );
        return false;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to request permissions';
      setError(message);
      return false;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      console.error('Error starting recording:', err);
    }
  }, [audioRecorder, requestPermissions]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      setError(null);

      if (!recorderState.isRecording) {
        return null;
      }

      await audioRecorder.stop();
      const audioUri = audioRecorder.uri;

      if (!audioUri) {
        setError('No audio file recorded');
        return null;
      }

      // Transcribe the audio
      setIsTranscribing(true);
      const transcribedText = await transcribeAudio(audioUri);
      setIsTranscribing(false);

      return transcribedText;
    } catch (err) {
      setIsTranscribing(false);
      const message =
        err instanceof Error ? err.message : 'Failed to stop recording';
      setError(message);
      console.error('Error stopping recording:', err);
      return null;
    }
  }, [audioRecorder, recorderState.isRecording]);

  async function transcribeAudio(audioUri: string): Promise<string | null> {
    try {
      // Use the new File API to read the file as base64
      const file = new File(audioUri);
      const base64 = await file.base64();

      // Send base64 data directly to the server
      const apiUrl = getTranscribeApiUrl();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64,
          format: 'm4a',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Transcription failed: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      return result.text ?? null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to transcribe audio';
      setError(message);
      console.error('Error transcribing audio:', err);
      throw err;
    }
  }

  return {
    isRecording: recorderState.isRecording,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    requestPermissions,
  };
}
