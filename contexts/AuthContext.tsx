import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { apiLogin, AuthUser, DeviceInfo } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAccountDisabled: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isBlockAccessible: (blockId: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isAccountDisabled: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  isBlockAccessible: () => false,
});

const AUTH_STORAGE_KEY = "@mednotes_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const cachedUser: AuthUser = JSON.parse(stored);
        setUser(cachedUser);
        // Refresh user data from API in background
        refreshUser(cachedUser.email);
      }
    } catch {
      // ignore storage errors
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser(email: string) {
    try {
      const { user: freshUser } = await apiLogin(email);

      setUser(freshUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshUser));
    } catch {
      // If user was disabled/removed the API returns an error
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  async function login(
    email: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      const device: DeviceInfo = {
        model: Device.modelName ?? "Unknown",
        os: `${Platform.OS} ${Device.osVersion ?? ""}`.trim(),
        platform: Platform.OS === "ios" ? "iOS" : "Android",
      };

      const { user: authUser } = await apiLogin(trimmedEmail, device);

      setUser(authUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      return { success: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      return { success: false, error: message };
    }
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }

  function isBlockAccessible(blockId: string): boolean {
    if (!user) return false;
    if (user.status === "Disabled") return false;
    return user.assignedBlocks.includes(blockId);
  }

  const isAccountDisabled = !!user && user.status === "Disabled";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAccountDisabled,
        login,
        logout,
        isBlockAccessible,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
