import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useLibrary } from "@/contexts/LibraryContext";
import { NoteWithUrl } from "@/lib/api";
import { useNavigationLock } from "@/hooks/useNavigationLock";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeColors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChapterWithNotes {
  id: string;
  name: string;
  subject_id: string;
  notes: NoteWithUrl[];
  expanded: boolean;
}

export default function SubjectChaptersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSubject, getChaptersBySubject, getNotesByChapter, isOffline } =
    useLibrary();
  const navigate = useNavigationLock();

  const { theme } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  // All data from cache — instant render
  const subject = getSubject(id!);
  const rawChapters = getChaptersBySubject(id!);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const chapters: ChapterWithNotes[] = rawChapters.map((ch) => ({
    ...ch,
    notes: getNotesByChapter(ch.id),
    expanded: expandedIds.has(ch.id),
  }));

  function toggleChapter(chapterId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }

  function openPdf(note: NoteWithUrl) {
    if (note.pdf_file_key) {
      navigate(() =>
        router.push({
          pathname: "/pdf-viewer",
          params: {
            key: note.pdf_file_key,
            title: note.pdf_file_name,
            // Used to invalidate on-device cache when the same key is replaced
            rev: note.upload_date ?? note.created_at ?? "",
            // Pass the pre-signed R2 URL so pdf-viewer skips the proxy
            url: note.pdf_url ?? "",
          },
        }),
      );
    }
  }

  // Coming Soon if no chapters exist (or offline message if nothing is cached)
  if (chapters.length === 0) {
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
          <Text style={styles.headerTitle}>{subject?.name}</Text>
          <Text style={styles.headerSubtitle}>Chapters</Text>
        </LinearGradient>
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonIcon}>
            <Clock color={theme.primary} size={48} />
          </View>
          <Text style={styles.comingSoonTitle}>
            {isOffline ? "Connect to internet first" : "Coming Soon"}
          </Text>
          <Text style={styles.comingSoonText}>
            {isOffline
              ? "You are offline and this content is not cached yet."
              : "Chapters for this subject are being prepared. Check back soon!"}
          </Text>
        </View>
      </View>
    );
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
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text style={styles.chapterNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterName}>{chapter.name}</Text>
                    <View style={styles.chapterMeta}>
                      <FileText color={theme.textPlaceholder} size={14} />
                      <Text style={styles.chapterMetaText}>
                        {chapter.notes.length} Note
                        {chapter.notes.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.expandIcon}>
                  {chapter.expanded ? (
                    <ChevronDown color={theme.textPlaceholder} size={20} />
                  ) : (
                    <ChevronRight color={theme.textPlaceholder} size={20} />
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
                        <FileText color={theme.error} size={20} />
                      </View>
                      <View style={styles.noteInfo}>
                        <Text style={styles.noteName} numberOfLines={1}>
                          {note.pdf_file_name.replace(/\.pdf$/i, "")}
                        </Text>
                        {note.file_size && note.file_size !== "0.0 MB" && (
                          <Text style={styles.noteSize}>{note.file_size}</Text>
                        )}
                      </View>
                      <ChevronRight color={theme.textPlaceholder} size={16} />
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

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
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
    chaptersContainer: {
      padding: 16,
      paddingBottom: 40,
      gap: 12,
    },
    chapterCard: {
      backgroundColor: theme.card,
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
      color: theme.text,
      marginBottom: 4,
    },
    chapterMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    chapterMetaText: {
      fontSize: 12,
      color: theme.textMuted,
    },
    expandIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.skeletonBase,
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
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    noteIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: theme.errorLight,
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
      color: theme.text,
    },
    noteSize: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    noNotesContainer: {
      marginTop: 4,
      marginLeft: 24,
      marginBottom: 8,
      padding: 16,
      backgroundColor: theme.background,
      borderRadius: 12,
    },
    noNotesText: {
      fontSize: 13,
      color: theme.textMuted,
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
      backgroundColor: theme.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    comingSoonTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 12,
    },
    comingSoonText: {
      fontSize: 15,
      color: theme.textMuted,
      textAlign: "center",
      lineHeight: 22,
    },
  });
