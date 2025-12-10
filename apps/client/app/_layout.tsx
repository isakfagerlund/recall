import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { initializeDatabase } from "@/db";
import { RootLayoutNav } from "./RootLayoutNav";

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
