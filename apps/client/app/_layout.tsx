import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useColorScheme } from "@/components/useColorScheme";
import { initializeDatabase } from "@/db";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Initialize database on app startup
  useEffect(() => {
    initializeDatabase()
      .then(() => {
        setDbInitialized(true);
      })
      .catch((err) => {
        console.error("Failed to initialize database:", err);
        // Still allow app to continue even if DB init fails
        setDbInitialized(true);
      });
  }, []);

  useEffect(() => {
    if (loaded && dbInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbInitialized]);

  if (!loaded || !dbInitialized) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
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
        </Stack>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
