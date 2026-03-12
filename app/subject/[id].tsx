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
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Subject, Chapter } from "@/types/database";
import { apiGetChapters, NoteWithUrl } from "@/lib/api";

interface ChapterWithNotes extends Chapter {
  notes: NoteWithUrl[];
  expanded: boolean;
}

export default function SubjectChaptersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<ChapterWithNotes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjectData();
  }, [id]);

  async function loadSubjectData() {
    try {
      const {
        subject: subjectData,
        chapters: chaptersData,
        notes,
      } = await apiGetChapters(id!);

      setSubject(subjectData);

      const notesByChapter = (notes || []).reduce<
        Record<string, NoteWithUrl[]>
      >((acc, note) => {
        if (!acc[note.chapter_id]) acc[note.chapter_id] = [];
        acc[note.chapter_id].push(note);
        return acc;
      }, {});

      const chaptersWithNotes: ChapterWithNotes[] = (chaptersData || []).map(
        (ch) => ({
          ...ch,
          notes: notesByChapter[ch.id] || [],
          expanded: false,
        }),
      );

      setChapters(chaptersWithNotes);
    } catch (error) {
      console.error("Error loading subject data:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleChapter(chapterId: string) {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId ? { ...c, expanded: !c.expanded } : c,
      ),
    );
  }

  function openPdf(note: NoteWithUrl) {
    if (note.pdf_file_key) {
      router.push({
        pathname: "/pdf-viewer",
        params: { key: note.pdf_file_key, title: note.pdf_file_name },
      });
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Coming Soon if no chapters exist
  if (chapters.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#06B6D4", "#0EA5E9"]}
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
          <Text style={styles.headerTitle}>{subject?.name}</Text>
          <Text style={styles.headerSubtitle}>Chapters</Text>
        </LinearGradient>
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonIcon}>
            <Clock color="#06B6D4" size={48} />
          </View>
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Chapters for this subject are being prepared. Check back soon!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#06B6D4", "#0EA5E9"]}
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
        <Text style={styles.headerTitle}>{subject?.name}</Text>
        <Text style={styles.headerSubtitle}>
          {chapters.length} Chapter{chapters.length !== 1 ? "s" : ""}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chaptersContainer}>
          {chapters.map((chapter, index) => (
            <View key={chapter.id}>
              <TouchableOpacity
                style={styles.chapterCard}
                onPress={() => toggleChapter(chapter.id)}
              >
                <View style={styles.chapterLeft}>
                  <View
                    style={[
                      styles.chapterNumber,
                      { backgroundColor: "#3B82F6" },
                    ]}
                  >
                    <Text style={styles.chapterNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterName}>{chapter.name}</Text>
                    <View style={styles.chapterMeta}>
                      <FileText color="#6B7280" size={14} />
                      <Text style={styles.chapterMetaText}>
                        {chapter.notes.length} Note
                        {chapter.notes.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.expandIcon}>
                  {chapter.expanded ? (
                    <ChevronDown color="#6B7280" size={20} />
                  ) : (
                    <ChevronRight color="#6B7280" size={20} />
                  )}
                </View>
              </TouchableOpacity>

              {chapter.expanded && chapter.notes.length > 0 && (
                <View style={styles.notesContainer}>
                  {chapter.notes.map((note) => (
                    <TouchableOpacity
                      key={note.id}
                      style={styles.noteCard}
                      onPress={() => openPdf(note)}
                    >
                      <View style={styles.noteIcon}>
                        <FileText color="#EF4444" size={20} />
                      </View>
                      <View style={styles.noteInfo}>
                        <Text style={styles.noteName} numberOfLines={1}>
                          {note.pdf_file_name.replace(/\.pdf$/i, "")}
                        </Text>
                        {note.file_size && note.file_size !== "0.0 MB" && (
                          <Text style={styles.noteSize}>{note.file_size}</Text>
                        )}
                      </View>
                      <ChevronRight color="#9CA3AF" size={16} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {chapter.expanded && chapter.notes.length === 0 && (
                <View style={styles.noNotesContainer}>
                  <Text style={styles.noNotesText}>No notes uploaded yet</Text>
                </View>
              )}
            </View>
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
  chaptersContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  chapterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chapterLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chapterNumber: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  chapterNumberText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  chapterInfo: {
    flex: 1,
  },
  chapterName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  chapterMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chapterMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  expandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  notesContainer: {
    marginTop: 4,
    marginLeft: 24,
    marginBottom: 8,
    gap: 6,
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  noteInfo: {
    flex: 1,
  },
  noteName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  noteSize: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  noNotesContainer: {
    marginTop: 4,
    marginLeft: 24,
    marginBottom: 8,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  noNotesText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
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
    backgroundColor: "#ECFEFF",
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
