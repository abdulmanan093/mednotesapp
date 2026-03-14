export const Colors = {
  light: {
    background: "#F9FAFB",       // Main app background
    card: "#ffffffff",             // Card / header backgrounds
    text: "#1F2937",             // Primary text
    textMuted: "#6B7280",        // Secondary/muted text
    textPlaceholder: "#9CA3AF",  // Placeholder / light text
    border: "#E5E7EB",           // Dividers, list borders
    primary: "#6366F1",          // Brand color
    primaryLight: "#EEF2FF",     // Brand tinted background
    primaryGradientStart: "#6366F1",
    primaryGradientEnd: "#8B5CF6",
    success: "#10B981",          // success/active states
    error: "#EF4444",            // errors/disabled states
    errorLight: "#FEE2E2",       // tinted error background
    warning: "#F59E0B",          // warning
    warningLight: "#FEF3C7",     // tinted warning background
    info: "#3B82F6",             // info items (contact)
    infoLight: "#DBEAFE",        // tinted info background
    skeletonBase: "#F3F4F6",     // skeleton load background
    skeletonLine: "#E5E7EB",     // skeleton line highlight
    tabBar: "#FFFFFF",           // Bottom tab background
    overlay: "rgba(0,0,0,0.5)",  // Modal overlay
  },
  dark: {
    background: "#111827",       // Main app background
    card: "#1F2937",             // Card / header backgrounds
    text: "#F9FAFB",             // Primary text
    textMuted: "#9CA3AF",        // Secondary/muted text
    textPlaceholder: "#6B7280",  // Placeholder / light text
    border: "#374151",           // Dividers, list borders
    primary: "#818CF8",          // Brand color (lighter for dark mode)
    primaryLight: "#312E81",     // Brand tinted background
    primaryGradientStart: "#4F46E5",
    primaryGradientEnd: "#7C3AED",
    success: "#34D399",          // success/active states
    error: "#F87171",            // errors/disabled states
    errorLight: "#7F1D1D",       // tinted error background
    warning: "#FBBF24",          // warning
    warningLight: "#78350F",     // tinted warning background
    info: "#60A5FA",             // info items (contact)
    infoLight: "#1E3A8A",        // tinted info background
    skeletonBase: "#374151",     // skeleton load background
    skeletonLine: "#4B5563",     // skeleton line highlight
    tabBar: "#1F2937",           // Bottom tab background
    overlay: "rgba(0,0,0,0.7)",  // Modal overlay
  },
};

export type ThemeColors = typeof Colors.light;
