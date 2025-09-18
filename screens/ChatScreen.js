import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  Appearance,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import rid from '../components/functions/RandomIDGenerator';
import { height } from '../components/constants';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function Chatscreen() {

  const onLayoutAnchor = (id, y) => (anchors.current[id] = y);
  const inputRef = useRef(null);
  const anchors = useRef({});
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const scrollRef = useRef(null);


  const [ventMode, setVentMode] = useState(false);
  const [theme] = useState(Appearance.getColorScheme() || 'light');
  const [isTypingBot, setIsTypingBot] = useState(false);
  const isDark = theme === 'dark';
  const palette = isDark ? D : L;

  const [messages, setMessages] = useState([
    {
      id: rid(),
      who: 'bot',
      text: 'Welcome back! Want a 1‑minute breathing exercise or to log your mood?',
      ts: Date.now() - 10000,
    },
  ]);

  function APressable({ children, style, onPress }) {
    const scale = useRef(new Animated.Value(1)).current;
    return (
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        onPress={onPress}
        style={({ pressed }) => [style, { opacity: pressed ? 0.95 : 1, transform: [{ scale }] }]}>
        {children}
      </Pressable>
    );
  }

  function Bubble({ who, children, palette }) {
    const isMe = who === 'me';
    return (
      <View style={[S.row, { justifyContent: isMe ? 'flex-end' : 'flex-start', paddingHorizontal: 16 }]}>
        <View style={[S.bubble, isMe ? { backgroundColor: palette.primary } : { backgroundColor: palette.ghost, borderColor: palette.border }, !isMe && { borderWidth: StyleSheet.hairlineWidth }]}>
          <Text style={[S.body, { color: isMe ? '#fff' : palette.text }]}>{children}</Text>
        </View>
      </View>
    );
  }

  function GhostButton({ children, onPress, palette }) {
    return (
      <APressable onPress={onPress} style={[S.outlineBtn, { borderColor: palette.border, backgroundColor: palette.ghost }]}>
        <Text style={{ color: palette.text }}>{children}</Text>
      </APressable>
    );
  }


  function sendBot(text) {
    const msg = { id: rid(), who: 'bot', text, ts: Date.now() };
    setMessages(m => [...m, msg]);
  }

  function smartReply(text) {
    if (ventMode) {
      return sendBot("I'm here. Tell me everything on your mind. I’m listening without judgment.");
    }
    const t = text.toLowerCase();
    if (t.includes('panic') || t.includes('anxious') || t.includes('anxiety')) {
      sendBot('Let’s do a 1‑minute box breathing to steady things. Opening the breathe tool now…');
      setBreatheOpen(true);
      return;
    }
    if (t.includes('plan') || t.includes('schedule') || t.includes('study')) {
      return sendBot('Here’s a gentle plan: 1) 1‑min breathe, 2) 25‑min focus block, 3) 5‑min walk. Want me to add these to Today’s Plan?');
    }
    if (t.includes('help') || t.includes('crisis')) {
      return sendBot('If you’re in immediate danger, call your local emergency number (India: 112). I can also connect you to Kiran 1800‑599‑0019.');
    }
    if (t.includes('journal') || t.includes('write')) {
      setJournalOpen(true);
      return sendBot('Opened your journal with a fresh prompt. Take your time.');
    }
    return sendBot('Got it. Would you prefer suggestions, or just Vent Mode for a bit?');
  }

  function TypingHint({ palette }) {
    const fade = useRef(new Animated.Value(0.4)).current;
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: false }),
          Animated.timing(fade, { toValue: 0.4, duration: 700, useNativeDriver: false }),
        ])
      ).start();
    }, []);
    return (
      <View style={[S.row, { alignItems: 'center', gap: 8, paddingLeft: 6 }]}>
        <Animated.Text style={[S.meta, { color: palette.muted, opacity: fade }]}>Calm Pulse is typing</Animated.Text>
        <View style={[S.row, { gap: 4 }]}>
          {[0, 1, 2].map(i => (
            <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.muted, transform: [{ translateY: new Animated.Value(0) }] }} />
          ))}
        </View>
      </View>
    );
  }
  function GradientCard({ children, palette, onLayout }) {
    return (
      <View onLayout={onLayout} style={[S.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        {children}
      </View>
    );
  }

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  function sendUser(text) {
    setIsTypingBot(true);
    setTimeout(() => {
      if (!text.trim()) return;
      const msg = { id: rid(), who: 'me', text: text.trim(), ts: Date.now() };
      setMessages(m => [...m, msg]);
      smartReply(text.trim());
      setIsTypingBot(false)
    }, 1500);
  }

  const handleSend = () => {
    if (!text.trim()) return;
    const newMessage = { id: Math.random().toString(), who: 'me', text: text.trim() };
    setMessages(prev => [...prev, newMessage]);
    setText('');

    // Simulate a bot reply
    setTimeout(() => {
      const botReply = { id: Math.random().toString(), who: 'bot', text: 'Thank you for sharing. I am here to listen.' };
      setMessages(prev => [...prev, botReply]);
    }, 1000);
  };

  function ChatCard({ messages, onSend, onLayout, palette }) {
    const [text, setText] = useState('');
    const boxRef = useRef(null);
    useEffect(() => {
      setTimeout(() => boxRef.current?.scrollToEnd({ animated: true }), 50);
    }, [messages]);
    function submit() { onSend(text); setText(''); }
    return (
      <GradientCard palette={palette} onLayout={onLayout}>
        <ScrollView ref={boxRef} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
          {messages.map(m => (<Bubble key={m.id} who={m.who} palette={palette}>{m.text}</Bubble>))}
        </ScrollView>
        {
          isTypingBot &&
          <TypingHint palette={palette} />
        }
        <View style={[S.row, { gap: 8, marginTop: 12 }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={submit}
            placeholder="Type a message…"
            placeholderTextColor={palette.muted}
            style={[S.input, { borderColor: palette.border, backgroundColor: palette.glass, color: palette.text }]} />
          {/* <APressable onPress={submit} style={[S.sendBtn]}>
            <Text style={S.primaryBtnText}>Send</Text>
          </APressable> */}
          {text.trim().length > 0 && <GhostButton onPress={submit} palette={palette}>Send</GhostButton>}
        </View>
        <View style={[S.row, { gap: 8, marginTop: 8 }]}>
          {['✨ 1‑min Breathe', '📋 Plan my day'].map(txt => (
            <GhostButton key={txt} palette={palette}>{txt}</GhostButton>
          ))}
        </View>
      </GradientCard>
    );
  }

  return (
    <View style={[S.flex, { backgroundColor: palette.appBg }]}>
      <View style={[S.headerWrap, { borderBottomColor: palette.border, backgroundColor: palette.glass }]}>
        <View style={[S.rowBetween, { paddingHorizontal: 16 }]}>
          <View
            style={[S.row, { paddingHorizontal: 8, gap: 8 }]}
          >
            <Image style={S.logoBlob} source={require("../assets/logo.png")} />
            <Text style={[S.smallBold, { color: palette.text }]}>Calm Pulse</Text>
          </View>

          <View style={[S.rowBetween, { justifyContent: "space-evenly", gap: 16 }]}>
            <GhostButton palette={palette}>🎙️ Voice Mode</GhostButton>
            <APressable style={[S.primaryBtn, { backgroundColor: '#f43f5e', paddingVertical: 8 }]}>
              <Text style={S.primaryBtnText}>End Chat</Text>
            </APressable>
          </View>
        </View>
      </View>
      <ChatCard
        palette={palette}
        onLayout={e => onLayoutAnchor('chat', e.nativeEvent.layout.y)}
        messages={messages}
        onSend={sendUser}
      />
    </View>
  );
}

const L = {
  appBg: '#f8fafc', text: '#0f172a', muted: '#64748b', border: 'rgba(2,6,23,0.12)', card: 'rgba(255,255,255,0.9)', ghost: 'rgba(248,250,252,0.9)', glass: 'rgba(255,255,255,0.7)', primary: '#6366f1',
};
const D = {
  appBg: '#0b1220', text: '#e5edff', muted: '#93a4c8', border: 'rgba(255,255,255,0.12)', card: 'rgba(10,14,30,0.9)', ghost: 'rgba(15,23,42,0.7)', glass: 'rgba(2,6,23,0.6)', primary: '#7dd3fc',
};

const S = StyleSheet.create({
  flex: { flex: 1, height: height },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerWrap: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
  },
  logoBlob: { width: 40, height: 40, borderRadius: 64 },
  inputArea: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  },
  body: { fontSize: 15, lineHeight: 22 },
  smallBold: { fontSize: 16, fontWeight: '700' },
  primaryBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  sendBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderColor: "#FFF",
    borderWidth: 2
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  outlineBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  h6: { fontSize: 16, fontWeight: '700' },

  card: { flex: 1, borderRadius: 24, padding: 12, shadowOpacity: 0.08, shadowRadius: 8 },

  primaryBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  primaryBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  input: { height: 75, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 8, flex: 1 },

  fabs: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', justifyContent: 'space-between' },
  fab: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  fabText: { color: '#fff', fontWeight: '600' },

  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
});