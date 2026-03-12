import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, BookOpen, Clock } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Block, Subject } from "@/types/database";
import { apiGetSubjects } from "@/lib/api";

const SUBJECT_COLORS = [
  "#6366F1",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
];

export default function BlockSubjectsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [block, setBlock] = useState<Block | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockData();
  }, [id]);

  async function loadBlockData() {
    try {
      const { block: blockData, subjects: subjectsData } = await apiGetSubjects(
        id!,
      );

      setBlock(blockData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error loading block data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Coming Soon if no subjects
  if (subjects.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
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
          <Text style={styles.headerTitle}>{block?.name}</Text>
          <Text style={styles.headerSubtitle}>Subjects</Text>
        </LinearGradient>
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonIcon}>
            <Clock color="#6366F1" size={48} />
          </View>
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Subjects for this block are being prepared. Check back soon!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#6366F1", "#8B5CF6"]}
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
        <Text style={styles.headerTitle}>{block?.name} Subjects</Text>
        <Text style={styles.headerSubtitle}>✨ 1st Year MBBS</Text>
      </LinearGradient>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        ListHeaderComponent={
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Choose a Subject</Text>
            <Text style={styles.descriptionText}>
              Select a subject to explore chapters and topics
            </Text>
          </View>
        }
        renderItem={({ item: subject, index }) => {
          const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
          return (
            <TouchableOpacity
              style={styles.subjectCard}
              onPress={() => router.push(`/subject/${subject.id}`)}
            >
              <LinearGradient
                colors={[color, color]}
                style={styles.subjectTopBorder}
              />
              <View style={styles.subjectContent}>
                <View
                  style={[
                    styles.subjectIcon,
                    { backgroundColor: `${color}15` },
                  ]}
                >
                  <BookOpen color={color} size={28} />
                </View>
                <Text style={styles.subjectName}>{subject.name}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  subjectCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  subjectTopBorder: {
    height: 6,
  },
  subjectContent: {
    padding: 20,
    alignItems: "center",
  },
  subjectIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subjectChapters: {
    fontSize: 12,
    color: "#6B7280",
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  comingSoonIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
