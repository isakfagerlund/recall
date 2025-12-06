import React, { useEffect, useRef } from 'react';
import {
  Button,
  CircularProgress,
  Host,
  HStack,
  TextField,
  TextFieldRef,
  VStack,
} from '@expo/ui/swift-ui';
import { glassEffect, padding } from '@expo/ui/swift-ui/modifiers';

interface PeopleInputProps {
  value: string;
  onChangeText: (text: string) => void;
  isRecording: boolean;
  isTranscribing: boolean;
  isLoading: boolean;
  onVoiceRecording: () => Promise<void>;
  onSubmit: () => Promise<void>;
}

export function PeopleInput({
  value,
  onChangeText,
  isRecording,
  isTranscribing,
  isLoading,
  onVoiceRecording,
  onSubmit,
}: PeopleInputProps) {
  const fieldRef = useRef<TextFieldRef>(null);

  // Sync TextField when value changes externally (e.g., from voice transcription)
  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.setText(value);
    }
  }, [value]);

  const handleSubmit = async () => {
    await onSubmit();
    onChangeText('');
    fieldRef.current?.setText('');
  };

  return (
    <Host matchContents style={{ width: '100%' }}>
      <HStack spacing={12}>
        <VStack
          modifiers={[
            glassEffect({
              shape: 'capsule',
              glass: {
                interactive: true,
                variant: 'clear',
              },
            }),
          ]}
        >
          <TextField
            ref={fieldRef}
            modifiers={[padding({ horizontal: 12, vertical: 6 })]}
            autocorrection={false}
            onChangeText={onChangeText}
          />
        </VStack>
        <Button
          systemImage={isRecording || isTranscribing ? undefined : 'mic.fill'}
          variant={isRecording ? 'glassProminent' : 'glass'}
          onPress={onVoiceRecording}
          disabled={isTranscribing || isLoading}
        >
          {(isRecording || isTranscribing) && <CircularProgress color="#fff" />}
        </Button>
        <Button
          systemImage={isLoading ? undefined : 'checkmark'}
          variant="glassProminent"
          onPress={handleSubmit}
          disabled={isRecording || isTranscribing}
        >
          {isLoading && <CircularProgress color="#fff" />}
        </Button>
      </HStack>
    </Host>
  );
}
