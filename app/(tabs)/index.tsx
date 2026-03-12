import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, GraduationCap, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { Block } from "@/types/database";
import { apiGetBlocks } from "@/lib/api";

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
  blocks: Block[];
  totalBlocks: number;
}

export default function HomeScreen() {
  const [yearGroups, setYearGroups] = useState<YearGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlocks();
  }, []);

  async function loadBlocks() {
    try {
      const { blocks } = await apiGetBlocks();

      const grouped = (blocks || []).reduce<Record<number, Block[]>>(
        (acc, block) => {
          if (!acc[block.year]) acc[block.year] = [];
          acc[block.year].push(block);
          return acc;
        },
        {},
      );

      const groups: YearGroup[] = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b)
        .map((year) => ({
          year,
          name: YEAR_LABELS[year] || `Year ${year}`,
          blocks: grouped[year],
          totalBlocks: grouped[year].length,
        }));

      setYearGroups(groups);
    } catch (error) {
      console.error("Error loading blocks:", error);
    } finally {
      setLoading(false);
    }
  }

  const yearColors = ["#3B82F6", "#A855F7", "#10B981", "#F97316"];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 }]}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            style={styles.logoGradient}
          >
            <BookOpen color="#FFFFFF" size={32} />
          </LinearGradient>
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
              onPress={() => router.push(`/year/${group.year}`)}
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
                      <BookOpen color="#6B7280" size={14} />
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
    alignItems: "center",
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6366F1",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  yearsContainer: {
    padding: 16,
    gap: 16,
  },
  yearCard: {
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
    marginBottom: 6,
  },
  yearMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  yearMetaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  yearMetaDot: {
    fontSize: 13,
    color: "#D1D5DB",
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
