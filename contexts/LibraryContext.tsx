import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Block, Subject, Chapter } from "@/types/database";
import {
  ApiError,
  NoteWithUrl,
  apiGetLibrary,
  apiGetLibraryVersion,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const CACHE_KEY = "@mednotes_library_v1";
// Refresh in background if cached data is older than 10 minutes
const STALE_AFTER_MS = 10 * 60 * 1000;
// Lightweight change-check interval (only fetch full library when version changes)
const VERSION_POLL_MS = 5 * 1000;

interface LibraryData {
  blocks: Block[];
  subjects: Subject[];
  chapters: Chapter[];
  notes: NoteWithUrl[];
  /** latest server-side change marker (ISO timestamp) */
  version: string | null;
  fetchedAt: number;
}

interface LibraryContextType {
  /** true only on very first load with no cache at all */
  isLoading: boolean;
  /** true if a background refresh is happening */
  isRefreshing: boolean;
  /** best-effort indicator that the device is offline */
  isOffline: boolean;
  blocks: Block[];
  subjects: Subject[];
  chapters: Chapter[];
  notes: NoteWithUrl[];
  getBlocksByYear: (year: number) => Block[];
  getSubjectsByBlock: (blockId: string) => Subject[];
  getChaptersBySubject: (subjectId: string) => Chapter[];
  getNotesByChapter: (chapterId: string) => NoteWithUrl[];
  getBlock: (id: string) => Block | undefined;
  getSubject: (id: string) => Subject | undefined;
  refresh: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType>({
  isLoading: true,
  isRefreshing: false,
  isOffline: false,
  blocks: [],
  subjects: [],
  chapters: [],
  notes: [],
  getBlocksByYear: () => [],
  getSubjectsByBlock: () => [],
  getChaptersBySubject: () => [],
  getNotesByChapter: () => [],
  getBlock: () => undefined,
  getSubject: () => undefined,
  refresh: async () => {},
});

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();

  const [data, setData] = useState<LibraryData>({
    blocks: [],
    subjects: [],
    chapters: [],
    notes: [],
    version: null,
    fetchedAt: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const currentVersionRef = useRef<string | null>(null);
  const hasEverFetchedRef = useRef(false);
  const refreshLockRef = useRef(false);
  const checkLockRef = useRef(false);
  const lastForcedRefreshRef = useRef(0);

  useEffect(() => {
    currentVersionRef.current = data.version ?? null;
  }, [data.version]);

  useEffect(() => {
    if (data.fetchedAt > 0) hasEverFetchedRef.current = true;
  }, [data.fetchedAt]);

  const applyData = useCallback((d: LibraryData) => {
    setData(d);
  }, []);

  const fetchAndStore = useCallback(
    async (versionOverride?: string | null) => {
      if (refreshLockRef.current) return;
      refreshLockRef.current = true;
      try {
        // Cache-bust to avoid any intermediate CDN caching.
        const json = await apiGetLibrary(Date.now());
        const fresh: LibraryData = {
          blocks: json.blocks || [],
          subjects: json.subjects || [],
          chapters: json.chapters || [],
          notes: json.notes || [],
          version: versionOverride ?? currentVersionRef.current ?? null,
          fetchedAt: Date.now(),
        };
        applyData(fresh);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
        setIsOffline(false);
      } catch (err: unknown) {
        if (err instanceof ApiError && err.isNetworkError) {
          setIsOffline(true);
        }
        console.warn("LibraryContext: background refresh failed", err);
      } finally {
        refreshLockRef.current = false;
      }
    },
    [applyData],
  );

  const checkForUpdates = useCallback(async () => {
    if (!isLoggedIn) return;
    if (checkLockRef.current) return;
    checkLockRef.current = true;

    try {
      const res = await apiGetLibraryVersion();
      const latest = res.version;
      const current = currentVersionRef.current;

      setIsOffline(false);

      // If we have never successfully fetched the library (e.g. cold-started offline),
      // then the first time we can reach the server we should fetch the full library.
      if (latest && !hasEverFetchedRef.current) {
        setIsRefreshing(true);
        await fetchAndStore(latest);
        setIsRefreshing(false);
        return;
      }

      // If we don't have a version yet, adopt it (no full refresh needed)
      if (!current && latest) {
        currentVersionRef.current = latest;
        setData((prev) => ({ ...prev, version: latest }));
        return;
      }

      if (latest && current && latest !== current) {
        setIsRefreshing(true);
        await fetchAndStore(latest);
        setIsRefreshing(false);
      }
    } catch (e) {
      // Ignore version check errors; the app still works with cached data
      if (e instanceof ApiError && e.isNetworkError) {
        setIsOffline(true);
      }
      console.warn("LibraryContext: version check failed", e);

      // If the change-check endpoint isn't available (or network is flaky),
      // still keep the app reasonably fresh without requiring logout.
      const now = Date.now();
      if (now - lastForcedRefreshRef.current > 30 * 1000) {
        lastForcedRefreshRef.current = now;
        setIsRefreshing(true);
        await fetchAndStore();
        setIsRefreshing(false);
      }
    } finally {
      checkLockRef.current = false;
    }
  }, [fetchAndStore, isLoggedIn]);

  useEffect(() => {
    async function init() {
      // 1. Try to read from cache immediately — instant render
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as Partial<LibraryData>;
          applyData({
            blocks: parsed.blocks ?? [],
            subjects: parsed.subjects ?? [],
            chapters: parsed.chapters ?? [],
            notes: parsed.notes ?? [],
            version: parsed.version ?? null,
            fetchedAt: parsed.fetchedAt ?? 0,
          });
          setIsLoading(false);

          // 2. If stale, refresh in background without blocking UI
          const age = Date.now() - (parsed.fetchedAt || 0);
          if (age > STALE_AFTER_MS) {
            setIsRefreshing(true);
            await fetchAndStore();
            setIsRefreshing(false);
          }

          // If user is logged in, also do a lightweight update check.
          // This makes admin uploads/edits appear quickly without waiting for staleness.
          await checkForUpdates();
          return;
        }
      } catch {
        // ignore cache errors
      }

      // 3. No cache — must fetch (first launch)
      try {
        await fetchAndStore();
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [applyData, fetchAndStore, checkForUpdates]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Check right after login / mount
    checkForUpdates();

    // Check whenever the app returns to foreground
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkForUpdates();
    });

    // Periodic lightweight checks
    const interval = setInterval(checkForUpdates, VERSION_POLL_MS);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [checkForUpdates, isLoggedIn]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAndStore();
    setIsRefreshing(false);
  }, [fetchAndStore]);

  // Memoised filter helpers — pure local computation, zero network
  const getBlocksByYear = useCallback(
    (year: number) => data.blocks.filter((b: Block) => b.year === year),
    [data.blocks],
  );

  const getSubjectsByBlock = useCallback(
    (blockId: string) =>
      data.subjects
        .filter((s: Subject) => s.block_id === blockId)
        .slice()
        .sort((a, b) => {
          const ao = a.sort_order ?? 0;
          const bo = b.sort_order ?? 0;
          if (ao !== bo) return ao - bo;
          return a.name.localeCompare(b.name);
        }),
    [data.subjects],
  );

  const getChaptersBySubject = useCallback(
    (subjectId: string) =>
      data.chapters
        .filter((c: Chapter) => c.subject_id === subjectId)
        .slice()
        .sort((a, b) => {
          const ao = a.sort_order ?? 0;
          const bo = b.sort_order ?? 0;
          if (ao !== bo) return ao - bo;
          return a.name.localeCompare(b.name);
        }),
    [data.chapters],
  );

  const getNotesByChapter = useCallback(
    (chapterId: string) =>
      data.notes.filter((n: NoteWithUrl) => n.chapter_id === chapterId),
    [data.notes],
  );

  const getBlock = useCallback(
    (id: string) => data.blocks.find((b: Block) => b.id === id),
    [data.blocks],
  );

  const getSubject = useCallback(
    (id: string) => data.subjects.find((s: Subject) => s.id === id),
    [data.subjects],
  );

  return (
    <LibraryContext.Provider
      value={{
        isLoading,
        isRefreshing,
        isOffline,
        blocks: data.blocks,
        subjects: data.subjects,
        chapters: data.chapters,
        notes: data.notes,
        getBlocksByYear,
        getSubjectsByBlock,
        getChaptersBySubject,
        getNotesByChapter,
        getBlock,
        getSubject,
        refresh,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}
