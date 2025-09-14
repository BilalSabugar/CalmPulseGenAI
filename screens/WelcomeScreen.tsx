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
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type ThemeChoice = 'light' | 'dark' | 'system';
export default function CalmPulseWelcomePageRN() {

  const [themeChoice, setThemeChoice] = useState<ThemeChoice>('system');
  const systemColorScheme = Appearance.getColorScheme();
  const { width, height } = useWindowDimensions();
  const isDesktop = width > height; // orientation-based rule
  const isDark = themeChoice === 'dark' || (themeChoice === 'system' && systemColorScheme === 'dark');

  const navigation = useNavigation()
  // Persist + bootstrap theme
  useEffect(() => {
    (async () => {
      try {
        const saved = (await AsyncStorage.getItem('cp-theme')) as ThemeChoice | null;
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
    const mk = (v: Animated.Value, dur: number) =>
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
  const scrollRef = useRef<ScrollView | null>(null);
  const featureRef = useRef<View | null>(null);
  const safetyRef = useRef<View | null>(null);
  const toolboxRef = useRef<View | null>(null);
  const instRef = useRef<View | null>(null);

  const goToLogin=()=>{
    navigation.navigate('Login');
  }

  const scrollTo = (ref: React.RefObject<View | null>) => {
    if (!scrollRef.current || !ref.current) return;
    (ref.current as any).measureLayout(
      scrollRef.current.getInnerViewNode(),
      (x: number, y: number) => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
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
      <View style={[S.rowBetween, S.headerWrap, { borderBottomColor: C.border, backgroundColor: C.headerBg, height: isDesktop ? 120 : 60 }]}>
        <View style={[S.row, { gap: 10 }]}>
          {/* <View style={[S.logoBlob, { backgroundColor: C.brandBlob }]} /> */}
          <Image style={[S.logoBlob, { backgroundColor: C.brandBlob }]} source={'../assets/ca-india-logo.png'} />
          <View>
            <Text style={[S.h2, { color: C.fg }]}>Calm Pulse AI</Text>
            <Text style={[S.meta, { color: C.subtle }]}>Your private AI companion</Text>
          </View>
        </View>

        {isDesktop ? (
          <View style={[S.row, { gap: 8 }]}>
            <HeaderLink label="Features" onPress={() => scrollTo(featureRef)} color={C.link} />
            <HeaderLink label="Safety" onPress={() => scrollTo(safetyRef)} color={C.link} />
            <HeaderLink label="Toolbox" onPress={() => scrollTo(toolboxRef)} color={C.link} />
            <HeaderLink label="For Institutions" onPress={() => scrollTo(instRef)} color={C.link} />
            <PrimaryButton label="Start Chat" onPress={() => { goToLogin() }} />
            <ThemeSwitchRN choice={themeChoice} setChoice={setThemeChoice} isDark={isDark} />
          </View>
        ) : (
          <View style={[S.row, { gap: 8 }]}>
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
            top: -80,
            right: width * 0.25,
            width: 220,
            height: 220,
            borderRadius: 110,
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
            top: -80,
            right: width * 0.2,
            width: 120,
            height: 120,
            borderRadius: 90,
            backgroundColor: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(216,180,254,0.3)',
            transform: [
              {
                scale: orbB.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.05] }),
              },
            ],
          }}
        />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 32 }} style={{ backgroundColor: C.bg }}>
        {/* Hero */}
        <View style={[S.container, { paddingVertical: isDesktop ? 24 : 16 }]}>
          <View style={[isDesktop ? S.row : undefined, { gap: 16, alignItems: 'center' }]}>
            {/* Left copy */}
            <View style={{ flex: 1 }}>
              <Text style={[S.h1, { color: C.fg }]}>Calm Pulse AI</Text>
              <Text style={[S.sub, { color: C.subtle, marginTop: 6 }]}>Your private AI companion for stress, stigma, and self‑care.</Text>
              <Text style={[S.body, { color: C.body, marginTop: 10 }]}>An empathetic, always‑available space to express yourself, track your mood, and practice healthy coping—confidentially and safely.</Text>
              <View style={[S.rowWrap, { gap: 8, marginTop: 14 }]}>
                <PrimaryButton label="Start a private chat" onPress={() => { }} />
                <ChipButton label="Explore wellness tools" onPress={() => scrollTo(toolboxRef)} isDark={isDark} />
                <ChipSolid label="For schools & NGOs" onPress={() => scrollTo(instRef)} isDark={isDark} />
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={[S.caption, { color: C.subtle }]}>🔒 End‑to‑end encrypted • You control your data</Text>
              </View>
            </View>

            {/* Chat Preview Card */}
            <View style={[S.card, { flex: 1, backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[S.rowBetween]}>
                <View style={[S.row, { gap: 10 }]}>
                  <View style={[S.avatar, { backgroundColor: C.brandBlob }]} />
                  <View>
                    <Text style={[S.smallBold, { color: C.fg }]}>Calm Pulse</Text>
                    <Text style={[S.caption, { color: C.subtle }]}>online • empathetic mode</Text>
                  </View>
                </View>
                <Text style={[S.caption, { color: C.subtle }]}>E2E</Text>
              </View>

              <View style={{ marginTop: 12, gap: 8 }}>
                <Bubble who="bot" isDark={isDark}>Hey, I’m here for you. What’s on your mind today?</Bubble>
                <Bubble who="me" isDark={isDark}>I’m anxious about exams and can’t focus.</Bubble>
                <Bubble who="bot" isDark={isDark}>Thanks for sharing. Let’s take a 60‑second breathing break together, then I’ll suggest a study plan that fits your energy.</Bubble>

                <View style={[S.rowWrap, { gap: 8, marginTop: 4 }]}>
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
        <View ref={featureRef} style={[S.container, { paddingVertical: 16 }]}>
          <Text style={[S.h2, { color: C.fg }]}>What makes Calm Pulse different</Text>
          <Text style={[S.body, { color: C.body, marginTop: 6 }]}>Designed for youth: private by default, supportive by design, and connected to real help when needed.</Text>

          <View style={[S.grid(isDesktop ? 3 : 1), { marginTop: 12 }]}>
            {features.map((f) => (
              <View key={f.title} style={[S.tile, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={{ fontSize: 20 }} accessibilityElementsHidden>{f.icon}</Text>
                <Text style={[S.smallBold, { color: C.fg, marginTop: 6 }]}>{f.title}</Text>
                <Text style={[S.tiny, { color: C.body, marginTop: 4 }]}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Safety & Toolbox */}
        <View ref={safetyRef} style={{ backgroundColor: C.sectionBg, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: C.border }}>
          <View style={[S.container, { paddingVertical: 16 }]}>
            <View style={[isDesktop ? S.row : undefined, { gap: 16, alignItems: 'flex-start' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[S.h2, { color: C.fg }]}>Confidentiality and crisis‑smart by default</Text>
                <View style={{ marginTop: 8, gap: 6 }}>
                  {[
                    '🔒 End‑to‑end encryption; private storage with transparent controls.',
                    '🛟 Crisis signals prompt on‑screen options for helplines or trusted contacts.',
                    '🧠 Risk detection minimizes false alarms; you decide what to share.',
                    '📝 Clear consent for any data sharing; no ads, no selling data.',
                  ].map((t) => (
                    <Text key={t} style={[S.body, { color: C.body }]}>{t}</Text>
                  ))}
                </View>
                <Text style={[S.caption, { color: C.subtle, marginTop: 8 }]}>
                  <Text style={{ fontWeight: '600' }}>Disclaimer: </Text>
                  Calm Pulse is not a substitute for professional care. If you are in immediate danger, contact your local emergency number right away.
                </Text>
              </View>

              {/* Toolbox tiles */}
              <View ref={toolboxRef} style={{ flex: 1 }}>
                <View style={[S.grid(2), { gap: 10 }]}>
                  {['Breathing', 'Meditations', 'Journaling', 'Affirmations', 'Mood Check', 'Vent Mode'].map((t) => (
                    <Pressable key={t} onPress={() => { }} style={[S.tile, { backgroundColor: C.chipBg, borderColor: C.border }]}>
                      <Text style={{ fontSize: 26 }} accessibilityElementsHidden>🌿</Text>
                      <Text style={[S.smallBold, { color: C.fg, marginTop: 6 }]}>{t}</Text>
                      <Text style={[S.tiny, { color: C.subtle, marginTop: 2 }]}>Quick access</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={[S.container, { paddingVertical: 16 }]}>
          <Text style={[S.h2, { color: C.fg }]}>How it works</Text>
          <View style={[S.grid(isDesktop ? 4 : 2), { marginTop: 12 }]}>
            {steps.map((s) => (
              <View key={s.n} style={[S.tile, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={[S.badge, { backgroundColor: C.brand, shadowColor: C.brand }]}><Text style={[S.tinyBold, { color: '#fff' }]}>{s.n}</Text></View>
                <Text style={[S.smallBold, { color: C.fg, marginTop: 8 }]}>{s.t}</Text>
                <Text style={[S.tiny, { color: C.body, marginTop: 4 }]}>{s.d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Impact & CTA */}
        <View ref={instRef} style={[S.container, { paddingBottom: 24 }]}>
          <View style={[S.callout, { backgroundColor: C.calloutBg, borderColor: C.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[S.h2, { color: C.fg }]}>A safer first step toward support</Text>
              <Text style={[S.body, { color: C.body, marginTop: 6 }]}>Available 24/7 to reduce stigma, build resilience, and intervene early when things feel heavy.</Text>
              <View style={[S.grid(2), { marginTop: 8 }]}>
                {['✅ Anonymous onboarding', '✅ Voice or text chat', '✅ Multilingual support', '✅ Integrates with helplines'].map((t) => (
                  <Text key={t} style={[S.body, { color: C.body }]}>{t}</Text>
                ))}
              </View>
            </View>

            {/* Form */}
            <View style={[S.formCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[S.smallBold, { color: C.fg }]}>Get started now</Text>
              <Text style={[S.tiny, { color: C.body, marginTop: 4 }]}>No email required. Create a passcode to keep your space private.</Text>

              <View style={{ marginTop: 10 }}>
                <Text style={[S.tinyBold, { color: C.fg }]}>Nickname</Text>
                <TextInput placeholder="e.g., SkyWalker" placeholderTextColor={C.placeholder} style={[S.input, { color: C.fg, borderColor: C.border, backgroundColor: C.inputBg }]} />
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={[S.tinyBold, { color: C.fg }]}>4‑digit passcode</Text>
                <TextInput placeholder="••••" placeholderTextColor={C.placeholder} secureTextEntry style={[S.input, { letterSpacing: 4, color: C.fg, borderColor: C.border, backgroundColor: C.inputBg }]} />
              </View>
              <PrimaryButton label="Enter Calm Space" onPress={() => { }} style={{ marginTop: 10 }} />
              <Text style={[S.caption, { color: C.subtle, marginTop: 6 }]}>By continuing you agree to the community care rules.</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border, backgroundColor: C.headerBg }}>
          <View style={[S.container, { paddingVertical: 16 }]}>
            <View style={[isDesktop ? S.row : undefined, { gap: 16, alignItems: 'flex-start' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[S.smallBold, { color: C.fg }]}>Calm Pulse AI</Text>
                <Text style={[S.tiny, { color: C.body, marginTop: 4 }]}>“Your private AI companion for stress, stigma, and self‑care.”</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S.tinyBold, { color: C.fg }]}>Resources</Text>
                {['Features', 'Safety & Trust', 'Wellness Toolbox'].map((t) => (
                  <Text key={t} style={[S.tiny, { color: C.link, marginTop: 4 }]} onPress={() => { }}>{t}</Text>
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S.tinyBold, { color: C.fg }]}>If you’re in crisis</Text>
                <Text style={[S.tiny, { color: C.body, marginTop: 4 }]}>Call your local emergency number or a trusted helpline immediately.</Text>
                <View style={[S.rowWrap, { gap: 6, marginTop: 8 }]}>
                  <ChipOutline label="India: 112 (Emergency)" onPress={() => { }} isDark={isDark} />
                  <ChipOutline label="Kiran Helpline: 1800‑599‑0019" onPress={() => { }} isDark={isDark} />
                </View>
              </View>
            </View>
          </View>
          <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border, paddingVertical: 10 }}>
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

function HeaderLink({ label, onPress, color }: { label: string; onPress: () => void; color: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent' }]}>
      <Text style={[S.tinyBold, { color }]}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({ label, onPress, style }: { label: string; onPress: () => void; style?: any }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [S.primaryBtn, style, { opacity: pressed ? 0.85 : 1 }]}>
      <Text style={S.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function PrimaryOutline({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[S.outlineBtn]}>
      <Text style={[S.tinyBold]}> {label} </Text>
    </Pressable>
  );
}

function ChipButton({ label, onPress, isDark }: { label: string; onPress: () => void; isDark: boolean }) {
  return (
    <Pressable onPress={onPress} style={[S.chip, { backgroundColor: isDark ? 'rgba(2,6,23,0.9)' : '#fff', borderColor: isDark ? '#334155' : '#cbd5e1' }]}>
      <Text style={[S.tinyBold, { color: isDark ? "#FFF" : "#000" }]}>{label}</Text>
    </Pressable>
  );
}

function ChipSolid({ label, onPress, isDark }: { label: string; onPress: () => void; isDark: boolean }) {
  return (
    <Pressable onPress={onPress} style={[S.chip, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.9)' }]}>
      <Text style={[S.tinyBold, { color: isDark ? '#e2e8f0' : '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function ChipOutline({ label, onPress, isDark }: { label: string; onPress: () => void; isDark: boolean }) {
  return (
    <Pressable onPress={onPress} style={[S.chip, { backgroundColor: 'transparent', borderColor: isDark ? '#334155' : '#cbd5e1' }]}>
      <Text style={[S.tiny]}>{label}</Text>
    </Pressable>
  );
}

function Bubble({ who, children, isDark }: { who: 'bot' | 'me'; children: React.ReactNode; isDark: boolean }) {
  const isMe = who === 'me';
  return (
    <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
      <View
        style={[
          {
            maxWidth: '80%',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
          },
          isMe
            ? { backgroundColor: '#4f46e5' } // indigo-600
            : { backgroundColor: isDark ? 'rgba(30,41,59,0.7)' : '#f1f5f9' },
          isMe ? { borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 },
        ]}
      >
        <Text style={{ color: isMe ? '#fff' : isDark ? '#e2e8f0' : '#0f172a', fontSize: 14 }}>{children as any}</Text>
      </View>
    </View>
  );
}

function ThemeSwitchRN({ choice, setChoice, isDark }: { choice: ThemeChoice; setChoice: (t: ThemeChoice) => void; isDark: boolean }) {
  const Btn = ({ t, label, symbol }: { t: ThemeChoice; label: string; symbol: string }) => (
    <Pressable
      onPress={() => setChoice(t)}
      accessibilityLabel={`Switch to ${label} theme`}
      style={({ pressed }) => [
        {
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          marginHorizontal: 2,
          backgroundColor: choice === t ? (isDark ? '#fff' : '#0f172a') : 'transparent',
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={{ fontSize: 12, color: choice === t ? (isDark ? '#0f172a' : '#fff') : isDark ? '#e2e8f0' : '#0f172a' }}>{symbol}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 4, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? '#334155' : '#cbd5e1', backgroundColor: isDark ? 'rgba(2,6,23,0.7)' : 'rgba(255,255,255,0.7)' }}>
      <Btn t="light" label="light" symbol="☀️" />
      <Btn t="system" label="system" symbol="🖥️" />
      <Btn t="dark" label="dark" symbol="🌙" />
    </View>
  );
}

// ---------------------------------------------
// Styles & Theme
// ---------------------------------------------

function buildColors(dark: boolean) {
  if (!dark) {
    return {
      bg: '#f8fafc', // slate-50
      fg: '#0f172a',
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
    };
  }
  return {
    bg: '#020617', // slate-950
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
  } as const;
}

const S = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },

  headerWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  logoBlob: { width: 64, height: 64, borderRadius: 12 },

  // NEW: shared chip style used by ChipButton / ChipSolid / ChipOutline
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },


  // Typography
  h1: { fontSize: 36, fontWeight: '800' },
  h2: { fontSize: 22, fontWeight: '700' },
  h6: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 16 },
  body: { fontSize: 14 },
  meta: { fontSize: 12 },
  smallBold: { fontSize: 14, fontWeight: '600' },
  tiny: { fontSize: 12 },
  tinyBold: { fontSize: 12, fontWeight: '700' },
  caption: { fontSize: 11 },

  // Cards & UI
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, padding: 12, shadowOpacity: 0.1, shadowRadius: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  tool: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  tile: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 12, marginBottom: 10 },
  badge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.2, shadowRadius: 6 },
  callout: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 22, padding: 16, flexDirection: 'row', gap: 16, alignItems: 'center' },
  formCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 12, flex: 1 },

  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10, marginTop: 4 },

  primaryBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  primaryBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  outlineBtn: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },

  grid: (cols: number) => ({ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' as const, ...(cols > 1 ? {} : {}) }),
});
