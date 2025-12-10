import React, { useEffect, useRef } from "react";
import {
  Button,
  CircularProgress,
  Host,
  HStack,
  TextField,
  TextFieldRef,
  VStack,
} from "@expo/ui/swift-ui";
import { glassEffect, padding } from "@expo/ui/swift-ui/modifiers";

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

  const hasValue = value.length > 0;

  // Sync TextField when value changes externally (e.g., from voice transcription)
  useEffect(() => {
    const handleText = async () => {
      if (fieldRef.current) {
        await fieldRef.current.setText(value);
      }
    };

    handleText();
  }, [value]);

  const handleSubmit = async () => {
    await onSubmit();
    onChangeText("");
    fieldRef.current?.setText("");
  };

  return (
    <Host matchContents style={{ width: "100%", zIndex: 3 }}>
      <HStack spacing={12}>
        <VStack
          modifiers={[
            glassEffect({
              shape: "capsule",
              glass: {
                interactive: true,
                variant: "clear",
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
          systemImage={isRecording || isTranscribing ? undefined : "mic.fill"}
          variant={isRecording ? "glassProminent" : "glass"}
          onPress={onVoiceRecording}
          disabled={isTranscribing || isLoading || hasValue}
        >
          {(isRecording || isTranscribing) && <CircularProgress color="#fff" />}
        </Button>
        <Button
          systemImage={isLoading ? undefined : "arrow.up"}
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
