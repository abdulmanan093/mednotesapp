import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Lock,
  ChevronRight,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { useNavigationLock } from "@/hooks/useNavigationLock";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeColors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const YEAR_LABELS: Record<number, string> = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
  4: "Fourth Year",
  5: "Fifth Year",
};

export default function YearBlocksScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const yearNumber = parseInt(id || "1", 10);
  const { isLoggedIn, isBlockAccessible, isAccountDisabled } = useAuth();
  const { getBlocksByYear } = useLibrary();
  const [showLockedPopup, setShowLockedPopup] = useState(false);
  const navigate = useNavigationLock();
  
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  // No loading, no API call — instant filter from cache
  const blocks = getBlocksByYear(yearNumber);

  function handleBlockPress(blockId: string) {
    if (!isLoggedIn || !isBlockAccessible(blockId)) {
      setShowLockedPopup(true);
      return;
    }
    navigate(() => router.push(`/block/${blockId}`));
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.primaryGradientStart, theme.primaryGradientEnd]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {YEAR_LABELS[yearNumber] || `Year ${yearNumber}`}
        </Text>
        <Text style={styles.headerSubtitle}>
          ✨ Select a block to start learning
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.blocksContainer}>
          {blocks.map((block) => {
            const isLocked = !isLoggedIn || !isBlockAccessible(block.id);

            return (
              <TouchableOpacity
                key={block.id}
                style={[styles.blockCard, isLocked && styles.blockCardLocked]}
                onPress={() => handleBlockPress(block.id)}
              >
                <View style={styles.blockContent}>
                  <View
                    style={[
                      styles.blockIcon,
                      {
                        backgroundColor: isLocked ? theme.skeletonBase : theme.primaryLight,
                      },
                    ]}
                  >
                    {isLocked ? (
                      <Lock color={theme.textPlaceholder} size={24} />
                    ) : (
                      <BookOpen color={theme.primary} size={24} />
                    )}
                  </View>
                  <View style={styles.blockInfo}>
                    <Text
                      style={[
                        styles.blockName,
                        isLocked && styles.blockNameLocked,
                      ]}
                    >
                      {block.name}
                    </Text>
                    {isLocked && (
                      <View style={styles.lockedBadge}>
                        <Lock color={theme.textPlaceholder} size={12} />
                        <Text style={styles.lockedText}>Locked</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.chevronContainer, { backgroundColor: isLocked ? theme.skeletonBase : theme.primaryLight }]}>
                    {isLocked ? (
                      <Lock color={theme.textPlaceholder} size={18} />
                    ) : (
                      <ChevronRight color={theme.primary} size={20} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Locked Block Popup */}
      <Modal visible={showLockedPopup} animationType="fade" transparent>
        <View style={styles.popupOverlay}>
          <View style={styles.popupContent}>
            <View style={styles.popupIconContainer}>
              <ShoppingCart color={theme.warning} size={40} />
            </View>
            <Text style={styles.popupTitle}>Course Locked</Text>
            <Text style={styles.popupMessage}>
              {isAccountDisabled
                ? "Your account is restricted. Please contact admin to restore access."
                : isLoggedIn
                  ? "Buy this course first to access its content."
                  : "Please login first to access courses. Go to Settings to login."}
            </Text>
            <TouchableOpacity
              style={styles.popupButton}
              onPress={() => setShowLockedPopup(false)}
            >
              <Text style={styles.popupButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  blocksContainer: {
    padding: 16,
    gap: 12,
  },
  blockCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  blockCardLocked: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  blockContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  blockIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  blockInfo: {
    flex: 1,
  },
  blockName: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 6,
  },
  blockNameLocked: {
    color: theme.textPlaceholder,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.textPlaceholder,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popupContent: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "85%",
  },
  popupIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.warningLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 8,
  },
  popupMessage: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  popupButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  popupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
