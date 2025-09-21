import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  TextInput,
  FlatList,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Menu,
  X,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Heart,
  MoreHorizontal,
  Wind,
  BookOpen,
  Sparkles,
  CloudLightning,
  ArrowUp,
  XCircle,
  AlertTriangle,
  LogOut,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import logoutUser from "../components/functions/Logout";
import { API_KEY, API_URL, createSystemInstruction } from "../components/functions/Chat_backend";

/** =========================
 * THEME
 * ========================== */
const PALETTE = {
  light: {
    bg: "#f8fafc", // gray-50
    text: "#1f2937", // gray-800
    card: "rgba(255,255,255,0.6)",
    cardBorder: "rgba(255,255,255,0.5)",
    border: "rgba(229,231,235,0.4)", // gray-200/40
    header: "rgba(255,255,255,0.3)",
    bubbleBot: "#ffffff",
    bubbleUser: "#3b82f6",
    bubbleBotText: "#374151",
    bubbleUserText: "#ffffff",
    popover: "#ffffff",
    popoverBorder: "#e5e7eb",
    overlay: "rgba(0,0,0,0.5)",
    slate700: "#334155",
    slate800: "#1f2937",
    blue400: "#60a5fa",
    blue500: "#3b82f6",
    indigo600: "#4f46e5",
  },
  dark: {
    bg: "#0f172a", // slate-900
    text: "#e2e8f0", // slate-200
    card: "rgba(15,23,42,0.6)",
    cardBorder: "rgba(30,41,59,0.5)",
    border: "rgba(51,65,85,0.3)", // slate-700/30
    header: "rgba(15,23,42,0.3)",
    bubbleBot: "#0f172a",
    bubbleUser: "#3b82f6",
    bubbleBotText: "#e2e8f0",
    bubbleUserText: "#ffffff",
    popover: "#0b1220",
    popoverBorder: "#334155",
    overlay: "rgba(0,0,0,0.6)",
    slate700: "#334155",
    slate800: "#1f2937",
    blue400: "#60a5fa",
    blue500: "#3b82f6",
    indigo600: "#4f46e5",
  },
};

const GRADIENTS = {
  light: ["#f0f9ff", "#eef2ff", "#dbeafe", "#e0f2fe"],
  dark: ["#0f172a", "#1e293b", "#334155", "#1e293b"],
};

/** =========================
 * I18N
 * ========================== */
const TRANSLATIONS = {
  EN: {
    mainTitle: "Calm Pulse",
    welcomeMessage: "How can I help you today?",
    chatPlaceholder: "Message Calm Pulse...",
    settingsTitle: "Settings",
    logoutButton: "Log Out",
    confirmLogoutTitle: "Confirm Log Out",
    confirmLogoutMessage:
      "Are you sure you want to log out? Your session will be terminated.",
    cancelButton: "Cancel",
  },
  ES: {
    mainTitle: "Pulso Calmo",
    welcomeMessage: "¿Cómo puedo ayudarte hoy?",
    chatPlaceholder: "Mensaje a Pulso Calmo...",
    settingsTitle: "Ajustes",
    logoutButton: "Cerrar sesión",
    confirmLogoutTitle: "Confirmar cierre de sesión",
    confirmLogoutMessage:
      "¿Estás seguro de que quieres cerrar la sesión? Tu sesión terminará.",
    cancelButton: "Cancelar",
  },
  FR: {
    mainTitle: "Pouls Calme",
    welcomeMessage: "Comment puis-je vous aider aujourd'hui ?",
    chatPlaceholder: "Message à Pouls Calme...",
    settingsTitle: "Paramètres",
    logoutButton: "Se déconnecter",
    confirmLogoutTitle: "Confirmer la déconnexion",
    confirmLogoutMessage:
      "Êtes-vous sûr de vouloir vous déconnecter ? Votre session sera terminée.",
    cancelButton: "Annuler",
  },
  DE: {
    mainTitle: "Ruhiger Puls",
    welcomeMessage: "Wie kann ich Ihnen heute helfen?",
    chatPlaceholder: "Nachricht an Ruhiger Puls...",
    settingsTitle: "Einstellungen",
    logoutButton: "Abmelden",
    confirmLogoutTitle: "Abmeldung bestätigen",
    confirmLogoutMessage:
      "Möchten Sie sich wirklich abmelden? Ihre Sitzung wird beendet.",
    cancelButton: "Abbrechen",
  },
};


