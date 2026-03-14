import "../global.css";
import { useEffect, useState } from "react";
import { LogBox, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { LibraryProvider } from "@/contexts/LibraryContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import * as ScreenCapture from "expo-screen-capture";

import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import CustomSplashScreen from "@/components/CustomSplashScreen";

// Suppress deprecation warning from react-native internally caused by expo-router / react-navigation
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

// Keep the native splash screen visible while we initialize our custom one
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(console.warn);
    SplashScreen.hideAsync().catch(console.warn);
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent
          showSplash={showSplash}
          onSplashFinish={() => setShowSplash(false)}
        />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

function AppContent({
  showSplash,
  onSplashFinish,
}: {
  showSplash: boolean;
  onSplashFinish: () => void;
}) {
  const { theme, isDark, applyNavBarStyle } = useTheme();

  // Forcefully apply nav bar color the exact moment splash screen hides
  useEffect(() => {
    if (!showSplash) {
      applyNavBarStyle();
      // One final delayed fallback just in case the layout shifts
      setTimeout(applyNavBarStyle, 400); 
    }
  }, [showSplash, applyNavBarStyle]);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    // This root View fills the entire screen including behind status bar &
    // nav bar (edge-to-edge). Each individual screen handles its own
    // safe-area padding via useSafeAreaInsets().
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <NavThemeProvider value={navigationTheme}>
        <AuthProvider>
          <LibraryProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={isDark ? "light" : "dark"} />
            {showSplash && <CustomSplashScreen onFinish={onSplashFinish} />}
          </LibraryProvider>
        </AuthProvider>
      </NavThemeProvider>
    </View>
  );
}
