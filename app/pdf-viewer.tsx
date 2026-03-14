import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeColors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLibrary } from "@/contexts/LibraryContext";

const { width } = Dimensions.get("window");
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";

// ─── Stable short hash of a string (used for cache filenames) ────────────────
function stableHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

// Self-contained PDF.js viewer HTML
// Features lazy-loading: renders empty placeholders for pages and only draws
// the actual canvas when the page scrolls into view. This makes opening a
// 100-page PDF as fast as a 1-page PDF.
function getViewerHtml(theme: ThemeColors, isDark: boolean): string {
  // Use slightly darker overlay colors for the PDF canvas in dark mode
  const bg = isDark ? "#1F2937" : theme.background;
  const cardBg = isDark ? "#2D3748" : theme.card;
  const text = isDark ? "#ffffff" : theme.text;

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{background:${bg};font-family:sans-serif;width:100%;overflow-x:hidden;}
    #status{
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      min-height:100vh;color:${text};font-size:15px;gap:12px;
    }
    .spinner {
      width:40px;height:40px;border:3px solid rgba(255,255,255,0.2);
      border-top-color:#6366F1;border-radius:50%;animation:spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    
    #pages{display:flex;flex-direction:column;align-items:center;width:100%;margin:0;padding:0;gap:0;}
    .page-container {
      width:100vw; margin:0; padding:0; border:none;
      background:${cardBg}; display:flex; justify-content:center; align-items:center;
      position: relative;
    }
    canvas{display:block;margin:0;padding:0;border:none;}
    
    #error{color:#EF4444;text-align:center;padding:32px 16px;font-size:15px;}
  </style>
</head>
<body>
  <div id="status">
    <div class="spinner"></div>
    <span id="status-text">Preparing document...</span>
  </div>
  <div id="pages"></div>
  <div id="error" style="display:none"></div>

  <!-- PDF.js from cdnjs -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart',  e => e.preventDefault());
    document.addEventListener('copy',         e => e.preventDefault());

    // Send a message to React Native when the user taps the screen 
    // to toggle fullscreen mode.
    document.addEventListener('click', (e) => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('TOGGLE_FULLSCREEN');
      }
    });

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    let pdfDoc = null;
    let dpr = window.devicePixelRatio || 1;
    const container = document.getElementById('pages');
    
    // We will store page promises to avoid rendering the same page twice
    const renderedPages = new Set();
    
    // Intersection Observer to lazy-load pages
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.dataset.pageNumber);
          renderSinglePage(entry.target, pageNum);
        }
      });
    }, { rootMargin: "200px 0px" }); // Pre-render 200px before scrolling into view

    async function renderSinglePage(pageDiv, pageNum) {
      if (renderedPages.has(pageNum)) return;
      renderedPages.add(pageNum);
      
      try {
        const page = await pdfDoc.getPage(pageNum);
        const baseVp = page.getViewport({ scale: 1 });
        
        // Strictly fit the screen width, ignoring height (no extra padding in horizontal)
        let cssWidth = window.innerWidth;
        let cssHeight = (cssWidth / baseVp.width) * baseVp.height;
        
        // Render at high res for sharpness
        const scale = (cssWidth * dpr) / baseVp.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Exact CSS constraints
        canvas.style.width = cssWidth + 'px';
        canvas.style.height = cssHeight + 'px';
        
        pageDiv.style.height = cssHeight + 'px'; // Prevent layout shifts

        pageDiv.innerHTML = ''; // clear any placeholder loader
        pageDiv.appendChild(canvas);

        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      } catch (err) {
        console.error("Page render error:", err);
      }
    }

    // Called globally by the React Native WebView injectJavaScript
    window.loadPdfBase64 = async function(b64) {
      try {
        const status = document.getElementById('status');
        const statusTxt = document.getElementById('status-text');
        statusTxt.textContent = "Processing PDF data...";
        
        // Convert base64 → Uint8Array
        const raw = atob(b64);
        const uint8Array = new Uint8Array(raw.length);
        for(let i=0; i<raw.length; i++) {
          uint8Array[i] = raw.charCodeAt(i);
        }

        statusTxt.textContent = "Loading Document...";
        pdfDoc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        
        status.style.display = 'none';

        // Get the first page just to measure aspects so we can set up placeholders
        const firstPage = await pdfDoc.getPage(1);
        const firstVp = firstPage.getViewport({ scale: 1 });
        const aspectRatio = firstVp.height / firstVp.width;
        
        // Create skeleton containers for ALL pages instantly
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const pageDiv = document.createElement('div');
          pageDiv.className = 'page-container';
          pageDiv.dataset.pageNumber = i;
          // Set placeholder aspect ratio to prevent jumpy scrolling
          pageDiv.style.aspectRatio = (1 / aspectRatio);
          
          container.appendChild(pageDiv);
          observer.observe(pageDiv);
        }
      } catch (e) {
        document.getElementById('status').style.display = 'none';
        const err = document.getElementById('error');
        err.style.display = 'block';
        err.textContent = 'Could not render PDF: ' + (e.message || e);
      }
    };
  </script>
