import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Platform,
  Linking,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Home,
  MessageSquare,
  Compass,
  BarChart3,
  Users,
  Bell,
  Sun,
  Moon,
  Menu,
  PlusCircle,
  Lightbulb,
  Wind,
  ClipboardList,
  MessageCircleOff,
  BookOpen,
  BrainCircuit,
  Sparkles,
  Siren,
  AlertTriangle,
} from "lucide-react-native";
import { LineChart, ProgressChart } from "react-native-chart-kit";
import isDesktop from "../components/functions/isDesktop";
import { height } from "../components/constants";
import { useNavigation } from "@react-navigation/native";

// --- Theme ---
type Scheme = "light" | "dark";
const COLORS = {
  light: {
    bg: "#f8fafc", // slate-50
    text: "#1f2937", // slate-800
    card: "#ffffff",
    border: "#e2e8f0", // slate-200
    subtle: "#64748b", // slate-500
    subtle2: "#94a3b8", // slate-400
    indigo50: "#eef2ff",
    indigo600: "#4f46e5",
    indigo500: "#6366f1",
    indigo300: "#a5b4fc",
    slate700: "#334155",
    slate800: "#1f2937",
    red50: "#fef2f2",
    red600: "#dc2626",
    green50: "#ecfdf5",
    green700: "#047857",
    purple50: "#f5f3ff",
    purple700: "#6d28d9",
    yellow50: "#fffbeb",
    yellow700: "#a16207",
    blue50: "#eff6ff",
    blue700: "#1d4ed8",
  },
  dark: {
    bg: "#0f172a", // slate-900
    text: "#e2e8f0", // slate-200
    card: "#0f172a",
    border: "#334155", // slate-700
    subtle: "#94a3b8", // slate-400
    subtle2: "#94a3b8",
    indigo50: "#312e81", // used for active bg
    indigo600: "#4f46e5",
    indigo500: "#6366f1",
    indigo300: "#a5b4fc",
    slate700: "#334155",
    slate800: "#1f2937",
    red50: "rgba(185,28,28,0.3)",
    red600: "#fca5a5",
    green50: "rgba(5,150,105,0.2)",
    green700: "#86efac",
    purple50: "rgba(109,40,217,0.2)",
    purple700: "#c4b5fd",
    yellow50: "rgba(161,98,7,0.2)",
    yellow700: "#fde68a",
    blue50: "#1f2937",
    blue700: "#60a5fa",
  },
} as const;

const useTheme = () => {
  const [scheme, setScheme] = useState<Scheme>("light");
  useEffect(() => {
    (async () => {
      const saved = (await AsyncStorage.getItem("cp_dash_theme")) as Scheme | null;
      if (saved) setScheme(saved);
    })();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem("cp_dash_theme", scheme);
  }, [scheme]);
  return { scheme, setScheme, C: COLORS[scheme] };
};

// --- Helpers ---
const mdWidth = 1024; // Tailwind md breakpoint approximation
const isWeb = Platform.OS === "web";