async function callModel(history, prompt, user) {
  const formatted = {
    contents: [
      ...history.map((m) => ({
        role: m.role === "assistant" ? "model" : m.role,
        parts: m.parts,
      })),
      { role: "user", parts: [{ text: prompt }] },
    ],
    systemInstruction: createSystemInstruction(user),
  };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formatted),
  });
  if (!res.ok) throw new Error(`API status ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response text found.");
  return String(text);
}

/** =========================
 * UTIL
 * ========================== */
const useOrientation = () => {
  const { width, height } = useWindowDimensions();
  return width > height ? "desktop" : "mobile";
};

function useAnimatedGradient() {
  const start = useRef(new Animated.Value(0)).current;
  const end = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(start, { toValue: 1, duration: 7500, useNativeDriver: false }),
          Animated.timing(start, { toValue: 0, duration: 7500, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.timing(end, { toValue: 1, duration: 9000, useNativeDriver: false }),
          Animated.timing(end, { toValue: 0, duration: 9000, useNativeDriver: false }),
        ]),
      ]).start(() => loop());
    };
    loop();
  }, [start, end]);

  const sX = start.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const sY = start.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const eX = end.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const eY = end.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return { sX, sY, eX, eY };
}

/** =========================
 * MAIN APP
 * ========================== */
export default function ChatScreen() {
  const orientation = useOrientation();
  const [scheme, setScheme] = useState("light");
  const [lang, setLang] = useState("EN");
  const T = TRANSLATIONS[lang];
  const P = PALETTE[scheme];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [enterIsSend, setEnterIsSend] = useState(false);

  const [input, setInput] = useState("");
  const [user, setUser] = useState();
  const [inputHeight, setInputHeight] = useState(44);
  const [history, setHistory] = useState([]);
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const s = await AsyncStorage.getItem("cp_theme");
      const l = await AsyncStorage.getItem("cp_lang");
      const c = await AsyncStorage.getItem("e_is_s");
      const u = JSON.parse(await AsyncStorage.getItem("user"));
      if (s) setScheme(s);
      if (l) setLang(l);
      if (c) setEnterIsSend(c);
      if (u) setUser(u);
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("cp_theme", scheme);
  }, [scheme]);

  useEffect(() => {
    AsyncStorage.setItem("cp_lang", lang);
  }, [lang]);

  useEffect(() => {
    AsyncStorage.setItem("e_is_s", String(enterIsSend));
  }, [enterIsSend]);

  const { sX, sY, eX, eY } = useAnimatedGradient();

  const gradients = useMemo(() => GRADIENTS[scheme], [scheme]);

  const toggleTheme = () => setScheme((p) => (p === "light" ? "dark" : "light"));

  const isDesktop = orientation === "desktop";

  const promptCards = [
    { key: "destress", icon: <Wind size={24} color={P.blue500} />, title: "Help me de-stress", sub: "Guide me through a breathing exercise." },
    { key: "reflect", icon: <BookOpen size={24} color={P.blue500} />, title: "Reflect on my day", sub: "Ask me questions to help me journal." },
    { key: "gratitude", icon: <Sparkles size={24} color={P.blue500} />, title: "Practice gratitude", sub: "Help me list things I'm thankful for." },
    { key: "vent", icon: <CloudLightning size={24} color={P.blue500} />, title: "I need to vent", sub: "Provide a safe space to share thoughts." },
  ];

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(scrollToBottom, [history, typing]);

  const appendMessage = (msg) => {
    setHistory((h) => [...h, msg]);
  };

  const handleSend = async (prompt) => {
    if (!prompt.trim()) return;
    appendMessage({ role: "user", parts: [{ text: prompt }], type: "chat" });
    setInput("");
    setTyping(true);
    try {
      const res = await callModel(history, prompt, user);
      const isSummary = /summarize this conversation/i.test(prompt) || /one-paragraph summary/i.test(prompt);
      appendMessage({
        role: "assistant",
        parts: [{ text: res.trim() }],
        type: isSummary ? "summary" : "chat",
      });
    } catch (e) {
      appendMessage({
        role: "assistant",
        parts: [{ text: "Sorry, I'm having trouble connecting. Please try again." }],
      });
    } finally {
      setTyping(false);
    }
  };

  const handleAiAction = async (action) => {
    const userMsgs = history.filter((m) => m.role === "user");
    if (userMsgs.length < 1) {
      appendMessage({
        role: "assistant",
        parts: [
          {
            text:
              action === "summarize"
                ? "There's not enough conversation to summarize yet. Let's chat a bit more!"
                : "Let's talk a little first so I can suggest something relevant for you.",
          },
        ],
      });
      return;
    }
    const prompt =
      action === "summarize"
        ? "Based on our conversation so far, please provide a gentle, one-paragraph summary of my day or feelings."
        : "Based on our recent conversation, suggest one simple, calming activity I could do right now.";
    await handleSend(prompt);
  };

  /** Typing dots animation */
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const mk = (v, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: -4, duration: 200, useNativeDriver: true, delay }),
          Animated.timing(v, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      ).start();
    mk(dot1, 0);
    mk(dot2, 200);
    mk(dot3, 400);
  }, [dot1, dot2, dot3]);

  const renderMessage = (m, idx) => {
    const isUser = m.role === "user";
    const bubbleStyle = {
      backgroundColor: isUser ? P.bubbleUser : P.bubbleBot,
      borderRadius: 16,
      padding: 12,
      maxWidth: "85%",
      borderLeftWidth: m.type === "summary" && !isUser ? 4 : 0,
      borderLeftColor: m.type === "summary" ? P.blue400 : "transparent",
    };

    return (
      <View
        key={idx}
        style={{
          flexDirection: "row",
          justifyContent: isUser ? "flex-end" : "flex-start",
          alignItems: "flex-end",
          gap: 8,
          marginVertical: 8,
        }}
      >
        {!isUser && (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: scheme === "light" ? "#dbeafe" : "#0b1220",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontWeight: "800", color: P.blue500, fontSize: 18 }}>CP</Text>
          </View>
        )}
        <View style={bubbleStyle}>
          {m.type === "summary" && !isUser ? (
            <View>
              <Text style={{ fontWeight: "700", fontSize: 12, marginBottom: 4, color: isUser ? P.bubbleUserText : P.bubbleBotText }}>
                Conversation Summary
              </Text>
              <Text style={{ color: isUser ? P.bubbleUserText : P.bubbleBotText, fontSize: 16 }}>{m.parts[0].text}</Text>
            </View>
          ) : (
            <Text style={{ color: isUser ? P.bubbleUserText : P.bubbleBotText, fontSize: 16 }}>{m.parts[0].text}</Text>
          )}
        </View>
      </View>
    );
  };

  const header = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderBottomWidth: 1,
        borderColor: P.border,
        backgroundColor: P.header,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {!isDesktop && (
          <Pressable onPress={() => setSidebarOpen(true)} hitSlop={8}>
            <Menu size={24} color={P.text} />
          </Pressable>
        )}
        <Text style={{ fontSize: 18, fontWeight: "700", color: P.text }}>{T.mainTitle}</Text>
      </View>
      <Pressable style={{ borderRadius: 32, paddingHorizontal: 18, paddingVertical: 8, backgroundColor: "rgba(221, 31, 31, 0.67)" }} onPress={() => navigation.goBack()} hitSlop={8}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: P.text }}>End Chat</Text>
      </Pressable>
    </View>
  );

  const SidebarRail = (
    <View
      style={{
        width: 80,
        backgroundColor: scheme === "light" ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.6)",
        borderRightWidth: 1,
        borderColor: scheme === "light" ? "rgba(255,255,255,0.5)" : "rgba(30,41,59,0.5)",
        alignItems: "center",
        paddingVertical: 16,
        gap: 16,
      }}
    >
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: scheme === "light" ? "#dbeafe" : "#0b1220",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "800", color: scheme === "light" ? "#2563eb" : "#60a5fa", fontSize: 16 }}>CP</Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <Pressable
        onPress={toggleTheme}
        style={({ pressed }) => ({
          padding: 10,
          borderRadius: 10,
          backgroundColor: pressed ? (scheme === "light" ? "#f1f5f9" : "#0b1220") : "transparent",
        })}
      >
        {scheme === "light" ? <Sun size={24} color={P.text} /> : <Moon size={24} color={P.text} />}
      </Pressable>

      <Pressable
        onPress={() => setSettingsOpen(true)}
        style={({ pressed }) => ({
          padding: 10,
          borderRadius: 10,
          backgroundColor: pressed ? (scheme === "light" ? "#f1f5f9" : "#0b1220") : "transparent",
        })}
      >
        <SettingsIcon size={24} color={P.text} />
      </Pressable>

      <View style={{ marginTop: 8 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: scheme === "light" ? "#bfdbfe" : "#1f2937",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: scheme === "light" ? "#ffffff" : "#475569",
          }}
        >
          <Text style={{ fontWeight: "800", color: scheme === "light" ? "#1d4ed8" : "#60a5fa" }}>U</Text>
        </View>
      </View>
    </View>
  );

  const MobileSidebar = (
    <Modal transparent visible={sidebarOpen} animationType="fade" onRequestClose={() => setSidebarOpen(false)}>
      <TouchableWithoutFeedback onPress={() => setSidebarOpen(false)}>
        <View style={{ flex: 1, backgroundColor: P.overlay }} />
      </TouchableWithoutFeedback>
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 80,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <View style={{ position: "absolute", top: 10, right: -44 }}>
          <Pressable onPress={() => setSidebarOpen(false)} style={{ padding: 8 }}>
            <X size={22} color="#fff" />
          </Pressable>
        </View>
        {SidebarRail}
      </View>
    </Modal>
  );

  const Welcome = (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}>
      <View
        style={{
          padding: 12,
          borderRadius: 999,
          backgroundColor: scheme === "light" ? "rgba(255,255,255,0.7)" : "rgba(30,41,59,0.7)",
          marginBottom: 12,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: scheme === "light" ? "#dbeafe" : "#0b1220",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "800", color: scheme === "light" ? "#2563eb" : "#60a5fa", fontSize: 22 }}>CP</Text>
        </View>
      </View>
      <Text style={{ fontSize: 24, fontWeight: "800", color: P.text, marginBottom: 8 }}>{T.welcomeMessage}</Text>

      <View
        style={{
          marginTop: 16,
          width: "100%",
          maxWidth: 900,
        }}
      >
        {/* 1-col mobile, 2-col desktop */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          {promptCards.map((c, i) => (
            <Pressable
              key={c.key}
              onPress={() => handleSend(c.title)}
              style={({ pressed }) => ({
                width: isDesktop ? "47%" : "100%",
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: scheme === "light" ? P.cardBorder : P.cardBorder,
                backgroundColor: P.card,
                transform: [{ translateY: pressed ? -3 : 0 }, { scale: pressed ? 0.99 : 1 }],
              })}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {c.icon}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: P.text }}>{c.title}</Text>
                  <Text style={{ color: scheme === "light" ? "#6b7280" : "#94a3b8", marginTop: 2 }}>{c.sub}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const ChatInputBar = (
    <View style={{ padding: 12, backgroundColor: P.header }}>
      <View style={{ width: "100%", maxWidth: 900, alignSelf: "center", position: "relative" }}>
        {/* Left AI tools button */}
        <View style={{ position: "absolute", left: 8, top: 8 }}>
          <Pressable
            onPress={() => setAiMenuOpen((v) => !v)}
            style={({ pressed }) => ({
              padding: 8,
              borderRadius: 999,
              backgroundColor: pressed ? (scheme === "light" ? "#f1f5f9" : "#0b1220") : "transparent",
            })}
          >
            <Sparkles size={18} color={scheme === "light" ? "#64748b" : "#94a3b8"} />
          </Pressable>

          {/* Popover */}
          {aiMenuOpen && (
            <TouchableWithoutFeedback onPress={() => setAiMenuOpen(false)}>
              <View
                style={{
                  position: "absolute",
                  bottom: 42,
                  width: 260,
                  backgroundColor: P.popover,
                  borderWidth: 1,
                  borderColor: P.popoverBorder,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                }}
              >
                <Pressable
                  onPress={() => {
                    setAiMenuOpen(false);
                    handleAiAction("summarize");
                  }}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: pressed ? (scheme === "light" ? "#f8fafc" : "#111827") : "transparent",
                  })}
                >
                  <Text style={{ fontWeight: "700", fontSize: 13, color: P.text }}>Summarize My Day</Text>
                  <Text style={{ fontSize: 12, color: scheme === "light" ? "#6b7280" : "#94a3b8" }}>
                    Get a summary of our conversation.
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setAiMenuOpen(false);
                    handleAiAction("suggest");
                  }}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: pressed ? (scheme === "light" ? "#f8fafc" : "#111827") : "transparent",
                  })}
                >
                  <Text style={{ fontWeight: "700", fontSize: 13, color: P.text }}>Suggest a Calming Activity</Text>
                  <Text style={{ fontSize: 12, color: scheme === "light" ? "#6b7280" : "#94a3b8" }}>
                    Get a mindful activity suggestion.
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>

        {/* Input */}
        <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })}>
          <View
            style={{
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: P.border,
              backgroundColor: scheme === "light" ? "#ffffff" : "#0f172a",
              borderRadius: 20,
              flexDirection: "row",
              alignItems: 'center',
              justifyContent: "space-between"
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={T.chatPlaceholder}
              placeholderTextColor={scheme === "light" ? "#94a3b8" : "#64748b"}
              multiline
              onKeyPress={(e) => {
                if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                  if (enterIsSend && input.trim()) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }
              }}
              style={{
                minHeight: 44,
                maxHeight: 120,
                paddingVertical: 10,
                fontSize: 16,
                color: P.text,
                textAlignVertical: "center",
                paddingHorizontal: 5,
                width: "100%",
                outlineStyle: "none",
              }}
              underlineColorAndroid={"transparent"}
              onContentSizeChange={(e) => {
                const h = Math.min(Math.max(44, e.nativeEvent.contentSize.height), 120);
                setInputHeight(h);
              }}
            />
            {input.trim() && (
              <Pressable
                onPress={() => handleSend(input)}
                disabled={!input.trim()}
                style={({ pressed }) => ({
                  padding: 8,
                  borderRadius: 999,
                  opacity: input.trim() ? 1 : 0.6,
                  backgroundColor: input.trim() ? "#3b83f691" : "rgba(156, 163, 175, 0.48)",
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  marginLeft: 8,
                })}
              >
                <ArrowUp size={18} color="#fff" />
              </Pressable>
            )}
          </View>
        </KeyboardAvoidingView>
        <View style={{ alignItems: "center", marginTop: 6 }}>
          <Text style={{ fontSize: 10, color: scheme === "light" ? "#6b7280" : "#94a3b8", marginTop: 4 }}>
            AI-generated content is for informational purposes only and is not a substitute for professional medical help.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Sidebar (desktop) */}
        {isDesktop && SidebarRail}

        <View style={{ flex: 1 }}>
          {header}

          {/* Chat container */}
          <View style={{ flex: 1 }}>
            <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16 }}>
              {history.length === 0 ? (
                Welcome
              ) : (
                <View>
                  {history.map((m, i) => renderMessage(m, i))}

                  {/* Typing Indicator */}
                  {typing && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: scheme === "light" ? "#dbeafe" : "#0b1220",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontWeight: "800", color: P.blue500, fontSize: 18 }}>CP</Text>
                      </View>
                      <View
                        style={{
                          padding: 12,
                          borderRadius: 16,
                          backgroundColor: scheme === "light" ? "#ffffff" : "#0f172a",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Animated.View
                          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#93c5fd", transform: [{ translateY: dot1 }] }}
                        />
                        <Animated.View
                          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#93c5fd", transform: [{ translateY: dot2 }] }}
                        />
                        <Animated.View
                          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#93c5fd", transform: [{ translateY: dot3 }] }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>

          {ChatInputBar}
        </View>
      </View>

      {/* Mobile Sidebar */}
      {!isDesktop && MobileSidebar}

      {/* Settings Modal */}
      <Modal transparent visible={settingsOpen} animationType="slide" onRequestClose={() => setSettingsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: P.overlay, justifyContent: "flex-end" }}>
          <TouchableWithoutFeedback onPress={() => setSettingsOpen(false)}>
            <View style={{ position: "absolute", inset: 0 }} />
          </TouchableWithoutFeedback>

          <View
            style={{
              backgroundColor: scheme === "light" ? "#f8fafc" : "#0f172a",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderTopWidth: 1,
              borderColor: P.border,
            }}
          >
            <View
              style={{
                padding: 14,
                borderBottomWidth: 1,
                borderColor: P.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: P.text }}>{T.settingsTitle}</Text>
              <Pressable onPress={() => setSettingsOpen(false)} style={{ padding: 6 }}>
                <X size={20} color={P.text} />
              </Pressable>
            </View>

            <View style={{ padding: 16, gap: 16 }}>
              {/* Clear on close */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "600", color: P.text }}>Enter is send</Text>
                <Pressable
                  onPress={() => setEnterIsSend((v) => !v)}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 999,
                    backgroundColor: enterIsSend ? P.indigo600 : (scheme === "light" ? "#e5e7eb" : "#334155"),
                    padding: 2,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#fff",
                      transform: [{ translateX: enterIsSend ? 20 : 0 }],
                    }}
                  />
                </Pressable>
              </View>

              {/* Language */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "600", color: P.text }}>Language</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: scheme === "light" ? "#e5e7eb" : "#334155",
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    minWidth: 110,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  {/* Simple “select”: cycle on tap */}
                  <Pressable
                    onPress={() => {
                      const order = ["EN", "ES", "FR", "DE"];
                      const idx = order.indexOf(lang);
                      setLang(order[(idx + 1) % order.length]);
                    }}
                    style={{ flex: 1 }}
                  >
                    <Text style={{ color: P.text, textAlign: "right" }}>{lang}</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View
              style={{
                padding: 16,
                borderTopWidth: 1,
                borderColor: P.border,
                backgroundColor: scheme === "light" ? "#f1f5f9" : "rgba(2,6,23,0.5)",
              }}
            >
              <Pressable
                onPress={() => {
                  setSettingsOpen(false);
                  setConfirmOpen(true);
                }}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: pressed ? "#4f46e5" : undefined,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderWidth: 0,
                })}
              >
                <View
                  style={{
                    backgroundColor: "#4f46e5",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <LogOut size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700" }}>{T.logoutButton}</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={{ flex: 1, backgroundColor: P.overlay, alignItems: "center", justifyContent: "center", padding: 16 }}>
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: scheme === "light" ? "#ffffff" : "#0f172a",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 16,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: scheme === "light" ? "#fee2e2" : "rgba(185,28,28,0.35)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={22} color={scheme === "light" ? "#dc2626" : "#fca5a5"} />
            </View>
            <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "700", textAlign: "center", color: P.text }}>
              {T.confirmLogoutTitle}
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontSize: 13,
                textAlign: "center",
                color: scheme === "light" ? "#6b7280" : "#94a3b8",
              }}
            >
              {T.confirmLogoutMessage}
            </Text>

            <View style={{ marginTop: 16, flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setConfirmOpen(false)}
                style={{
                  flex: 1,
                  backgroundColor: scheme === "light" ? "#f3f4f6" : "#334155",
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: P.text, fontWeight: "700" }}>{T.cancelButton}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  logoutUser(navigation)
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#dc2626",
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>{T.logoutButton}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}