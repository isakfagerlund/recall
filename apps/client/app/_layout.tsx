import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

  useEffect(() => {
    SystemUI.setBackgroundColorAsync("transparent").catch((err) => {
      console.error("Failed to set system UI background color:", err);
    });
  }, []);

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
    <SafeAreaProvider>
      <KeyboardProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            style={colorScheme === "dark" ? "light" : "dark"}
          />
          <Stack
            screenOptions={{
              statusBarStyle: colorScheme === "dark" ? "light" : "dark",
              statusBarTranslucent: true,
              statusBarBackgroundColor: "transparent",
              contentStyle: { backgroundColor: "#D9D9D9" },
            }}
          >
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
    </SafeAreaProvider>
  );
}
