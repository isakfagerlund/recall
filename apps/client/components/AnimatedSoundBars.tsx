import React, { useEffect, useMemo } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type AnimatedSoundBarsProps = {
  inputLevel: number;
  keyboardOpen: boolean;
};

const barCount = 32;

export function AnimatedSoundBars({
  inputLevel,
  keyboardOpen,
}: AnimatedSoundBarsProps) {
  const dotAnimations = useMemo(
    () => Array.from({ length: barCount }).map(() => new Animated.Value(0.3)),
    [],
  );

  useEffect(() => {
    const animations = dotAnimations.map((anim, index) => {
      const phase = (index / barCount) * Math.PI * 2;
      const variation = Math.abs(Math.sin(phase)) * 0.5 + 0.5;
      const targetScale = 0.1 + inputLevel * 0.9 * variation;

      return Animated.timing(anim, {
        toValue: targetScale,
        duration: 50,
        easing: Easing.ease,
        useNativeDriver: true,
      });
    });

    Animated.parallel(animations).start();
  }, [dotAnimations, inputLevel]);

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        minWidth: 120,
        position: "absolute",
        bottom: keyboardOpen ? 77 : 109,
        left: 10,
        zIndex: 4,
      }}
    >
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
}

const styles = StyleSheet.create({
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