</body>
</html>`;
}

// ─── Screen ─────────────────────────────────────────────────────────────────
type Stage =
  | { type: "downloading"; progress: number }
  | { type: "rendering" }
  | { type: "done" }
  | { type: "error"; message: string };

export default function PdfViewerScreen() {
  const { key, title, url, rev } = useLocalSearchParams<{
    key?: string;
    title?: string;
    /** Pre-signed R2 URL — direct from library cache (no Vercel proxy) */
    url?: string;
    /** Revision marker (upload date / change timestamp) for cache invalidation */
    rev?: string;
  }>();

  const [stage, setStage] = useState<Stage>({
    type: "downloading",
    progress: 0,
  });
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const webviewRef = useRef<WebView>(null);

  const { refresh } = useLibrary();

  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const syncNavBar = useCallback(async () => {
    await NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark").catch(
      console.warn,
    );
  }, [isDark]);

  useEffect(() => {
    if (isFullscreen) {
      NavigationBar.setVisibilityAsync("hidden").catch(console.warn);
    } else {
      NavigationBar.setVisibilityAsync("visible").catch(console.warn);
    }
  }, [isFullscreen]);

  useFocusEffect(
    useCallback(() => {
      syncNavBar();
      ScreenOrientation.unlockAsync().catch(console.warn);

      const sub = ScreenOrientation.addOrientationChangeListener(() => {
        syncNavBar();
        setTimeout(syncNavBar, 300);
        setTimeout(syncNavBar, 800);
      });

      return () => {
        ScreenOrientation.removeOrientationChangeListener(sub);
        NavigationBar.setVisibilityAsync("visible").catch(console.warn);
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        ).catch(console.warn);
        setTimeout(() => {
          NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark").catch(
            console.warn,
          );
          NavigationBar.setVisibilityAsync("visible").catch(console.warn);
        }, 400);
      };
    }, [syncNavBar, isDark]),
  );

  // ── Download + cache the PDF ────────────────────────────────────────────
  useEffect(() => {
    if (!key && !url) return;

    // Use the stable R2 object key for the cache filename (not the signed URL
    // which changes on every library refresh).
    const cacheId = stableHash(`${key ?? url ?? ""}:${rev ?? ""}`);
    const cachePath = `${FileSystem.cacheDirectory}pdf_${cacheId}.pdf`;

    async function load() {
      try {
        // 1. Check device cache first → instant re-open
        const info = await FileSystem.getInfoAsync(cachePath);
        let localPath = cachePath;

        if (!info.exists) {
          // 2. Determine source URL
          const pdfUrl =
            url && url.length > 0
              ? url
              : `${API_BASE}/api/mobile/pdf?key=${encodeURIComponent(key ?? "")}`;

          // 3. Download with progress tracking
          const dl = FileSystem.createDownloadResumable(
            pdfUrl,
            cachePath,
            {},
            ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
              const p =
                totalBytesExpectedToWrite > 0
                  ? totalBytesWritten / totalBytesExpectedToWrite
                  : 0;
              setStage({ type: "downloading", progress: p });
            },
          );
          const result = await dl.downloadAsync();
          if (!result?.uri) throw new Error("Download failed");
          if (typeof result.status === "number" && result.status >= 400) {
            throw new Error(`Download failed (${result.status})`);
          }
          localPath = result.uri;
        }

        // 4. Read as base64
        setStage({ type: "rendering" });
        const b64 = await FileSystem.readAsStringAsync(localPath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // 5. Store base64 to be injected into WebView
        setPdfBase64(b64);
        setStage({ type: "done" });
      } catch (e: any) {
        const msg = e?.message ?? "Unknown error";

        // If the file was deleted/replaced server-side (or URL expired), refresh
        // the library so the stale entry disappears from the UI.
        if (
          typeof msg === "string" &&
          (msg.includes("(404)") ||
            msg.includes("(403)") ||
            msg.toLowerCase().includes("not found"))
        ) {
          refresh().catch(() => {});
        }

        setStage({ type: "error", message: msg });
      }
    }

    load();
  }, [key, url, rev]);

  const displayTitle = title ? title.replace(/\.pdf$/i, "") : "PDF Viewer";

  if (!key && !url) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No PDF provided</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />
      {/* Header */}
      {!isFullscreen && (
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFFFFF" size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayTitle}
          </Text>
        </View>
      )}

      {/* Content area */}
      <View style={styles.contentArea}>
        {/* Loading / Progress overlay */}
        {(stage.type === "downloading" || stage.type === "rendering") && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.primary} />
            {stage.type === "downloading" ? (
              <>
                <Text style={styles.loadingTitle}>Downloading…</Text>
                <View style={styles.progressBarWrap}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${Math.round(stage.progress * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.loadingSubtitle}>
                  {Math.round(stage.progress * 100)}%
                </Text>
              </>
            ) : (
              <Text style={styles.loadingTitle}>Preparing PDF viewer…</Text>
            )}
          </View>
        )}

        {/* Error state */}
        {stage.type === "error" && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorEmoji}>📄</Text>
            <Text style={styles.errorTitle}>Couldn’t load PDF</Text>
            <Text style={styles.errorSubtitle}>{stage.message}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={async () => {
                // Delete cached file and retry
                const cacheId = stableHash(`${key ?? url ?? ""}:${rev ?? ""}`);
                const cachePath = `${FileSystem.cacheDirectory}pdf_${cacheId}.pdf`;
                await FileSystem.deleteAsync(cachePath, { idempotent: true });
                setStage({ type: "downloading", progress: 0 });
                setPdfBase64(null);
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {pdfBase64 && (
          <WebView
            ref={webviewRef}
            // Use a static HTML template (no massive base64 string inside it)
            source={{ html: getViewerHtml(theme, isDark) }}
            style={styles.webview}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit={false}
            setBuiltInZoomControls={true}
            setDisplayZoomControls={false}
            bounces={false}
            // Once the empty HTML template is loaded, inject the real PDF data
            onLoadEnd={() => {
              webviewRef.current?.injectJavaScript(`
                if (window.loadPdfBase64) {
                  window.loadPdfBase64("${pdfBase64}");
                }
                true;
              `);
            }}
            onMessage={(event) => {
              if (event.nativeEvent.data === "TOGGLE_FULLSCREEN") {
                setIsFullscreen((prev) => !prev);
              }
            }}
            // Block any top-level navigation away from the viewer
            // (prevents download links from opening outside the app).
            // Script/CDN fetches don't go through this callback.
            onShouldStartLoadWithRequest={(req) => {
              const u = req.url;
              // Allow the initial blank page and in-page anchors
              if (u === "about:blank" || u.startsWith("about:") || u === "")
                return true;
              // Block blob downloads, external http navigation, etc.
              if (u.startsWith("blob:") || u.startsWith("http")) return false;
              return true;
            }}
          />
        )}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: theme.primary,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    contentArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    webview: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.overlay,
      zIndex: 10,
      gap: 12,
    },
    loadingTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    loadingSubtitle: {
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
    },
    progressBarWrap: {
      width: "70%",
      height: 6,
      borderRadius: 99,
      backgroundColor: "rgba(255,255,255,0.15)",
      overflow: "hidden",
    },
    progressBar: {
      height: 6,
      borderRadius: 99,
      backgroundColor: theme.primary,
    },
    errorOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.overlay,
      zIndex: 20,
      padding: 32,
      gap: 8,
    },
    errorEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    errorSubtitle: {
      fontSize: 13,
      color: "rgba(255,255,255,0.7)",
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 8,
    },
    retryButton: {
      marginTop: 8,
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 32,
    },
    retryText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    errorText: {
      fontSize: 15,
      color: theme.error,
      textAlign: "center",
      marginTop: 40,
    },
  });
