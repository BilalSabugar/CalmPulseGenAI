// Centralized theme system for React Native
// API: ThemeProvider, useTheme, useThemeMode, createStyles, variants

import React from "react";
import { StyleSheet, useColorScheme } from "react-native";

/* =========
   Tokens
========= */
const COLORS = {
  light: {
    background: "#FFFFFF",
    surface: "#F8FAFC",
    card: "#FFFFFF",
    text: "#0F172A",
    textDim: "#64748B",
    border: "#E2E8F0",
    primary: "#4F46E5", // indigo-600
    primaryText: "#FFFFFF",
    ghost: "#F1F5F9",
    placeholder: "#94A3B8",
    danger: "#DC2626",
  },
  dark: {
    background: "#0B1220",
    surface: "#0F172A",
    card: "#0B1220",
    text: "#E5E7EB",
    textDim: "#94A3B8",
    border: "#1F2937",
    primary: "#60A5FA", // sky-400
    primaryText: "#0B1220",
    ghost: "rgba(30,41,59,0.7)",
    placeholder: "#64748B",
    danger: "#F87171",
  },
};

const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

const TYPO = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  title: 28,
};

const ELEVATION = {
  card: 3,
  raised: 6,
};

/* =========
   Theme Context
========= */
const ThemeCtx = React.createContext(null);

/**
 * ThemeProvider
 * mode: "light" | "dark" | "system"
 */
export function ThemeProvider({ mode: modeProp = "system", children }) {
  const sys = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = React.useState(modeProp);

  // If caller changes the prop we sync once
  React.useEffect(() => setMode(modeProp), [modeProp]);

  const resolvedMode = mode === "system" ? (sys ?? "light") : mode;
  const palette = resolvedMode === "dark" ? COLORS.dark : COLORS.light;

  const theme = React.useMemo(
    () => ({
      mode: resolvedMode,
      color: palette,
      spacing: SPACING,
      radius: RADII,
      type: TYPO,
      elevation: ELEVATION,
    }),
    [resolvedMode, palette]
  );

  const value = React.useMemo(() => ({ theme, mode, setMode }), [theme, mode]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

/* =========
   Hooks
========= */
export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx; // { theme, mode, setMode }
}

export function useThemeMode() {
  const ctx = useTheme();
  return { mode: ctx.mode, setMode: ctx.setMode };
}

/**
 * createStyles(factory) — hook that returns a StyleSheet created from theme
 * usage: const s = createStyles(t => ({ container: { backgroundColor: t.color.background } }))
 */
export function createStyles(factory) {
  const { theme } = useTheme();
  // Allow factory to optionally return plain object or [object, inline]
  const stylesObj = factory(theme);
  return StyleSheet.create(stylesObj);
}

/* =========
   Design Variants (re-usable pieces)
========= */
export function variants(t) {
  return {
    card: {
      base: {
        backgroundColor: t.color.card,
        borderRadius: t.radius.xl,
        padding: t.spacing.lg,
        borderWidth: 1,
        borderColor: t.color.border,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: t.elevation.card,
      },
    },

    text: {
      title: {
        fontSize: t.type.title,
        fontWeight: "700",
        color: t.color.text,
      },
      subtitle: {
        fontSize: t.type.md,
        color: t.color.textDim,
      },
      link: {
        fontSize: t.type.sm,
        color: t.color.primary,
        fontWeight: "600",
      },
      small: {
        fontSize: t.type.xs,
        color: t.color.textDim,
      },
      body: {
        fontSize: t.type.md,
        color: t.color.text,
      },
    },

    input: {
      base: {
        width: "100%",
        paddingVertical: 12,
        paddingHorizontal: t.spacing.md,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: t.color.border,
        backgroundColor: t.color.surface,
        color: t.color.text,
        fontSize: t.type.md,
      },
      placeholder: {
        color: t.color.placeholder,
      },
    },

    button: {
      base: {
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: t.radius.pill,
        paddingHorizontal: t.spacing.lg,
        paddingVertical: 12,
        flexDirection: "row",
        gap: 8,
      },
      primary: {
        backgroundColor: t.color.primary,
      },
      ghost: {
        backgroundColor: t.color.ghost,
        borderWidth: 1,
        borderColor: t.color.border,
      },
      text: {
        color: t.color.primaryText,
        fontWeight: "600",
        fontSize: t.type.md,
      },
      textGhost: {
        color: t.color.text,
        fontWeight: "600",
        fontSize: t.type.md,
      },
      danger: {
        backgroundColor: t.color.danger,
      },
    },

    chip: {
      base: {
        borderRadius: t.radius.pill,
        paddingHorizontal: t.spacing.sm,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: t.color.border,
        backgroundColor: t.color.surface,
      },
      text: {
        fontSize: t.type.sm,
        color: t.color.textDim,
      },
      selected: {
        backgroundColor: t.color.primary,
        borderColor: t.color.primary,
      },
      selectedText: {
        color: t.color.primaryText,
      },
    },
  };
}
