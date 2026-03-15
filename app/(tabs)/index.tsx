import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, GraduationCap, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
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

interface YearGroup {
  year: number;
  name: string;
  totalBlocks: number;
}

export default function HomeScreen() {
  const { blocks, isLoading, isOffline } = useLibrary();
  const navigate = useNavigationLock();
  
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  // Group blocks by year — pure local computation, no network
  const yearGroups: YearGroup[] = React.useMemo(() => {
    const years = [...new Set(blocks.map((b) => b.year))].sort((a, b) => a - b);
    return years.map((year) => ({
      year,
      name: YEAR_LABELS[year] || `Year ${year}`,
      totalBlocks: blocks.filter((b) => b.year === year).length,
    }));
  }, [blocks]);

  const yearColors = ["#3B82F6", "#A855F7", "#10B981", "#F97316"];

  // Show skeleton cards while loading for first time (no cache)
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <Text style={styles.headerTitle}>Medical Notes</Text>
          <Text style={styles.headerSubtitle}>
            ✨ Your MBBS Learning Companion ✨
          </Text>
        </View>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonTopBar} />
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonLines}>
                  <View style={styles.skeletonLine1} />
                  <View style={styles.skeletonLine2} />
                </View>
              </View>
            </View>
          ))}
          <ActivityIndicator
            style={{ marginTop: 8 }}
            size="small"
            color={theme.primary}
          />
        </View>
      </View>
    );
  }

  if (yearGroups.length === 0 && isOffline) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <Text style={styles.headerTitle}>Medical Notes</Text>
          <Text style={styles.headerSubtitle}>Connect to internet first</Text>
        </View>

        <View style={styles.skeletonContainer}>
          <Text style={{ color: theme.textMuted, textAlign: "center" }}>
            You are offline and no content is cached yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </View>
        <Text style={styles.headerTitle}>Medical Notes</Text>
        <Text style={styles.headerSubtitle}>
          ✨ Your MBBS Learning Companion ✨
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.yearsContainer}>
          {yearGroups.map((group, index) => (
            <TouchableOpacity
              key={group.year}
              style={styles.yearCard}
              onPress={() => navigate(() => router.push(`/year/${group.year}`))}
            >
              <View
                style={[
                  styles.yearTopBorder,
                  { backgroundColor: yearColors[index % yearColors.length] },
                ]}
              />
              <View style={styles.yearContent}>
                <View style={styles.yearLeft}>
                  <View
                    style={[
                      styles.yearIcon,
                      {
                        backgroundColor: `${yearColors[index % yearColors.length]}15`,
                      },
                    ]}
                  >
                    <GraduationCap
                      color={yearColors[index % yearColors.length]}
                      size={28}
                    />
                  </View>
                  <View style={styles.yearInfo}>
                    <Text style={styles.yearName}>{group.name}</Text>
                    <View style={styles.yearMeta}>
                      <BookOpen color={theme.textPlaceholder} size={14} />
                      <Text style={styles.yearMetaText}>
                        {group.totalBlocks} Blocks
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.chevronContainer,
                    {
                      backgroundColor: `${yearColors[index % yearColors.length]}10`,
                    },
                  ]}
                >
                  <ChevronRight
                    color={yearColors[index % yearColors.length]}
                    size={20}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    alignItems: "center",
    paddingBottom: 24,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  logoContainer: {
    marginBottom: 16,
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 4,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  logoBackground: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  yearsContainer: {
    padding: 16,
    gap: 16,
  },
  yearCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  yearTopBorder: {
    height: 4,
  },
  yearContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  yearLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  yearIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  yearInfo: {
    flex: 1,
  },
  yearName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 6,
  },
  yearMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  yearMetaText: {
    fontSize: 13,
    color: theme.textMuted,
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  // Skeleton styles
  skeletonContainer: {
    padding: 16,
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonTopBar: {
    height: 4,
    backgroundColor: theme.skeletonLine,
  },
  skeletonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  skeletonIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.skeletonBase,
  },
  skeletonLines: {
    flex: 1,
    gap: 8,
  },
  skeletonLine1: {
    height: 16,
    backgroundColor: theme.skeletonBase,
    borderRadius: 8,
    width: "60%",
  },
  skeletonLine2: {
    height: 12,
    backgroundColor: theme.skeletonBase,
    borderRadius: 6,
    width: "40%",
  },
});
