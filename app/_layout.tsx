import "../global.css";
import { useEffect, useState, useCallback } from "react";
import { AppState, LogBox } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "@/contexts/AuthContext";
import * as ScreenCapture from "expo-screen-capture";

// Suppress deprecation warning from react-navigation internals
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

export default function RootLayout() {
  // Force SafeAreaProvider to remount when app returns from background
  const [safeAreaKey, setSafeAreaKey] = useState(0);

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync();
  }, []);

  const handleAppStateChange = useCallback((nextState: string) => {
    if (nextState === "active") {
      setSafeAreaKey((k) => k + 1);
    }
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [handleAppStateChange]);

  return (
    <SafeAreaProvider key={safeAreaKey}>
      <AuthProvider>
        <SafeAreaView
          style={{ flex: 1 }}
          edges={["top", "bottom", "left", "right"]}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
