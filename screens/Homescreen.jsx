import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  Modal,
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
  LogOut
} from "lucide-react-native";
import { LineChart, ProgressChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import logoutUser from "../components/functions/Logout";

// --- Theme ---
const COLORS = {
  light: {
    bg: "#f8fafc",
    text: "#1f2937",
    card: "#ffffff",
    border: "#e2e8f0",
    subtle: "#64748b",
    subtle2: "#94a3b8",
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
    bg: "#0f172a",
    text: "#e2e8f0",
    card: "#1e293b",
    border: "#334155",
    subtle: "#94a3b8",
    subtle2: "#94a3b8",
    indigo50: "#312e81",
    indigo600: "#818cf8",
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
    blue50: "rgba(30,64,175,0.2)",
    blue700: "#93c5fd",
  },
};

const useTheme = () => {
  const [scheme, setScheme] = useState("light");
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("cp_dash_theme");
      if (saved) setScheme(saved);
    })();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem("cp_dash_theme", scheme);
  }, [scheme]);
  return { scheme, setScheme, C: COLORS[scheme] };
};

// --- Helpers ---
const isWeb = Platform.OS === "web";

const Elevate = (webShadow = "0 10px 20px rgba(0,0,0,0.06)") =>
  Platform.select({
    web: { boxShadow: webShadow },
    default: {
      shadowColor: "#000",
      shadowOpacity: 0.07,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
  });

const FadeInUp = ({ delay = 0, children }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 500, delay, useNativeDriver: true }).start();
  }, [t, delay]);
  return (
    <Animated.View style={{ opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
      {children}
    </Animated.View>
  );
};

// --- Toast Hook ---
const useToast = (isDesktop) => {
  const position = isDesktop ? 'bottom' : 'top';
  const initialY = position === 'top' ? -100 : 100;
  const targetY = position === 'top' ? 40 : -40;

  const y = useRef(new Animated.Value(initialY)).current;
  const [msg, setMsg] = useState(null);

  const showToast = (message) => {
    setMsg(message);
    Animated.sequence([
      Animated.timing(y, { toValue: targetY, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(y, { toValue: initialY, duration: 300, useNativeDriver: true }),
    ]).start(() => setMsg(null));
  };

  const toastNode = msg ? (
    <Animated.View
      style={{
        position: 'absolute',
        [position]: 0,
        alignSelf: 'center',
        transform: [{ translateY: y }],
        backgroundColor: '#0f172a',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        zIndex: 99999,
        ...Elevate("0 6px 12px rgba(0,0,0,0.25)")
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{msg}</Text>
    </Animated.View>
  ) : null;

  return { showToast, toastNode };
};

export default function Homescreen() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= height;
  const isMd = isDesktop;

  const { scheme, setScheme, C } = useTheme();
  const navigation = useNavigation();
  const { showToast, toastNode } = useToast(isDesktop);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleTheme = () => setScheme((p) => (p === "light" ? "dark" : "light"));

  const [mood, setMood] = useState("😐");
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [Name, setName] = useState('');
  const habitProgress = 0.75;

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

  const lineWidth = isDesktop ? 350 : width - 48;
  const showPrototypeToast = () => showToast("This feature is not included in prototype");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userJSON = await AsyncStorage.getItem("user");
        if (userJSON !== null) {
          const user = JSON.parse(userJSON);
          setName(user.name || 'User');
          console.log("User found in storage:", user);
        } else {
          setName('User');
        }
      } catch (error) {
        console.error("Failed to load user from storage", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {toastNode}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Sidebar (md and up) */}
        {isMd ? (
          <View style={{ width: 256, backgroundColor: C.card, borderRightWidth: 1, borderColor: C.border, padding: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: scheme === "light" ? C.indigo50 : C.slate700, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontWeight: "800", color: scheme === "light" ? C.indigo600 : C.indigo300 }}>CP</Text>
              </View>
              <View>
                <Text style={{ fontWeight: "800", color: C.text }}>Calm Pulse</Text>
                <Text style={{ color: C.subtle2, fontSize: 12 }}>Welcome back, {Name}</Text>
              </View>
            </View>

            <View style={{ backgroundColor: scheme === "light" ? C.indigo50 : C.indigo50, padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: scheme === "light" ? C.indigo600 : C.indigo300 }}>{Name}</Text>
              <Text style={{ fontSize: 11, color: scheme === "light" ? C.indigo600 : C.indigo300, opacity: 0.8 }}>7-day streak • 3 badges</Text>
            </View>

            <View style={{ gap: 8 }}>
              {[
                { icon: Home, label: "Home", active: true, onPress: () => { } },
                { icon: MessageSquare, label: "Chat", onPress: () => navigation.navigate('ChatScreen') },
                { icon: Compass, label: "Tools", onPress: showPrototypeToast },
                { icon: BarChart3, label: "Insights", onPress: showPrototypeToast },
                { icon: Users, label: "Community", onPress: showPrototypeToast },
              ].map((item, i) => {
                const Icon = item.icon;
                const color = item.active ? (scheme === "light" ? C.indigo600 : C.indigo300) : C.subtle;
                return (
                  <Pressable key={i} onPress={item.onPress} style={{
                    flexDirection: "row", alignItems: "center", gap: 12,
                    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
                    backgroundColor: item.active ? C.indigo50 : "transparent",
                  }}>
                    <Icon size={18} color={color} />
                    <Text style={{ fontWeight: "600", color: item.active ? (scheme === "light" ? C.indigo600 : C.indigo300) : C.text }}>{item.label}</Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={{ marginTop: "auto", backgroundColor: scheme === "light" ? C.indigo50 : C.indigo50, padding: 16, borderRadius: 12 }}>
              <Text style={{ fontWeight: "800", fontSize: 12, color: scheme === "light" ? C.indigo600 : C.indigo300 }}>💡 Tip</Text>
              <Text style={{ color: scheme === "light" ? C.indigo600 : C.indigo300, fontSize: 12, marginTop: 4, opacity: 0.8 }}>Try 'Vent Mode' when you just want to be heard.</Text>
            </View>

            <View style={{ gap: 8, marginVertical: 7, marginTop: 5 }}>
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: "row", alignItems: "center", gap: 12,
                  paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
                  backgroundColor: scheme === "light" ? C.red50 : C.red50,
                  opacity: pressed ? 0.7 : 1.0,
                })}
                onPress={() => { logoutUser(navigation); }}
              >
                <LogOut size={18} color={C.red600} />
                <Text style={{ fontWeight: "600", color: C.red600 }}>Log out</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={{ flex: 1 }}>
          <View style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: isWeb ? (scheme === "light" ? "rgba(248,250,252,0.8)" : "rgba(15,23,42,0.8)") : C.bg, borderBottomWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: isMd ? 24 : 16 }}>
            {!isMd ? (
              <Pressable onPress={() => setSidebarOpen(true)} style={{ padding: 8, marginLeft: -8 }}>
                <Menu size={22} color={C.subtle} />
              </Pressable>
            ) : (
              <View />
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              {!isMd ? <Text style={{ fontSize: 20, fontWeight: "800", color: C.text }}>Dashboard</Text> : (
                <Pressable onPress={() => navigation.navigate('ChatScreen')} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 64, backgroundColor: scheme === "light" ? C.text : C.card, borderWidth: 1, borderColor: C.border }}>
                  <Text style={{ color: scheme === "light" ? C.bg : C.text, fontWeight: "600", fontSize: 13 }}>Start Chat</Text>
                </Pressable>
              )}
              <Pressable onPress={showPrototypeToast} style={{ padding: 8, borderRadius: 999 }}>
                <Bell size={18} color={C.subtle} />
              </Pressable>
              <Pressable onPress={toggleTheme} style={{ padding: 8, borderRadius: 999 }}>
                {scheme === "light" ? <Sun size={18} color={C.subtle} /> : <Moon size={18} color={C.subtle} />}
              </Pressable>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.indigo50, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.card }}>
                <Text style={{ fontWeight: "800", color: C.indigo600 }}>S</Text>
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: isMd ? 24 : 16, paddingBottom: !isDesktop && height / 2, gap: 24 }}>
            <View style={{ flexDirection: isDesktop ? "row" : 'column', justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
              <View style={{ flex: 2, width: '100%', gap: 24 }}>
                <FadeInUp delay={100}>
                  <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: 'wrap' }}>
                      <View style={{ flex: 1, minWidth: 250 }}>
                        <Text style={{ fontSize: 20, fontWeight: "800", color: C.text }}>Hi {Name}, how are you feeling today?</Text>
                        <Text style={{ color: C.subtle, marginTop: 4 }}>
                          Your calm streak is <Text style={{ fontWeight: "800", color: C.indigo500 }}>7 days</Text>. Keep it going ✨
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                        <View style={{ alignItems: "center" }}>
                          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.indigo50, alignItems: "center", justifyContent: "center", overflow: 'hidden' }}>
                            <ProgressChart
                              data={{ data: [habitProgress] }}
                              width={64}
                              height={64}
                              strokeWidth={8}
                              radius={28}
                              hideLegend
                              chartConfig={{
                                backgroundGradientFrom: C.indigo50,
                                backgroundGradientTo: C.indigo50,
                                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                              }}
                            />
                            <Text style={{ position: 'absolute', fontWeight: "800", color: C.indigo500 }}>{`${Math.round(habitProgress * 100)}%`}</Text>
                          </View>
                          <Text style={{ marginTop: 8, color: C.subtle, fontSize: 12 }}>Habit progress</Text>
                        </View>
                        <Pressable onPress={() => navigation.navigate('ChatScreen')} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: C.indigo600 }}>
                          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Check in now</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </FadeInUp>
                <FadeInUp delay={200}>
                  <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                    <Text style={{ fontWeight: "800", fontSize: 16, color: C.text }}>Quick Mood Check</Text>
                    <Text style={{ color: C.subtle, fontSize: 12 }}>Tap an emoji to log your mood.</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginVertical: 16 }}>
                      {["😡", "😕", "😐", "🙂", "😁"].map((e) => (
                        <Pressable key={e} onPress={() => setMood(e)} style={{ padding: 8, borderRadius: 999, transform: [{ scale: mood === e ? 1.25 : 1 }], borderWidth: mood === e ? 4 : 0, borderColor: mood === e ? C.indigo500 : "transparent" }}>
                          <Text style={{ fontSize: 32 }}>{e}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
                      <Pressable onPress={showPrototypeToast} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <PlusCircle size={16} color={C.indigo500} />
                        <Text style={{ color: C.indigo500, fontWeight: "600", fontSize: 13 }}>Add a note</Text>
                      </Pressable>
                      <Pressable onPress={showPrototypeToast} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Lightbulb size={16} color={C.indigo500} />
                        <Text style={{ color: C.indigo500, fontWeight: "600", fontSize: 13 }}>Suggested action</Text>
                      </Pressable>
                    </View>
                  </View>
                </FadeInUp>
                <FadeInUp delay={300}>
                  <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                    <Text style={{ fontWeight: "800", fontSize: 16, color: C.text, marginBottom: 12 }}>Quick Tools</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", margin: -6 }}>
                      {[
                        { bg: C.red50, color: C.red600, icon: Wind, title: "1-min Breathe", sub: "Box breathing" },
                        { bg: C.blue50, color: C.blue700, icon: ClipboardList, title: "Mood Check", sub: "Daily reflection" },
                        { bg: scheme === 'light' ? C.border : C.slate700, color: C.text, icon: MessageCircleOff, title: "Vent Mode", sub: "No advice" },
                        { bg: C.green50, color: C.green700, icon: BookOpen, title: "Journal", sub: "Write thoughts" },
                        { bg: C.purple50, color: C.purple700, icon: BrainCircuit, title: "Meditate", sub: "5-min calm" },
                        { bg: C.yellow50, color: C.yellow700, icon: Sparkles, title: "Affirm", sub: "Positive cue" },
                      ].map((t, i) => {
                        const Icon = t.icon;
                        return (
                          <Pressable key={i} onPress={showPrototypeToast} style={{ width: '50%', padding: 6 }}>
                            <View style={{ padding: 16, borderRadius: 12, backgroundColor: t.bg, flex: 1 }}>
                              <Icon size={24} color={t.color} />
                              <Text style={{ marginTop: 8, fontWeight: "700", color: t.color, fontSize: 13 }}>{t.title}</Text>
                              <Text style={{ color: t.color, opacity: 0.7, fontSize: 11 }}>{t.sub}</Text>
                            </View>
                          </Pressable>
                        )
                      })}
                    </View>
                  </View>
                </FadeInUp>
              </View>
              <View style={{ flex: 1.2, width: '100%', gap: 24 }}>
                <FadeInUp delay={200}>
                  <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                    <Text style={{ fontWeight: "800", fontSize: 16, color: C.text }}>Your week at a glance</Text>
                    <Text style={{ color: C.subtle, fontSize: 12 }}>Mood trend & sleep hours</Text>
                    <View style={{ marginTop: 16, }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: C.text }}>Mood (1-5)</Text>
                        <Text style={{ fontSize: 13, color: C.subtle }}>Latest: <Text style={{ fontWeight: "800", color: C.indigo500 }}>5</Text></Text>
                      </View>
                      <View style={{ marginTop: 8, overflow: "hidden" }}>
                        <LineChart data={{ labels: ["M", "T", "W", "T", "F", "S", "S"], datasets: [{ data: [3, 4, 3, 5, 4, 5, 5] }] }} width={lineWidth + 32} height={180} chartConfig={chartConfig} bezier withDots={false} withInnerLines={false} withOuterLines={false} fromZero segments={4} style={{ borderRadius: 12, overflow: "hidden", paddingVertical: 24 }} />
                      </View>
                    </View>
                    <View style={{ marginTop: 12, }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: C.text }}>Sleep (hrs)</Text>
                        <Text style={{ fontSize: 13, color: C.subtle }}>Latest: <Text style={{ fontWeight: "800", color: C.indigo500 }}>7.6</Text></Text>
                      </View>
                      <View style={{ marginTop: 8, overflow: "hidden", }}>
                        <LineChart data={{ labels: ["M", "T", "W", "T", "F", "S", "S"], datasets: [{ data: [6.5, 7, 6, 8, 7.5, 8.2, 7.6] }] }} width={lineWidth + 32} height={180} chartConfig={chartConfig} bezier withDots={false} withInnerLines={false} withOuterLines={false} fromZero segments={3} style={{ borderRadius: 12, overflow: 'hidden', paddingVertical: 24 }} />
                      </View>
                    </View>
                  </View>
                </FadeInUp>
                <FadeInUp delay={400}>
                  <View style={{ backgroundColor: C.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: C.border, ...Elevate() }}>
                    <Text style={{ fontWeight: "800", fontSize: 16, color: C.text, marginBottom: 12 }}>Goals & Achievements</Text>
                    {[{ label: "Sleep 7h avg", pct: 70 }, { label: "Breathe 5x/week", pct: 45 }, { label: "Log mood daily", pct: 80 }].map((g, i) => (
                      <View key={i} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                          <Text style={{ fontSize: 13, fontWeight: "600", color: C.subtle2 }}>{g.label}</Text>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: C.subtle }}>{g.pct}%</Text>
                        </View>
                        <View style={{ height: 8, borderRadius: 999, backgroundColor: C.indigo50 }}>
                          <View style={{ width: `${g.pct}%`, height: 8, borderRadius: 999, backgroundColor: C.indigo500 }} />
                        </View>
                      </View>
                    ))}
                    <Pressable onPress={showPrototypeToast} style={{ marginTop: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: C.indigo50 }}>
                      <Text style={{ textAlign: "center", fontWeight: "800", color: C.indigo600, fontSize: 13 }}>View badges</Text>
                    </Pressable>
                  </View>
                </FadeInUp>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={{ position: "absolute", right: 16, bottom: 16, flexDirection: 'row', gap: 16 }}>
        {!isMd && (
          <Pressable onPress={() => navigation.navigate('ChatScreen')} style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.indigo600, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, ...Elevate("0 10px 20px rgba(0,0,0,0.2)") }}>
            <MessageSquare size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Chat</Text>
          </Pressable>
        )}
        <Pressable onPress={() => setCrisisOpen(true)} style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.red600, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, ...Elevate("0 10px 20px rgba(0,0,0,0.2)") }}>
          <Siren size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Crisis Support</Text>
        </Pressable>
      </View>

      <Modal transparent visible={sidebarOpen} animationType="fade" onRequestClose={() => setSidebarOpen(false)}>
        <Pressable onPress={() => setSidebarOpen(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
          <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 256, backgroundColor: C.card, borderRightWidth: 1, borderColor: C.border, padding: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: C.indigo50, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontWeight: "800", color: C.indigo600 }}>CP</Text>
              </View>
              <View>
                <Text style={{ fontWeight: "800", color: C.text }}>Calm Pulse</Text>
                <Text style={{ color: C.subtle2, fontSize: 12 }}>Welcome back, {Name}</Text>
              </View>
            </View>
            {[{ label: "Home", onPress: () => setSidebarOpen(false) }, { label: "Chat", onPress: () => navigation.navigate('ChatScreen') }, { label: "Tools", onPress: showPrototypeToast }, { label: "Insights", onPress: showPrototypeToast }, { label: "Community", onPress: showPrototypeToast }].map((item, i) => (
              <Pressable key={i} onPress={item.onPress} style={{ paddingVertical: 12 }}>
                <Text style={{ color: C.text, fontWeight: i === 0 ? "800" : "600", fontSize: 16 }}>{item.label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => logoutUser(navigation)} style={{ marginTop: 'auto', paddingVertical: 12 }}>
              <Text style={{ color: C.red600, fontWeight: "600", fontSize: 16 }}>Log Out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={crisisOpen} animationType="fade" onRequestClose={() => setCrisisOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <View style={{ width: "100%", maxWidth: 420, backgroundColor: C.card, borderRadius: 16, padding: 24, ...Elevate("0 20px 40px rgba(0,0,0,0.25)") }}>
            <View style={{ alignSelf: "center", width: 48, height: 48, borderRadius: 24, backgroundColor: C.red50, alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={22} color={C.red600} />
            </View>
            <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "800", textAlign: "center", color: C.text }}>Urgent Help</Text>
            <Text style={{ marginTop: 6, fontSize: 13, textAlign: "center", color: C.subtle, lineHeight: 20 }}>
              If you are in distress, please reach out. You are not alone.
            </Text>
            <View style={{ marginTop: 24, gap: 12 }}>
              <Pressable onPress={() => Linking.openURL("tel:112")} style={{ padding: 12, borderRadius: 10, backgroundColor: C.red50 }}>
                <Text style={{ textAlign: "center", fontWeight: "800", color: C.red600 }}>Call Emergency Services: 112</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setCrisisOpen(false)} style={{ marginTop: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: C.border }}>
              <Text style={{ textAlign: "center", fontWeight: "800", color: C.text }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}