import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useColorScheme } from "@/components/useColorScheme";

export function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="change-sync-key"
            options={{
              presentation: "modal",
              title: "Change Sync Key",
            }}
          />
          <Stack.Screen
            name="person-edit"
            options={{
              presentation: "modal",
              title: "Edit Person",
            }}
          />
        </Stack>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
