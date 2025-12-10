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
import * as Haptics from "expo-haptics";
import { AnimatedSoundBars } from "@/components/AnimatedSoundBars";

interface PeopleInputProps {
  value: string;
  onChangeText: (text: string) => void;
  isRecording: boolean;
  isTranscribing: boolean;
  isLoading: boolean;
  inputLevel: number; // Normalized 0-1 audio input level
  onVoiceRecording: () => Promise<void>;
  onSubmit: () => Promise<void>;
  keyboardOpen: boolean;
}

export function PeopleInput({
  value,
  onChangeText,
  isRecording,
  isTranscribing,
  isLoading,
  inputLevel,
  onVoiceRecording,
  onSubmit,
  keyboardOpen,
}: PeopleInputProps) {
  const fieldRef = useRef<TextFieldRef>(null);

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
    <>
      {isRecording ? (
        <AnimatedSoundBars
          inputLevel={inputLevel}
          keyboardOpen={keyboardOpen}
        />
      ) : null}
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
            systemImage={
              isRecording
                ? "stop.fill"
                : isTranscribing
                  ? undefined
                  : "mic.fill"
            }
            variant={
              isRecording
                ? "glassProminent"
                : isTranscribing
                  ? "glassProminent"
                  : "glass"
            }
            color={isRecording ? "red" : isTranscribing ? "black" : "black"}
            onPress={() => {
              Haptics.impactAsync();
              onVoiceRecording();
            }}
            disabled={isTranscribing || isLoading}
          >
            {isTranscribing && <CircularProgress />}
          </Button>
          <Button
            systemImage={isLoading ? undefined : "arrow.up"}
            variant="glassProminent"
            onPress={() => {
              Haptics.impactAsync();
              handleSubmit();
            }}
            disabled={isRecording || isTranscribing}
          >
            {isLoading && <CircularProgress color="#fff" />}
          </Button>
        </HStack>
      </Host>
    </>
  );
}
