import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  Appearance,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import rid from '../components/functions/RandomIDGenerator';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; // Added FontAwesome5 for icons
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// --- Animated Message Bubble ---
class Bubble extends React.PureComponent {
  constructor(props) {
    super(props);
    this.slideAnim = new Animated.Value(20);
    this.opacityAnim = new Animated.Value(0);
  }

  componentDidMount() {
    Animated.parallel([
      Animated.timing(this.slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(this.opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  render() {
    const { who, text, palette } = this.props;
    const isMe = who === 'me';
    return (
      <Animated.View style={{ transform: [{ translateY: this.slideAnim }], opacity: this.opacityAnim }}>
        <View style={[S.row, { justifyContent: isMe ? 'flex-end' : 'flex-start', paddingHorizontal: 16 }]}>
          <View style={[S.bubble, isMe ? { backgroundColor: palette.primary } : { backgroundColor: palette.ghost }]}>
            <Text style={[S.body, { color: isMe ? '#fff' : palette.text }]}>{text}</Text>
          </View>
        </View>
      </Animated.View>
    );
  }
}

// --- Intro Overlay Component ---
function IntroOverlay({ palette, showIntro, onHide }) {
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const overlayTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showIntro) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(overlayTranslateY, {
          toValue: height, // Slide down out of view
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide(); // Call onHide after animation completes
      });
    }
  }, [showIntro]);

  if (!showIntro) return null; // Only render when showIntro is true

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        S.introOverlay,
        {
          opacity: overlayOpacity,
          transform: [{ translateY: overlayTranslateY }],
          backgroundColor: palette.introBg, // Using a distinct background for intro
        },
      ]}>
      <Text style={[S.introTitle, { color: palette.text }]}>Welcome back! What's your intention today?</Text>

      <View style={S.introButtonsContainer}>
        <IntroActionButton icon="brain" label="Start 5-min Meditation" palette={palette} />
        <IntroActionButton icon="book-open" label="Journal My Thoughts" palette={palette} />
        <IntroActionButton icon="bolt" label="Quick Energy Boost" palette={palette} />
        <IntroActionButton icon="calendar-alt" label="Plan Ahead" palette={palette} />
      </View>

      <View style={[S.moodTrackerCard, { backgroundColor: palette.card }]}>
        <Text style={[S.moodTrackerTitle, { color: palette.text }]}>Want to log your mood or try a 1-minute breathing exercise?</Text>
        <View style={S.moodIconsContainer}>
          {['smile', 'meh', 'frown', 'sad-tear', 'angry'].map((icon, index) => (
            <Pressable key={index} style={S.moodIconWrapper}>
              <FontAwesome5 name={icon} size={28} color={palette.icon} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[S.breatheExerciseCard, { backgroundColor: palette.card }]}>
        <Text style={[S.breatheText, { color: palette.text }]}>Inhale... Exhale...</Text>
        <View style={S.breathingSphere}>
          {/* Animated sphere for breathing */}
          <Animated.View
            style={[
              S.sphereInner,
              {
                backgroundColor: palette.primary,
                transform: [
                  {
                    scale: overlayTranslateY.interpolate({
                      inputRange: [0, height],
                      outputRange: [1, 0.5], // Shrinks as it fades out
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text style={[S.breatheTimer, { color: palette.text }]}>0:30</Text>
      </View>
    </Animated.View>
  );
}

function IntroActionButton({ icon, label, palette }) {
  return (
    <Pressable style={[S.introActionBtn, { borderColor: palette.border, backgroundColor: palette.ghost }]}>
      <FontAwesome5 name={icon} size={14} color={palette.text} style={{ marginRight: 6 }} />
      <Text style={{ color: palette.text, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}


export default function Chatscreen() {
  const [messages, setMessages] = useState([]);
  const [isTypingBot, setIsTypingBot] = useState(false);
  const [theme] = useState(Appearance.getColorScheme() || 'light');
  const isDark = theme === 'dark';
  const palette = isDark ? D : L;
  const flatListRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true); // Control intro visibility
  const [renderIntro, setRenderIntro] = useState(true); // Control if intro is mounted

  // --- Reusable Animated Pressable ---
  function APressable({ children, style, onPress }) {
    const scale = useRef(new Animated.Value(1)).current;
    return (
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        onPress={onPress}
        style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Pressable>
    );
  }

  // --- New Animated Typing Indicator ---
  function TypingHint({ palette }) {
    const animValues = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
    useEffect(() => {
      const animations = animValues.map(val =>
        Animated.sequence([
          Animated.timing(val, { toValue: -4, duration: 400, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );
      const loop = Animated.stagger(200, animations);
      Animated.loop(loop).start();
    }, []);

    return (
      <View style={[S.row, { alignItems: 'center', gap: 8, paddingLeft: 16, marginBottom: 8 }]}>
        <View style={S.row}>
          {animValues.map((val, i) => (
            <Animated.View key={i} style={[S.typingDot, { backgroundColor: palette.muted, transform: [{ translateY: val }] }]} />
          ))}
        </View>
        <Text style={[S.meta, { color: palette.muted }]}>Calm Pulse is typing</Text>
      </View>
    );
  }

  // --- Logic for Sending Messages ---
  function sendUser(text) {
    if (!text.trim()) return;
    setMessages(m => [...m, { id: rid(), who: 'me', text: text.trim() }]);
    setIsTypingBot(true);

    if (showIntro) {
      setShowIntro(false); // Hide intro when first message is sent
    }

    setTimeout(() => {
      sendBot('Got it. Would you prefer suggestions, or just Vent Mode for a bit?');
      setIsTypingBot(false);
    }, 1500);
  }

  function sendBot(text) {
    setMessages(m => [...m, { id: rid(), who: 'bot', text }]);
  }

  // --- Main Chat Input Component ---
  function ChatInput({ onSend, palette }) {
    const [text, setText] = useState('');
    const submit = () => {
      if (!text.trim()) return;
      onSend(text);
      setText('');
    };

    return (
      <View style={[S.inputContainer, { borderTopColor: palette.border }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder="Type a message…"
          placeholderTextColor={palette.muted}
          style={[S.input, { borderColor: palette.border, backgroundColor: palette.ghost, color: palette.text }]}
        />
        <APressable onPress={submit} style={[S.sendBtn, { backgroundColor: palette.primary }]}>
          <MaterialIcons name="send" size={20} color="#fff" />
        </APressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={[S.flex, { backgroundColor: palette.appBg }]}>
      <KeyboardAvoidingView
        style={S.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <View style={S.flex}>
          <View style={[S.headerWrap, { borderBottomColor: palette.border }]}>
            <View style={[S.row, { gap: 8 }]}>
              <Image style={S.logoBlob} source={require("../assets/logo.png")} />
              <Text style={[S.smallBold, { color: palette.text }]}>Calm Pulse</Text>
            </View>
            <APressable style={[S.endChatBtn, { backgroundColor: '#f43f5e' }]}>
              <Text style={S.primaryBtnText}>End Chat</Text>
            </APressable>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Bubble who={item.who} text={item.text} palette={palette} />}
            contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: 12 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {isTypingBot && <TypingHint palette={palette} />}
          <ChatInput onSend={sendUser} palette={palette} />
        </View>

        {renderIntro && <IntroOverlay palette={palette} showIntro={showIntro} onHide={() => setRenderIntro(false)} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Color Palettes ---
const L = {
  appBg: '#f7f9fc',
  introBg: 'linear-gradient(135deg, #a7b7ff, #ffc7d4)', // Placeholder for gradient, use expo-linear-gradient for actual
  text: '#1c2a4d',
  muted: '#8d9fbd',
  border: '#e8edf5',
  ghost: '#f0f4f9',
  card: '#ffffff',
  primary: '#5a67d8',
  icon: '#5a67d8',
  introGradientColors: ['#A7B7FF', '#FFC7D4'],
};
const D = {
  appBg: '#121a2c',
  introBg: 'linear-gradient(135deg, #4a3a7f, #8c5a8c)', // Placeholder for gradient
  text: '#e6efff',
  muted: '#7a8bb8',
  border: '#2a3b5c',
  ghost: '#222e4d',
  card: '#1a243d',
  primary: '#7a9dff',
  icon: '#e6efff',
  introGradientColors: ['#4A3A7F', '#8C5A8C'],
};

// --- Styles ---
const S = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent', // Make header transparent to show introBg if visible
  },
  logoBlob: { width: 40, height: 40, borderRadius: 20 },
  body: { fontSize: 16, lineHeight: 24 },
  smallBold: { fontSize: 18, fontWeight: '700' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  endChatBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: { maxWidth: '85%', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1 },
  input: { height: 48, borderWidth: 1, borderRadius: 24, paddingHorizontal: 18, flex: 1 },
  meta: { fontSize: 13, color: '#93a4c8' },
  typingDot: { width: 7, height: 7, borderRadius: 4, marginHorizontal: 2 },

  // --- Intro Overlay Styles ---
  introOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10, // Ensure it's on top
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    marginTop: -80, // Adjust to center vertically
  },
  introButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  introActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  moodTrackerCard: {
    width: '90%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  moodTrackerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  moodIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  moodIconWrapper: {
    padding: 8,
    borderRadius: 30,
    // Add background or hover effects if desired
  },
  breatheExerciseCard: {
    width: '90%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  breatheText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  breathingSphere: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden', // Ensures inner sphere stays within bounds
  },
  sphereInner: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  breatheTimer: {
    fontSize: 16,
    marginTop: 10,
  },
});