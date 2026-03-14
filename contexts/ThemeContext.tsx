import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme, AppState, AppStateStatus, Platform } from "react-native";
import { Colors, ThemeColors } from "@/constants/Colors";
import * as NavigationBar from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  theme: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  applyNavBarStyle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@mednotes_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme() || "light";
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedMode) => {
      if (savedMode === "light" || savedMode === "dark" || savedMode === "system") {
        setModeState(savedMode);
      }
    });
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const isDark = mode === "system" ? systemTheme === "dark" : mode === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  /**
   * applyNavBarStyle:
   *
   * With `edgeToEdgeEnabled: true`, the Android system navigation bar is ALWAYS
   * transparent — the app content renders behind it. `setBackgroundColorAsync`
   * is not supported in this mode and will throw a warning.
   *
   * What IS supported is `setButtonStyleAsync`, which controls whether the
   * gesture handle / navigation icons are rendered in light or dark colour.
   * This ensures the icons are visible against whatever content is drawn behind
   * the bar (i.e. the tab bar background).
   */
  const applyNavBarStyle = useCallback(async () => {
    // "light"  → white/light icons  (use when background behind bar is dark)
    // "dark"   → dark/black icons   (use when background behind bar is light)
    const buttonStyle = isDark ? "light" : "dark";
    
    if (Platform.OS === "android") {
      try {
        await NavigationBar.setButtonStyleAsync(buttonStyle);
      } catch (e) {
        // Ignore warnings
      }
    }
  }, [isDark]);

  useEffect(() => {
    // A. Apply immediately, and again after a short delay to bypass 
    // Android Splash Screen edge-to-edge race conditions on startup.
    applyNavBarStyle();
    const timeoutId = setTimeout(applyNavBarStyle, 100);
    const timeoutId2 = setTimeout(applyNavBarStyle, 500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [applyNavBarStyle]);

  useEffect(() => {

    // B. Re-apply on every orientation change.
    //    Android sometimes resets the button style during rotation.
    const orientationSub = ScreenOrientation.addOrientationChangeListener(() => {
      applyNavBarStyle();
      setTimeout(applyNavBarStyle, 400);
      setTimeout(applyNavBarStyle, 1000);
    });

    // C. Re-apply when the app comes back to the foreground.
    const appStateSub = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          applyNavBarStyle();
        }
      }
    );

    return () => {
      ScreenOrientation.removeOrientationChangeListener(orientationSub);
      appStateSub.remove();
    };
  }, [applyNavBarStyle]);

  return (
    <ThemeContext.Provider value={{ mode, theme, isDark, setMode, applyNavBarStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
