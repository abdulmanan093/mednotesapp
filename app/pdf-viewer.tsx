import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import * as ScreenOrientation from "expo-screen-orientation";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";

export default function PdfViewerScreen() {
  const { key, title } = useLocalSearchParams<{
    key: string;
    title: string;
  }>();

  useEffect(() => {
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    };
  }, []);

  if (!key) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No PDF provided</Text>
      </View>
    );
  }

  const pdfUrl = `${API_BASE}/api/mobile/pdf?key=${encodeURIComponent(key)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1F2937; }
    #pages { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px; }
    canvas { display: block; width: 100% !important; height: auto !important; }
    #loading { color: #9CA3AF; text-align: center; padding: 40px; font-family: sans-serif; font-size: 16px; }
    #error { color: #EF4444; text-align: center; padding: 40px; font-family: sans-serif; font-size: 14px; }
  </style>
</head>
<body>
  <div id="loading">Loading PDF...</div>
  <div id="pages"></div>
  <div id="error" style="display:none"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    pdfjsLib.getDocument('${pdfUrl}').promise.then(function(pdf) {
      document.getElementById('loading').style.display = 'none';
      var container = document.getElementById('pages');
      
      function renderPage(num) {
        return pdf.getPage(num).then(function(page) {
          var scale = 2;
          var viewport = page.getViewport({ scale: scale });
          var canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          container.appendChild(canvas);
          return page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
        });
      }
      
      var promise = Promise.resolve();
      for (var i = 1; i <= pdf.numPages; i++) {
        promise = promise.then((function(pageNum) {
          return function() { return renderPage(pageNum); };
        })(i));
      }
    }).catch(function(err) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('error').style.display = 'block';
      document.getElementById('error').textContent = 'Failed to load PDF: ' + err.message;
    });
  </script>
</body>
</html>`;

  const displayTitle = title ? title.replace(/\.pdf$/i, "") : "PDF Viewer";

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 }]}>
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
      <WebView
        source={{ html }}
        style={styles.webview}
        originWhitelist={["*"]}
        javaScriptEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F2937",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: "#6366F1",
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
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9CA3AF",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
});
