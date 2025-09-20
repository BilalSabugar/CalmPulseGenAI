import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  StatusBar,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  TextInput,
  Image,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { width } from '../components/constants';
import userAuth from '../components/functions/userAuth';

// --- ADD THIS AT THE TOP ---
// Change this value to scale the entire content of the screen.
const CONTENT_SCALE = 1.25;

export default function WelcomeScreen() {

  const [themeChoice, setThemeChoice] = useState('system');
  const systemColorScheme = Appearance.getColorScheme();
  const { width, height } = useWindowDimensions();
  const isDesktop = width > height; // orientation-based rule
  const isDark = themeChoice === 'dark' || (themeChoice === 'system' && systemColorScheme === 'dark');
  const [Username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');

  const navigation = useNavigation()
  // Persist + bootstrap theme
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('cp-theme');
        if (saved) setThemeChoice(saved);
      } catch { }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('cp-theme', themeChoice).catch(() => { });
  }, [themeChoice]);

  // React to system scheme changes when on "system"
  useEffect(() => {
    const sub = Appearance.addChangeListener(() => {
      // trigger re-render by setting state to itself
      setThemeChoice((t) => t);
    });
    return () => sub.remove();
  }, []);

  // Colors
  const C = useMemo(() => buildColors(isDark), [isDark]);

  // Animated background orbs (soft pulses)
  const orbA = useRef(new Animated.Value(0)).current;
  const orbB = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const mk = (v, dur) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: dur, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          Animated.timing(v, { toValue: 0, duration: dur, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        ])
      ).start();
    mk(orbA, 3000);
    mk(orbB, 4000);
  }, [orbA, orbB]);

  // Section refs for programmatic scroll
  const scrollRef = useRef(null);
  const featureRef = useRef(null);
  const safetyRef = useRef(null);
  const toolboxRef = useRef(null);
  const instRef = useRef(null);

  const goToLogin = () => {
    navigation.navigate('Login');
  }

  const scrollTo = (ref) => {
    if (!scrollRef.current || !ref.current) return;
    ref.current.measureLayout(
      scrollRef.current.getInnerViewNode(),
      (x, y) => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - (12 * CONTENT_SCALE)), animated: true });
      },
      () => { }
    );
  };

  const features = useMemo(
    () => [
      { title: 'Emotional AI Chat', desc: 'Understands tone & mood; responds with empathy.', icon: '💬' },
      { title: 'Risk Detection', desc: 'Flags severe distress; offers instant crisis options.', icon: '⚠️' },
      { title: 'Personalized Guidance', desc: 'Context-aware tips from onboarding & history.', icon: '🎯' },
      { title: 'Vent Mode', desc: 'A judgment‑free space—no advice, just listening.', icon: '🫶' },
      { title: 'Mood Tracking', desc: 'Daily check‑ins, patterns, and insights.', icon: '📈' },
      { title: 'Wellness Toolbox', desc: 'Breathing, meditations, journaling, affirmations.', icon: '🧰' },
      { title: 'Anonymous Community', desc: 'Optional peer support, safety‑moderated.', icon: '👥' },
      { title: 'Smart Integrations', desc: 'Vertex AI, Firebase, hotlines & local resources.', icon: '🔗' },
      { title: 'Gamified Self‑Care', desc: 'Streaks and badges to build habits.', icon: '🏅' },
      { title: 'Confidentiality', desc: 'E2E encryption. You control your data.', icon: '🔒' },
    ],
    []
  );

  const steps = [
    { n: 1, t: 'Say hello', d: 'Start a private chat—or use voice to talk it out.' },
    { n: 2, t: 'Be heard', d: 'The bot listens with empathy and checks for risk.' },
    { n: 3, t: 'Get guidance', d: 'Receive tailored exercises, tips, or calm time.' },
    { n: 4, t: 'Track progress', d: 'Notice patterns and celebrate tiny wins.' },
  ];

  return (
    <SafeAreaView style={[S.flex, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[S.rowBetween, S.headerWrap, { borderBottomColor: C.border, backgroundColor: C.headerBg, height: isDesktop ? 120 * CONTENT_SCALE : 60 * CONTENT_SCALE }]}>
        <View style={[S.row, { gap: 10 * CONTENT_SCALE }]}>
          <Image style={[S.logoBlob, { backgroundColor: C.brandBlob }]} source={'../assets/ca-india-logo.png'} />
          <View>
            <Text style={[S.h2, { color: C.fg }]}>Calm Pulse AI</Text>
            <Text style={[S.meta, { color: C.subtle }]}>Your private AI companion</Text>
          </View>
        </View>

        {isDesktop ? (
          <View style={[S.row, { gap: 8 * CONTENT_SCALE }]}>
            <HeaderLink label="Features" onPress={() => scrollTo(featureRef)} color={C.link} />
            <HeaderLink label="Safety" onPress={() => scrollTo(safetyRef)} color={C.link} />
            <HeaderLink label="Toolbox" onPress={() => scrollTo(toolboxRef)} color={C.link} />
            <HeaderLink label="For Institutions" onPress={() => scrollTo(instRef)} color={C.link} />
            <PrimaryButton label="Start Chat" onPress={() => { goToLogin() }} />
            <ThemeSwitchRN choice={themeChoice} setChoice={setThemeChoice} isDark={isDark} />
          </View>
        ) : (
          <View style={[S.row, { gap: 8 * CONTENT_SCALE }]}>
            <ThemeSwitchRN choice={themeChoice} setChoice={setThemeChoice} isDark={isDark} />
            <PrimaryOutline label="Menu" onPress={() => scrollTo(featureRef)} />
          </View>
        )}
      </View>

      {/* Background orbs */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Animated.View
          style={{
            position: 'absolute',
            top: -80 * CONTENT_SCALE,
            right: width * 0.25,
            width: 220 * CONTENT_SCALE,
            height: 220 * CONTENT_SCALE,
            borderRadius: 110 * CONTENT_SCALE,
            backgroundColor: isDark ? 'rgba(67,56,202,0.25)' : 'rgba(165,180,252,0.35)',
            transform: [
              {
                scale: orbA.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] }),
              },
            ],
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: -80 * CONTENT_SCALE,
            right: width * 0.2,
            width: 120 * CONTENT_SCALE,
            height: 120 * CONTENT_SCALE,
            borderRadius: 90 * CONTENT_SCALE,
            backgroundColor: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(216,180,254,0.3)',
            transform: [
              {
                scale: orbB.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.05] }),
              },
            ],
          }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} ref={scrollRef} contentContainerStyle={{ paddingBottom: 32 * CONTENT_SCALE }} style={{ backgroundColor: C.bg }}>
        {/* Hero */}
        <View style={[S.container, { paddingVertical: isDesktop ? 24 * CONTENT_SCALE : 16 * CONTENT_SCALE }]}>
          <View style={[isDesktop ? S.row : undefined, { gap: 16 * CONTENT_SCALE, alignItems: 'center' }]}>
            {/* Left copy */}
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  S.h1,
                  Platform.OS !== 'web' && { color: C.h1AccentNative },
                ]}
              >
                Calm Pulse AI
              </Text>
              <Text style={[S.sub, { color: C.subtle, marginTop: 6 * CONTENT_SCALE }]}>Your private AI companion for stress, stigma, and self‑care.</Text>
              <Text style={[S.body, { color: C.body, marginTop: 10 * CONTENT_SCALE }]}>An empathetic, always‑available space to express yourself, track your mood, and practice healthy coping—confidentially and safely.</Text>
              <View style={[S.rowWrap, { gap: 8 * CONTENT_SCALE, marginTop: 14 * CONTENT_SCALE }]}>
                <PrimaryButton label="Start a private chat" onPress={() => { }} />
                <ChipButton label="Explore wellness tools" onPress={() => scrollTo(toolboxRef)} isDark={isDark} />
              </View>
              <View style={{ marginTop: 8 * CONTENT_SCALE }}>
                <Text style={[S.caption, { color: C.subtle }]}>🔒 End‑to‑end encrypted • You control your data</Text>
              </View>
            </View>

            {/* Chat Preview Card */}
            <View style={[S.card, { flex: 1, backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[S.rowBetween]}>
                <View style={[S.row, { gap: 10 * CONTENT_SCALE }]}>
                  <View style={[S.avatar, { backgroundColor: C.brandBlob }]} />
                  <View>
                    <Text style={[S.smallBold, { color: C.fg }]}>Calm Pulse</Text>
                    <Text style={[S.caption, { color: C.subtle }]}>online • empathetic mode</Text>
                  </View>
                </View>
                <Text style={[S.caption, { color: C.subtle }]}>E2E</Text>
              </View>

              <View style={{ marginTop: 12 * CONTENT_SCALE, gap: 8 * CONTENT_SCALE }}>
                <Bubble who="bot" isDark={isDark}>Hey, I’m here for you. What’s on your mind today?</Bubble>
                <Bubble who="me" isDark={isDark}>I’m anxious about exams and can’t focus.</Bubble>
                <Bubble who="bot" isDark={isDark}>Thanks for sharing. Let’s take a 60‑second breathing break together, then I’ll suggest a study plan that fits your energy.</Bubble>

                <View style={[S.rowWrap, { gap: 8 * CONTENT_SCALE, marginTop: 4 * CONTENT_SCALE }]}>
                  {['✨ 1‑min Breathe', '📝 Grounding Journal', '🎧 Calm Sound', '💪 Focus Routine'].map((t) => (
                    <Pressable key={t} onPress={() => { }} style={[S.tool, { backgroundColor: C.chipBg, borderColor: C.border }]}>
                      <Text style={[S.tiny, { color: C.fg }]}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Features */}
        <View ref={featureRef} style={[S.container, { paddingVertical: 16 * CONTENT_SCALE }]}>
          <Text style={[S.h2, { color: C.fg }]}>What makes Calm Pulse different</Text>
          <Text style={[S.body, { color: C.body, marginTop: 6 * CONTENT_SCALE }]}>Designed for youth: private by default, supportive by design, and connected to real help when needed.</Text>

          <View style={[S.grid(isDesktop ? 3 : 1), { marginTop: 12 * CONTENT_SCALE }]}>
            {features.map((f) => (
              <View key={f.title} style={[S.tile, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={{ fontSize: 20 * CONTENT_SCALE }} accessibilityElementsHidden>{f.icon}</Text>
                <Text style={[S.h3, { color: C.fg, marginTop: 6 * CONTENT_SCALE }]}>{f.title}</Text>
                <Text style={[S.tiny, { color: C.body, marginTop: 4 * CONTENT_SCALE }]}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Safety & Toolbox */}
        <View ref={safetyRef} style={{ backgroundColor: C.sectionBg, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: C.border }}>
          <View style={[S.container, { paddingVertical: 16 * CONTENT_SCALE }]}>
            <View style={[isDesktop ? S.row : undefined, { gap: 16 * CONTENT_SCALE, alignItems: 'flex-start' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[S.h2, { color: C.fg }]}>Confidentiality and crisis‑smart by default</Text>
                <View style={{ marginTop: 8 * CONTENT_SCALE, gap: 6 * CONTENT_SCALE }}>
                  {[
                    '🔒 End‑to‑end encryption; private storage with transparent controls.',
                    '🛟 Crisis signals prompt on‑screen options for helplines or trusted contacts.',
                    '🧠 Risk detection minimizes false alarms; you decide what to share.',
                    '📝 Clear consent for any data sharing; no ads, no selling data.',
                  ].map((t) => (
                    <Text key={t} style={[S.body, { color: C.body }]}>{t}</Text>
                  ))}
                </View>
                <Text style={[S.caption, { color: C.subtle, marginTop: 8 * CONTENT_SCALE }]}>
                  <Text style={{ fontWeight: '600' }}>Disclaimer: </Text>
                  Calm Pulse is not a substitute for professional care. If you are in immediate danger, contact your local emergency number right away.
                </Text>
              </View>

              {/* Toolbox tiles */}
              <View ref={toolboxRef} style={{ flex: 1 }}>
                <View style={[S.grid(2), { gap: 10 * CONTENT_SCALE }]}>
                  {['Breathing', 'Meditations', 'Journaling', 'Affirmations', 'Mood Check', 'Vent Mode'].map((t) => (
                    <Pressable key={t} onPress={() => { }} style={[S.tile, { backgroundColor: C.chipBg, borderColor: C.border }]}>
                      <Text style={{ fontSize: 26 * CONTENT_SCALE }} accessibilityElementsHidden>🌿</Text>
                      <Text style={[S.smallBold, { color: C.fg, marginTop: 6 * CONTENT_SCALE }]}>{t}</Text>
                      <Text style={[S.tiny, { color: C.subtle, marginTop: 2 * CONTENT_SCALE }]}>Quick access</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={[S.container, { paddingVertical: 16 * CONTENT_SCALE }]}>
          <Text style={[S.h2, { color: C.fg }]}>How it works</Text>
          <View style={[S.grid(isDesktop ? 4 : 2), { marginTop: 12 * CONTENT_SCALE }]}>
            {steps.map((s) => (
              <View key={s.n} style={[S.tile, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={[S.badge, { backgroundColor: C.brand, shadowColor: C.brand }]}>
                  <Text style={[S.h6, { color: '#fff' }]}>{s.n}</Text>
                </View>
                <Text style={[S.smallBold, { color: C.fg, marginTop: 8 * CONTENT_SCALE }]}>{s.t}</Text>
                <Text style={[S.tiny, { color: C.body, marginTop: 4 * CONTENT_SCALE }]}>{s.d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Impact & CTA */}
        <View ref={instRef} style={[S.container, { paddingBottom: 24 * CONTENT_SCALE }]}>
          <View style={[S.callout, { backgroundColor: C.calloutBg, borderColor: C.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[S.h2, { color: C.fg }]}>A safer first step toward support</Text>
              <Text style={[S.body, { color: C.body, marginTop: 6 * CONTENT_SCALE }]}>Available 24/7 to reduce stigma, build resilience, and intervene early when things feel heavy.</Text>
              <View style={[S.grid(2), { marginTop: 8 * CONTENT_SCALE }]}>
                {['✅ Anonymous onboarding', '✅ Voice or text chat', '✅ Multilingual support', '✅ Integrates with helplines'].map((t) => (
                  <Text key={t} style={[S.body, { color: C.body }]}>{t}</Text>
                ))}
              </View>
            </View>

            {/* Form */}
            <View style={[S.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[S.smallBold, { color: C.fg }]}>Get started now</Text>
              <Text style={[S.tiny, { color: C.body, marginTop: 4 * CONTENT_SCALE }]}>No email required. Create a passcode to keep your space private.</Text>

              <View style={{ marginTop: 10 * CONTENT_SCALE }}>
                <Text style={[S.tinyBold, { color: C.fg }]}>Username</Text>
                <TextInput
                  value={Username}
                  onChangeText={(u) => setUsername(u)}
                  placeholder="e.g., SkyWalker"
                  placeholderTextColor={C.placeholder}
                  style={[S.input, { color: C.fg, borderColor: C.border, backgroundColor: C.inputBg }]}
                />
              </View>
              <View style={{ marginTop: 10 * CONTENT_SCALE }}>
                <Text style={[S.tinyBold, { color: C.fg }]}>Passcode</Text>
                <TextInput
                  value={passcode}
                  onChangeText={(p) => setPasscode(p)}
                  placeholder="••••••"
                  maxLength={6}
                  textContentType='password'
                  keyboardType='numeric'
                  placeholderTextColor={C.placeholder}
                  secureTextEntry
                  style={[S.input, { letterSpacing: 4 * CONTENT_SCALE, color: C.fg, borderColor: C.border, backgroundColor: C.inputBg }]}
                />
              </View>
              <PrimaryButton label="Enter Calm Space" onPress={() => { userAuth(Username, passcode).then((user) => user && navigation.navigate('Homescreen')) }} style={{ marginTop: 10 * CONTENT_SCALE }} />
              <Text style={[S.caption, { color: C.subtle, marginTop: 6 * CONTENT_SCALE }]}>By continuing you agree to the community care rules.</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border, backgroundColor: C.headerBg }}>
          <View style={[S.container, { paddingVertical: 16 * CONTENT_SCALE }]}>
            <View style={[isDesktop ? S.row : undefined, { gap: 16 * CONTENT_SCALE, alignItems: 'flex-start' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[S.smallBold, { color: C.fg }]}>Calm Pulse AI</Text>
                <Text style={[S.tiny, { color: C.body, marginTop: 4 * CONTENT_SCALE }]}>“Your private AI companion for stress, stigma, and self‑care.”</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S.tinyBold, { color: C.fg }]}>Resources</Text>
                {['Features', 'Safety & Trust', 'Wellness Toolbox'].map((t) => (
                  <Text key={t} style={[S.tiny, { color: C.link, marginTop: 4 * CONTENT_SCALE }]} onPress={() => { }}>{t}</Text>
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S.tinyBold, { color: C.fg }]}>If you’re in crisis</Text>
                <Text style={[S.tiny, { color: C.body, marginTop: 4 * CONTENT_SCALE }]}>Call your local emergency number or a trusted helpline immediately.</Text>
                <View style={[S.rowWrap, { gap: 6 * CONTENT_SCALE, marginTop: 8 * CONTENT_SCALE }]}>
                  <ChipOutline label="India: 112 (Emergency)" onPress={() => { }} isDark={isDark} />
                  <ChipOutline label="Kiran Helpline: 1800‑599‑0019" onPress={() => { }} isDark={isDark} />
                </View>
              </View>
            </View>
          </View>
          <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border, paddingVertical: 10 * CONTENT_SCALE }}>
            <Text style={[S.caption, { color: C.subtle, textAlign: 'center' }]}>© {new Date().getFullYear()} Calm Pulse. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------
// Components
// ---------------------------------------------

function HeaderLink({ label, onPress, color }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ paddingVertical: 8 * CONTENT_SCALE, paddingHorizontal: 12 * CONTENT_SCALE, borderRadius: 999, backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent' }]}>
      <Text style={[S.tinyBold, { color }]}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({ label, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [S.primaryBtn, style, { opacity: pressed ? 0.85 : 1 }]}>
      <Text style={S.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function PrimaryOutline({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={[S.outlineBtn]}>
      <Text style={[S.tinyBold]}> {label} </Text>
    </Pressable>
  );
}

function ChipButton({ label, onPress, isDark }) {
  return (
    <Pressable onPress={onPress} style={[S.chip, { backgroundColor: isDark ? 'rgba(2,6,23,0.9)' : '#fff', borderColor: isDark ? '#334155' : '#cbd5e1' }]}>
      <Text style={[S.tinyBold, { color: isDark ? "#FFF" : "#000" }]}>{label}</Text>
    </Pressable>
  );
}

function ChipSolid({ label, onPress, isDark }) {
  return (
    <Pressable onPress={onPress} style={[S.chip, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.9)' }]}>
      <Text style={[S.tinyBold, { color: isDark ? '#e2e8f0' : '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function ChipOutline({ label, onPress, isDark }) {
  return (
    <Pressable onPress={onPress} style={[S.chip, { backgroundColor: 'transparent', borderColor: isDark ? '#334155' : '#cbd5e1' }]}>
      <Text style={[S.tiny, { color: isDark ? "#FFF" : "#000" }]}>{label}</Text>
    </Pressable>
  );
}

function Bubble({ who, children, isDark }) {
  const isMe = who === 'me';
  return (
    <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
      <View
        style={[
          {
            maxWidth: '80%',
            paddingHorizontal: 12 * CONTENT_SCALE,
            paddingVertical: 8 * CONTENT_SCALE,
            borderRadius: 16 * CONTENT_SCALE,
          },
          isMe
            ? { backgroundColor: '#4f46e5' } // indigo-600
            : { backgroundColor: isDark ? 'rgba(30,41,59,0.7)' : '#f1f5f9' },
          isMe ? { borderBottomRightRadius: 6 * CONTENT_SCALE } : { borderBottomLeftRadius: 6 * CONTENT_SCALE },
        ]}
      >
        <Text style={{ color: isMe ? '#fff' : isDark ? '#e2e8f0' : '#0f172a', fontSize: 14 * CONTENT_SCALE }}>{children}</Text>
      </View>
    </View>
  );
}

function ThemeSwitchRN({ choice, setChoice, isDark }) {
  const Btn = ({ t, label, symbol }) => (
    <Pressable
      onPress={() => setChoice(t)}
      accessibilityLabel={`Switch to ${label} theme`}
      style={({ pressed }) => [
        {
          paddingHorizontal: 10 * CONTENT_SCALE,
          paddingVertical: 6 * CONTENT_SCALE,
          borderRadius: 999,
          marginHorizontal: 2 * CONTENT_SCALE,
          backgroundColor: choice === t ? (isDark ? '#fff' : '#0f172a') : 'transparent',
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={{ fontSize: 12 * CONTENT_SCALE, color: choice === t ? (isDark ? '#0f172a' : '#fff') : isDark ? '#e2e8f0' : '#0f172a' }}>{symbol}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 4 * CONTENT_SCALE, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? '#334155' : '#cbd5e1', backgroundColor: isDark ? 'rgba(2,6,23,0.7)' : 'rgba(255,255,255,0.7)' }}>
      <Btn t="light" label="light" symbol="☀️" />
      <Btn t="system" label="system" symbol="🖥️" />
      <Btn t="dark" label="dark" symbol="🌙" />
    </View>
  );
}


// ---------------------------------------------
// Styles & Theme
// ---------------------------------------------

function buildColors(dark) {
  if (!dark) {
    return {
      bg: '#f8fafc', // slate-50
      fg: 'linear-gradient(90deg, #7dd3fc, #c7d2fe)',
      body: '#334155',
      subtle: '#64748b',
      link: '#0f172a',
      border: '#e2e8f0',
      headerBg: 'rgba(255,255,255,0.6)',
      card: 'rgba(255,255,255,0.8)',
      sectionBg: 'rgba(255,255,255,0.7)',
      chipBg: '#f8fafc',
      calloutBg: '#eef2ff',
      brand: '#4f46e5',
      brandBlob: '#6366f1',
      placeholder: '#94a3b8',
      inputBg: '#fff',
      h1AccentNative: '#4f46e5',
    };
  }
  return {
    bg: '#000', // slate-950
    fg: '#e2e8f0',
    body: '#cbd5e1',
    subtle: '#94a3b8',
    link: '#e2e8f0',
    border: '#1f2937',
    headerBg: 'rgba(2,6,23,0.6)',
    card: 'rgba(2,6,23,0.6)',
    sectionBg: 'rgba(2,6,23,0.4)',
    chipBg: 'rgba(30,41,59,0.6)',
    calloutBg: 'rgba(15,23,42,0.5)',
    brand: '#4f46e5',
    brandBlob: 'rgba(99,102,241,0.6)',
    placeholder: '#64748b',
    inputBg: '#0b1220',
    h1AccentNative: '#a5b4fc',
  };
}

const S = StyleSheet.create({
  flex: { flex: 1, overflow: "hidden", maxWidth: width },
  container: { paddingHorizontal: 16 * CONTENT_SCALE },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },

  headerWrap: { paddingHorizontal: 16 * CONTENT_SCALE, paddingVertical: 10 * CONTENT_SCALE, borderBottomWidth: StyleSheet.hairlineWidth },
  logoBlob: { width: 64 * CONTENT_SCALE, height: 64 * CONTENT_SCALE, borderRadius: 12 * CONTENT_SCALE },

  chip: { paddingHorizontal: 12 * CONTENT_SCALE, paddingVertical: 8 * CONTENT_SCALE, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },


  // Typography
  h1: {
    ...(Platform.OS === 'web'
      ? { backgroundImage: 'linear-gradient(45deg, #4f46e5, #e6e5eeff)', WebkitBackgroundClip: 'text', color: 'transparent' }
      : null),
    fontSize: 48 * CONTENT_SCALE, fontWeight: '800'
  },
  h2: { fontSize: 22 * CONTENT_SCALE, fontWeight: '700' },
  h3: { fontSize: 20 * CONTENT_SCALE, fontWeight: '600' },
  h6: { fontSize: 16 * CONTENT_SCALE, fontWeight: '700' },
  sub: { fontSize: 16 * CONTENT_SCALE },
  body: { fontSize: 14 * CONTENT_SCALE },
  meta: { fontSize: 12 * CONTENT_SCALE },
  smallBold: { fontSize: 14 * CONTENT_SCALE, fontWeight: '600' },
  tiny: { fontSize: 12 * CONTENT_SCALE },
  tinyBold: { fontSize: 12 * CONTENT_SCALE, fontWeight: '700' },
  caption: { fontSize: 11 * CONTENT_SCALE },

  // Cards & UI
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20 * CONTENT_SCALE, padding: 12 * CONTENT_SCALE, shadowOpacity: 0.1, shadowRadius: 8 * CONTENT_SCALE },
  avatar: { width: 32 * CONTENT_SCALE, height: 32 * CONTENT_SCALE, borderRadius: 16 * CONTENT_SCALE },
  tool: { paddingHorizontal: 10 * CONTENT_SCALE, paddingVertical: 8 * CONTENT_SCALE, borderRadius: 12 * CONTENT_SCALE, borderWidth: StyleSheet.hairlineWidth },
  tile: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16 * CONTENT_SCALE, padding: 12 * CONTENT_SCALE, marginBottom: 10 * CONTENT_SCALE, alignItems: 'center', shadowOpacity: 0.1, shadowRadius: 8 * CONTENT_SCALE },
  badge: { width: 50 * CONTENT_SCALE, height: 50 * CONTENT_SCALE, borderRadius: 64 * CONTENT_SCALE, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.2, shadowRadius: 6 * CONTENT_SCALE },
  callout: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 22 * CONTENT_SCALE, padding: 16 * CONTENT_SCALE, flexDirection: 'row', gap: 16 * CONTENT_SCALE, alignItems: 'center' },
  formCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16 * CONTENT_SCALE, padding: 12 * CONTENT_SCALE, flex: 1 },

  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12 * CONTENT_SCALE, paddingHorizontal: 10 * CONTENT_SCALE, paddingVertical: 10 * CONTENT_SCALE, marginTop: 4 * CONTENT_SCALE, fontSize: 14 * CONTENT_SCALE },

  primaryBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 16 * CONTENT_SCALE, paddingVertical: 10 * CONTENT_SCALE, borderRadius: 999 },
  primaryBtnText: { color: '#fff', fontSize: 13 * CONTENT_SCALE, fontWeight: '600' },

  outlineBtn: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1', paddingHorizontal: 12 * CONTENT_SCALE, paddingVertical: 8 * CONTENT_SCALE, borderRadius: 999 },

  grid: (cols) => ({ flexDirection: 'row', flexWrap: 'wrap', gap: 10 * CONTENT_SCALE, justifyContent: 'space-between', ...(cols > 1 ? {} : {}) }),
});