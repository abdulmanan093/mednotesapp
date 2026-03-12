import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
import { Block } from "@/types/database";
import { apiGetBlocks } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLockedPopup, setShowLockedPopup] = useState(false);

  useEffect(() => {
    loadBlocks();
  }, [yearNumber]);

  async function loadBlocks() {
    try {
      const { blocks } = await apiGetBlocks(yearNumber);
      setBlocks(blocks || []);
    } catch (error) {
      console.error("Error loading blocks:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleBlockPress(block: Block) {
    if (!isLoggedIn || !isBlockAccessible(block.id)) {
      setShowLockedPopup(true);
      return;
    }
    router.push(`/block/${block.id}`);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#3B82F6", "#60A5FA"]}
        style={[styles.header, { paddingTop: 16 }]}
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
                onPress={() => handleBlockPress(block)}
              >
                <View style={styles.blockContent}>
                  <View
                    style={[
                      styles.blockIcon,
                      {
                        backgroundColor: isLocked ? "#F3F4F6" : "#EEF2FF",
                      },
                    ]}
                  >
                    {isLocked ? (
                      <Lock color="#9CA3AF" size={24} />
                    ) : (
                      <BookOpen color="#3B82F6" size={24} />
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
                        <Lock color="#9CA3AF" size={12} />
                        <Text style={styles.lockedText}>Locked</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.chevronContainer}>
                    {isLocked ? (
                      <Lock color="#9CA3AF" size={18} />
                    ) : (
                      <ChevronRight color="#3B82F6" size={20} />
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
              <ShoppingCart color="#F59E0B" size={40} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#1F2937",
    marginBottom: 6,
  },
  blockNameLocked: {
    color: "#9CA3AF",
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popupContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "85%",
  },
  popupIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  popupMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  popupButton: {
    backgroundColor: "#6366F1",
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