const Elevate = (webShadow = "0 10px 20px rgba(0,0,0,0.06)") =>
  Platform.select({
    web: { boxShadow: webShadow },
    default: {
      shadowColor: "#000",
      shadowOpacity: 0.07,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
  })!;

// Simple fade-in-up wrapper matching your CSS animation
const FadeInUp: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 500, delay, useNativeDriver: true, easing: undefined as any }).start();
  }, [t, delay]);
  return (
    <Animated.View style={{ opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
      {children}
    </Animated.View>
  );
};

export default function Homescreen() {
  const { width } = useWindowDimensions();
  const isMd = isDesktop;
  const { scheme, setScheme, C } = useTheme();

  const navigation = useNavigation();

  // Sidebar modal (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleTheme = () => setScheme((p) => (p === "light" ? "dark" : "light"));

  // Mood state
  const [mood, setMood] = useState<string>("😐");

  // Crisis modal
  const [crisisOpen, setCrisisOpen] = useState(false);

  // Charts palette
  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: C.card,
      backgroundGradientTo: C.card,
      color: () => C.indigo500,
      labelColor: () => C.subtle,
      decimalPlaces: 1,
      propsForDots: { r: "0" },
      propsForBackgroundLines: { stroke: scheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" },
    }),
    [C, scheme]
  );

  const lineWidth = isDesktop ? 350 : width - 8;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Sidebar (md and up) */}
        {isMd ? (
          <View
            style={{
              width: 256,
              backgroundColor: C.card,
              borderRightWidth: 1,
              borderColor: C.border,
              padding: 24,
            }}
          >
            {/* Logo + profile */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: scheme === "light" ? C.indigo50 : C.slate700, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontWeight: "800", color: scheme === "light" ? C.indigo600 : C.indigo300 }}>CP</Text>
              </View>
              <View>
                <Text style={{ fontWeight: "800", color: C.text }}>Calm Pulse</Text>
                <Text style={{ color: C.subtle2, fontSize: 12 }}>Welcome back, SkyWalker</Text>
              </View>
            </View>

            <View style={{ backgroundColor: scheme === "light" ? C.indigo50 : "rgba(51,65,85,0.5)", padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: scheme === "light" ? "#1e3a8a" : C.indigo300 }}>SkyWalker</Text>
              <Text style={{ fontSize: 11, color: scheme === "light" ? C.indigo600 : C.indigo300 }}>7-day streak • 3 badges</Text>
            </View>

            {/* Nav */}
            <View style={{ gap: 8 }}>
              {[
                { icon: <Home size={18} color={scheme === "light" ? C.indigo600 : C.indigo300} />, label: "Home", active: true },
                { icon: <MessageSquare size={18} color={C.subtle} />, label: "Chat" },
                { icon: <Compass size={18} color={C.subtle} />, label: "Tools" },
                { icon: <BarChart3 size={18} color={C.subtle} />, label: "Insights" },
                { icon: <Users size={18} color={C.subtle} />, label: "Community" },
              ].map((item, i) => (
                <Pressable key={i} style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
                  backgroundColor: item.active ? (scheme === "light" ? C.indigo50 : C.indigo50) : "transparent",
                }}>
                  {item.icon}
                  <Text style={{ fontWeight: "600", color: item.active ? (scheme === "light" ? C.indigo600 : C.indigo300) : C.text }}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ marginTop: "auto", backgroundColor: scheme === "light" ? C.indigo50 : "rgba(51,65,85,0.5)", padding: 16, borderRadius: 12 }}>
              <Text style={{ fontWeight: "800", fontSize: 12, color: scheme === "light" ? "#1e3a8a" : C.indigo300 }}>💡 Tip</Text>
              <Text style={{ color: scheme === "light" ? C.indigo600 : C.indigo300, fontSize: 12, marginTop: 4 }}>Try 'Vent Mode' when you just want to be heard.</Text>
            </View>
          </View>
        ) : null}

        {/* Main */}
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ position: "sticky" as any, top: 0, zIndex: 10, backgroundColor: isWeb ? (scheme === "light" ? "rgba(248,250,252,0.8)" : "rgba(15,23,42,0.8)") : C.bg, borderBottomWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: isMd ? 24 : 16 }}>
            {!isMd ? (
              <Pressable onPress={() => setSidebarOpen(true)} style={{ padding: 8, marginLeft: -8 }}>
                <Menu size={22} color={C.subtle} />
              </Pressable>
            ) : (
              <View />
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              {!isMd ? <Text style={{ fontSize: 20, fontWeight: "800", color: scheme === "light" ? "#0f172a" : "#ffffff" }}>Dashboard</Text> : (
                <Pressable onPress={() => navigation.navigate('ChatScreen')} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 64, backgroundColor: scheme === "light" ? "#0f172a" : "#ffffff" }}>
                  <Text style={{ color: scheme === "light" ? "#ffffff" : "#0f172a", fontWeight: "600", fontSize: 13 }}>Start Chat</Text>
                </Pressable>
              )}
              <Pressable style={{ padding: 8, borderRadius: 999 }}>
                <Bell size={18} color={C.subtle} />
              </Pressable>
              <Pressable onPress={toggleTheme} style={{ padding: 8, borderRadius: 999 }}>
                {scheme === "light" ? <Sun size={18} color={C.subtle} /> : <Moon size={18} color={C.subtle} />}
              </Pressable>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: scheme === "light" ? "#bfdbfe" : C.blue50, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: scheme === "light" ? "#ffffff" : C.border }}>
                <Text style={{ fontWeight: "800", color: scheme === "light" ? C.blue700 : C.blue700 }}>S</Text>
              </View>
            </View>
          </View>


          {/* Content */}
          <ScrollView contentContainerStyle={{ padding: isMd ? 24 : 16, gap: 24 }}>
            <View style={{ flexDirection: isDesktop ? "row" : 'column', justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", gap: 24, flexWrap: "wrap" }}>
                {/* Left column */}
                <View style={{ width: isMd ? (width - 256 - 24 * 3) * 0.66 : "100%", gap: 24 }}>
                  {/* Welcome Card */}
                  <FadeInUp delay={100}>
                    <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 20, fontWeight: "800", color: scheme === "light" ? "#0f172a" : "#ffffff" }}>Hi SkyWalker, how are you feeling today?</Text>
                          <Text style={{ color: C.subtle, marginTop: 4 }}>
                            Your calm streak is <Text style={{ fontWeight: "800", color: C.indigo500 }}>7 days</Text>. Keep it going ✨
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                          {/* Doughnut-like progress */}
                          <View style={{ alignItems: "center" }}>
                            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: scheme === "light" ? "#f1f5f9" : C.slate700, alignItems: "center", justifyContent: "center" }}>
                              <ProgressChart
                                data={{ data: [0.75] }}
                                width={64}
                                height={64}
                                strokeWidth={8}
                                radius={28}
                                hideLegend
                                chartConfig={{
                                  backgroundGradientFrom: "transparent",
                                  backgroundGradientTo: "transparent",
                                  color: () => C.indigo500,
                                }}
                                style={{ position: "absolute", left: 0, top: 0 }}
                              />
                              <Text style={{ fontWeight: "800", color: C.indigo500 }}>75%</Text>
                            </View>
                            <Text style={{ marginTop: 8, color: C.subtle, fontSize: 12 }}>Habit progress</Text>
                          </View>
                          <Pressable style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: C.indigo600 }}>
                            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Check in now</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </FadeInUp>

                  {/* Quick Mood Check */}
                  <FadeInUp delay={200}>
                    <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                      <Text style={{ fontWeight: "800", fontSize: 16, color: C.text }}>Quick Mood Check</Text>
                      <Text style={{ color: C.subtle, fontSize: 12 }}>Tap an emoji to log your mood.</Text>
                      <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginVertical: 16 }}>
                        {["😡", "😕", "😐", "🙂", "😁"].map((e) => {
                          const active = mood === e;
                          return (
                            <Pressable key={e} onPress={() => setMood(e)} style={{ padding: 8, borderRadius: 999, transform: [{ scale: active ? 1.25 : 1 }], borderWidth: active ? 4 : 0, borderColor: active ? C.indigo500 : "transparent" }}>
                              <Text style={{ fontSize: 32 }}>{e}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
                        <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <PlusCircle size={16} color={C.indigo500} />
                          <Text style={{ color: C.indigo500, fontWeight: "600", fontSize: 13 }}>Add a note</Text>
                        </Pressable>
                        <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Lightbulb size={16} color={C.indigo500} />
                          <Text style={{ color: C.indigo500, fontWeight: "600", fontSize: 13 }}>Suggested action</Text>
                        </Pressable>
                      </View>
                    </View>
                  </FadeInUp>

                  {/* Quick Tools */}
                  <FadeInUp delay={300}>
                    <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                      <Text style={{ fontWeight: "800", fontSize: 16, color: C.text, marginBottom: 12 }}>Quick Tools</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                        {[
                          { bg: scheme === "light" ? "#fef2f2" : "rgba(185,28,28,0.2)", color: scheme === "light" ? "#b91c1c" : "#fecaca", icon: <Wind size={24} color={scheme === "light" ? "#b91c1c" : "#fecaca"} />, title: "1-min Breathe", sub: "Box breathing" },
                          { bg: scheme === "light" ? "#eff6ff" : "rgba(30,64,175,0.2)", color: scheme === "light" ? "#1d4ed8" : "#93c5fd", icon: <ClipboardList size={24} color={scheme === "light" ? "#1d4ed8" : "#93c5fd"} />, title: "Mood Check", sub: "Daily reflection" },
                          { bg: scheme === "light" ? "#f1f5f9" : C.slate700, color: C.text, icon: <MessageCircleOff size={24} color={C.text} />, title: "Vent Mode", sub: "No advice, just listen" },
                          { bg: scheme === "light" ? "#ecfdf5" : "rgba(5,150,105,0.2)", color: scheme === "light" ? "#047857" : "#86efac", icon: <BookOpen size={24} color={scheme === "light" ? "#047857" : "#86efac"} />, title: "Journal", sub: "Prompt of the day" },
                          { bg: scheme === "light" ? "#f5f3ff" : "rgba(109,40,217,0.2)", color: scheme === "light" ? "#6d28d9" : "#c4b5fd", icon: <BrainCircuit size={24} color={scheme === "light" ? "#6d28d9" : "#c4b5fd"} />, title: "Meditate", sub: "5-min calm" },
                          { bg: scheme === "light" ? "#fffbeb" : "rgba(161,98,7,0.2)", color: scheme === "light" ? "#a16207" : "#fde68a", icon: <Sparkles size={24} color={scheme === "light" ? "#a16207" : "#fde68a"} />, title: "Affirm", sub: "Positive cue" },
                        ].map((t, i) => (
                          <View key={i} style={{ flexBasis: "48%", padding: 16, borderRadius: 12, backgroundColor: t.bg }}>
                            <View style={{ alignItems: "center" }}>{t.icon}</View>
                            <Text style={{ textAlign: "center", marginTop: 8, fontWeight: "700", color: t.color, fontSize: 13 }}>{t.title}</Text>
                            <Text style={{ textAlign: "center", color: t.color, opacity: 0.7, fontSize: 11 }}>{t.sub}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </FadeInUp>

                  <View style={{ flexDirection: isDesktop ? "row" : "column", flex: 1, justifyContent: "space-between", width: "100%" }} >
                    {/* Goals & Achievements */}
                    <FadeInUp delay={400}>
                      <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                        <Text style={{ fontWeight: "800", fontSize: 16, color: C.text, marginBottom: 12 }}>Goals & Achievements</Text>
                        {[
                          { label: "Sleep 7h avg", pct: 70 },
                          { label: "Breathe 5x/week", pct: 45 },
                          { label: "Log mood daily", pct: 80 },
                        ].map((g, i) => (
                          <View key={i} style={{ marginBottom: 12 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                              <Text style={{ fontSize: 13, fontWeight: "600", color: C.subtle2 }}>{g.label}</Text>
                              <Text style={{ fontSize: 13, fontWeight: "700", color: C.subtle }}>{g.pct}%</Text>
                            </View>
                            <View style={{ height: 8, borderRadius: 999, backgroundColor: scheme === "light" ? "#e5e7eb" : C.slate700 }}>
                              <View style={{ width: `${g.pct}%`, height: 8, borderRadius: 999, backgroundColor: C.indigo500 }} />
                            </View>
                          </View>
                        ))}
                        <Pressable style={{ marginTop: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: scheme === "light" ? "#f1f5f9" : C.slate700 }}>
                          <Text style={{ textAlign: "center", fontWeight: "800", color: C.text, fontSize: 13 }}>View badges</Text>
                        </Pressable>
                      </View>
                    </FadeInUp>
                    <FadeInUp delay={300}>
                      <View style={{ backgroundColor: scheme === "light" ? "#fef2f2" : "rgba(185,28,28,0.3)", padding: 24, borderRadius: 16 }}>
                        <Text style={{ fontWeight: "800", fontSize: 16, color: scheme === "light" ? "#991b1b" : "#fecaca" }}>Need urgent help?</Text>
                        <Text style={{ color: scheme === "light" ? "#b91c1c" : "#fecaca", fontSize: 12, marginTop: 4 }}>
                          If you're in crisis, contact emergency services or a trusted helpline immediately.
                        </Text>
                        <View style={{ marginTop: 12, gap: 6 }}>
                          <Pressable onPress={() => Linking.openURL("tel:112")}>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: scheme === "light" ? "#991b1b" : "#fecaca" }}>India: 112</Text>
                          </Pressable>
                          <Pressable onPress={() => Linking.openURL("tel:18005990019")}>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: scheme === "light" ? "#991b1b" : "#fecaca" }}>Kiran: 1800-599-0019</Text>
                          </Pressable>
                        </View>
                      </View>
                    </FadeInUp>
                  </View>
                </View>


                {/* Week at a glance */}
                <FadeInUp delay={200}>
                  <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                    <Text style={{ fontWeight: "800", fontSize: 16, color: C.text }}>Your week at a glance</Text>
                    <Text style={{ color: C.subtle, fontSize: 12 }}>Mood trend & sleep hours</Text>

                    {/* Mood */}
                    <View style={{ marginTop: 16 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: C.text }}>Mood (1-5)</Text>
                        <Text style={{ fontSize: 13, color: C.subtle }}>Latest: <Text style={{ fontWeight: "800", color: C.indigo500 }}>5</Text></Text>
                      </View>
                      <View style={{ marginTop: 8, paddingVertical: 10, overflow: "hidden" }}>
                        <LineChart
                          data={{
                            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                            datasets: [{ data: [3, 4, 3, 5, 4, 5, 5] }],
                          }}
                          width={lineWidth}
                          height={160}
                          chartConfig={chartConfig}
                          bezier
                          withDots={false}
                          withInnerLines
                          withOuterLines={false}
                          withShadow={false}
                          fromZero
                          segments={4}
                          getDotColor={() => "transparent"}
                          style={{ borderRadius: 12 }}
                        />
                      </View>
                    </View>

                    {/* Sleep */}
                    <View style={{ marginTop: 12, overflow: "hidden" }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: C.text }}>Sleep (hrs)</Text>
                        <Text style={{ fontSize: 13, color: C.subtle }}>Latest: <Text style={{ fontWeight: "800", color: C.indigo500 }}>7.6</Text></Text>
                      </View>
                      <View style={{ marginTop: 8 }}>
                        <LineChart
                          data={{
                            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                            datasets: [{ data: [6.5, 7, 6, 8, 7.5, 8.2, 7.6] }],
                          }}
                          width={lineWidth}
                          height={160}
                          chartConfig={chartConfig}
                          bezier
                          withDots={false}
                          withInnerLines
                          withOuterLines={false}
                          withShadow={false}
                          fromZero
                          segments={3}
                          style={{ borderRadius: 12 }}
                        />
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                      <View style={{ flex: 1, backgroundColor: scheme === "light" ? C.indigo50 : C.slate700, padding: 12, borderRadius: 10 }}>
                        <Text style={{ fontSize: 11, color: scheme === "light" ? C.indigo600 : C.indigo300 }}>Calm minutes</Text>
                        <Text style={{ fontSize: 18, fontWeight: "800", color: scheme === "light" ? "#1e3a8a" : "#c7d2fe" }}>64%</Text>
                      </View>
                      <View style={{ flex: 1, backgroundColor: scheme === "light" ? C.green50 : C.slate700, padding: 12, borderRadius: 10 }}>
                        <Text style={{ fontSize: 11, color: scheme === "light" ? "#059669" : "#86efac" }}>Journal entries</Text>
                        <Text style={{ fontSize: 18, fontWeight: "800", color: scheme === "light" ? "#065f46" : "#bbf7d0" }}>40%</Text>
                      </View>
                    </View>
                  </View>
                </FadeInUp>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Floating Buttons */}
      {!isMd ? (
        <View style={{ position: "absolute", left: 16, bottom: 16 }}>
          <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.indigo600, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, ...Elevate("0 10px 20px rgba(0,0,0,0.2)") }}>
            <MessageSquare size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Chat</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={{ position: "absolute", right: 16, bottom: 16 }}>
        <Pressable onPress={() => setCrisisOpen(true)} style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#dc2626", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, ...Elevate("0 10px 20px rgba(0,0,0,0.2)") }}>
          <Siren size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Crisis Support</Text>
        </Pressable>
      </View>

      {/* Mobile Sidebar Modal */}
      <Modal transparent visible={sidebarOpen} animationType="fade" onRequestClose={() => setSidebarOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setSidebarOpen(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
        </TouchableWithoutFeedback>
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 256, backgroundColor: C.card, borderRightWidth: 1, borderColor: C.border, padding: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: scheme === "light" ? C.indigo50 : C.slate700, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontWeight: "800", color: scheme === "light" ? C.indigo600 : C.indigo300 }}>CP</Text>
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: C.text }}>Calm Pulse</Text>
              <Text style={{ color: C.subtle2, fontSize: 12 }}>Welcome back, SkyWalker</Text>
            </View>
          </View>
          {["Home", "Chat", "Tools", "Insights", "Community"].map((label, i) => (
            <Pressable key={i} style={{ paddingVertical: 10 }}>
              <Text style={{ color: C.text, fontWeight: i === 0 ? "800" : "600" }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Crisis Modal */}
      <Modal transparent visible={crisisOpen} animationType="fade" onRequestClose={() => setCrisisOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <View style={{ width: "100%", maxWidth: 420, backgroundColor: C.card, borderRadius: 16, padding: 16, ...Elevate("0 20px 40px rgba(0,0,0,0.25)") }}>
            <View style={{ alignSelf: "center", width: 48, height: 48, borderRadius: 24, backgroundColor: scheme === "light" ? "#fee2e2" : "rgba(185,28,28,0.35)", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={22} color={scheme === "light" ? "#dc2626" : "#fca5a5"} />
            </View>
            <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "800", textAlign: "center", color: C.text }}>Urgent Help</Text>
            <Text style={{ marginTop: 6, fontSize: 13, textAlign: "center", color: C.subtle }}>
              If you are in distress, please reach out. You are not alone.
            </Text>
            <View style={{ marginTop: 16, gap: 8 }}>
              <Pressable onPress={() => Linking.openURL("tel:112")} style={{ padding: 12, borderRadius: 10, backgroundColor: scheme === "light" ? "#fef2f2" : "rgba(185,28,28,0.3)" }}>
                <Text style={{ textAlign: "center", fontWeight: "800", color: scheme === "light" ? "#b91c1c" : "#fecaca" }}>Call Emergency Services: 112</Text>
              </Pressable>
              <Pressable onPress={() => Linking.openURL("tel:18005990019")} style={{ padding: 12, borderRadius: 10, backgroundColor: scheme === "light" ? "#fef2f2" : "rgba(185,28,28,0.3)" }}>
                <Text style={{ textAlign: "center", fontWeight: "800", color: scheme === "light" ? "#b91c1c" : "#fecaca" }}>Call Kiran Helpline: 1800-599-0019</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setCrisisOpen(false)} style={{ marginTop: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: scheme === "light" ? "#f1f5f9" : C.slate700 }}>
              <Text style={{ textAlign: "center", fontWeight: "800", color: C.text }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
