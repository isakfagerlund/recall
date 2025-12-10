import React, { useEffect, useRef, useMemo } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
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

interface PeopleInputProps {
  value: string;
  onChangeText: (text: string) => void;
  isRecording: boolean;
  isTranscribing: boolean;
  isLoading: boolean;
  inputLevel: number; // Normalized 0-1 audio input level
  onVoiceRecording: () => Promise<void>;
  onSubmit: () => Promise<void>;
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
      {isRecording && <AnimatedSoundBars inputLevel={inputLevel} />}
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

interface AnimatedSoundBarsProps {
  inputLevel: number;
}

const AnimatedSoundBars = ({ inputLevel }: AnimatedSoundBarsProps) => {
  const barCount = 32;
  const dotAnimations = useMemo(
    () => Array.from({ length: barCount }).map(() => new Animated.Value(0.3)),
    [],
  );

  // Update bar heights based on inputLevel
  useEffect(() => {
    const animations = dotAnimations.map((anim, index) => {
      // Create a wave pattern with phase offset for each bar
      const phase = (index / barCount) * Math.PI * 2;
      // Use sine wave to create variation between bars
      const variation = Math.abs(Math.sin(phase)) * 0.5 + 0.5; // Range: 0.5 to 1.0

      // Scale bar height based on inputLevel with variation
      // Base scale ranges from 0.3 (min) to 1.2 (max)
      const targetScale = 0.1 + inputLevel * 0.9 * variation;

      return Animated.timing(anim, {
        toValue: targetScale,
        duration: 50, // Smooth transition
        easing: Easing.ease,
        useNativeDriver: true,
      });
    });

    Animated.parallel(animations).start();
  }, [inputLevel]);

  return (
    <View style={styles.waveformContainer}>
      <View style={styles.waveformRow}>
        {dotAnimations.map((animation, index) => {
          return (
            <Animated.View
              key={`bar-${index}`}
              style={[
                styles.bar,
                {
                  transform: [
                    {
                      scaleY: animation,
                    },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  waveformContainer: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 120,
    position: "absolute",
    bottom: 109,
    left: 10,
    zIndex: 4,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 24,
  },
  bar: {
    height: 20,
    width: 3.5,
    backgroundColor: "#00000080",
    borderRadius: 1.25,
    marginHorizontal: 2,
  },
});
