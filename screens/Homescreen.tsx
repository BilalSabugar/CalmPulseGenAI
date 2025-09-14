import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
  Appearance,
  Platform,
  Modal as RNModal,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Polyline, Circle, G } from 'react-native-svg';

export type ThemeMode = 'light' | 'dark' | 'system';

export default function CalmPulseHome() {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [dims, setDims] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { w: width, h: height };
  });
  const isDesktop = dims.w > dims.h;

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [breatheOpen, setBreatheOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [ventMode, setVentMode] = useState(false);

  const user = { nickname: 'SkyWalker', streak: getStreakSync() };

  type Msg = { id: string; who: 'me' | 'bot'; text: string; ts: number };
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: rid(),
      who: 'bot',
      text: 'Welcome back! Want a 1‑minute breathing exercise or to log your mood?',
      ts: Date.now() - 10000,
    },
  ]);

  const [moodSeries, setMoodSeries] = useState<number[]>([3, 4, 2, 5, 4, 4, 5]);
  const [sleepSeries, setSleepSeries] = useState<number[]>([6.5, 7.0, 5.5, 8.0, 7.2, 6.8, 7.6]);

  // bootstrap persisted values
  useEffect(() => {
    (async () => {
      const savedTheme = (await AsyncStorage.getItem('cp-theme')) as ThemeMode | null;
      if (savedTheme) setTheme(savedTheme);
      const savedMsgs = await load<Msg[]>('cp_messages');
      if (savedMsgs) setMessages(savedMsgs);
      const mm = await load<number[]>('cp_moods');
      if (mm) setMoodSeries(mm);
      const ss = await load<number[]>('cp_sleep');
      if (ss) setSleepSeries(ss);
    })();
  }, []);

  // persist
  useEffect(() => { save('cp_messages', messages); }, [messages]);
  useEffect(() => { save('cp_moods', moodSeries); }, [moodSeries]);
  useEffect(() => { save('cp_sleep', sleepSeries); }, [sleepSeries]);

  // theme sync with system
  useEffect(() => {
    const sub = Appearance.addChangeListener(() => {
      // noop — we read Appearance in isDark
    });
    save('cp-theme', theme);
    return () => sub.remove();
  }, [theme]);

  // orientation listener
  useEffect(() => {
    const onChange = ({ window }: { window: any }) => {
      setDims({ w: window.width, h: window.height });
    };
    const sub = Dimensions.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  const isDark = useMemo(() => {
    const sysDark = Appearance.getColorScheme() === 'dark';
    return theme === 'dark' || (theme === 'system' && sysDark);
  }, [theme, dims.w, dims.h]);

  
  // Quick tools & helpers
  
  const quickTools = useMemo(
    () => [
      { key: 'breathe', title: '1‑min Breathe', sub: 'Box breathing', icon: '🫁', onPress: () => setBreatheOpen(true) },
      { key: 'mood', title: 'Mood Check', sub: 'Daily reflection', icon: '📊', onPress: () => scrollToId('mood') },
      { key: 'vent', title: 'Vent Mode', sub: ventMode ? 'Listening…' : 'No advice, just listen', icon: '🗣️', onPress: () => setVentMode(v => !v) },
      { key: 'journal', title: 'Journal', sub: 'Prompt of the day', icon: '📝', onPress: () => setJournalOpen(true) },
      { key: 'meditate', title: 'Meditate', sub: '5‑min calm', icon: '🧘', onPress: () => sendBot('Starting a short guided meditation. Close your eyes and follow your breath.') },
      { key: 'affirm', title: 'Affirm', sub: 'Positive cue', icon: '✨', onPress: () => sendBot(randomAffirmation()) },
    ],
    [ventMode]
  );

  function onLogMood(score: number) {
    const next = [...moodSeries];
    next.shift();
    next.push(score);
    setMoodSeries(next);
    markCheckInSync();
    sendBot(`Logged your mood: ${score}/5. Would you like a suggestion to match this mood?`);
  }

  
  // Chat logic
  
  const inputRef = useRef<TextInput>(null);
  function sendUser(text: string) {
    if (!text.trim()) return;
    const msg: Msg = { id: rid(), who: 'me', text: text.trim(), ts: Date.now() };
    setMessages(m => [...m, msg]);
    smartReply(text.trim());
  }
  function sendBot(text: string) {
    const msg: Msg = { id: rid(), who: 'bot', text, ts: Date.now() };
    setMessages(m => [...m, msg]);
  }

  function smartReply(text: string) {
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

  
  // Layout Refs
  
  const scrollRef = useRef<ScrollView>(null);
  const anchors = useRef<Record<string, number>>({});
  const onLayoutAnchor = (id: string, y: number) => (anchors.current[id] = y);
  function scrollToId(id: string) {
    const y = anchors.current[id] || 0;
    scrollRef.current?.scrollTo({ y, animated: true });
  }

  
  // Render
  
  const palette = isDark ? D : L;

  return (
    <View style={[S.flex, { backgroundColor: palette.appBg }]}>
      {/* Header */}
      <View style={[S.headerWrap, { borderBottomColor: palette.border, backgroundColor: palette.glass }] }>
        <View style={[S.rowBetween, { paddingHorizontal: 16 }] }>
          <View style={[S.row, { gap: 10 }]}>
            <View style={[S.logoBlob, { backgroundColor: palette.blob }]} />
            <View>
              <Text style={[S.smallBold, { color: palette.text }]}>{'Calm Pulse'}</Text>
              <Text style={[S.meta, { color: palette.muted }]}>{`Welcome back, ${user.nickname}`}</Text>
            </View>
          </View>
          <View style={[S.row, { gap: 8 }]}>
            <APressable onPress={() => scrollToId('chat')} style={[S.primaryBtn, { backgroundColor: palette.primary }]}>
              <Text style={S.primaryBtnText}>Continue Chat</Text>
            </APressable>
            <ThemeSwitch theme={theme} setTheme={setTheme} palette={palette} />
            <IconButton label="Notifications" onPress={() => setNotificationsOpen(true)} palette={palette}>🔔</IconButton>
            <IconButton label="Profile" palette={palette}>🙂</IconButton>
            <IconButton label="Settings" onPress={() => setSettingsOpen(true)} palette={palette}>⚙️</IconButton>
          </View>
        </View>
      </View>

      {/* Shell */}
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16 }}>
        <View style={[isDesktop ? S.desktopShell : undefined, { gap: 16 }]}>
          {/* Sidebar (desktop) */}
          {isDesktop && (
            <View style={{ width: 260 }}>
              <GradientCard palette={palette}>
                <Text style={[S.smallBold, { color: palette.text }]}>{user.nickname}</Text>
                <Text style={[S.meta, { color: palette.muted, marginTop: 4 }]}>{`${user.streak}‑day streak • 3 badges`}</Text>
              </GradientCard>
              <View style={{ height: 8 }} />
              <View style={{ gap: 8 }}>
                {[
                  { label: 'Home', icon: '🏠' },
                  { label: 'Chat', icon: '💬' },
                  { label: 'Tools', icon: '🧰' },
                  { label: 'Insights', icon: '📈' },
                  { label: 'Community', icon: '👥' },
                ].map(s => (
                  <APressable key={s.label} style={[S.tile, { backgroundColor: palette.card, borderColor: palette.border }]}>
                    <View style={[S.row, { gap: 8 }]}>
                      <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                      <Text style={{ color: palette.text }}>{s.label}</Text>
                    </View>
                  </APressable>
                ))}
              </View>
              <View style={{ height: 8 }} />
              <View style={[S.tile, { backgroundColor: palette.gradA, borderColor: palette.border }]}>
                <Text style={[S.smallBold, { color: palette.text }]}>Tip</Text>
                <Text style={[S.meta, { color: palette.muted, marginTop: 4 }]}>Try ‘Vent Mode’ when you just want to be heard.</Text>
              </View>
            </View>
          )}

          {/* Main Columns */}
          <View style={[S.colGrow, { gap: 16 }]}>
            {/* Greeting & streak */}
            <GradientCard palette={palette} onLayout={e => onLayoutAnchor('top', e.nativeEvent.layout.y)}>
              <View style={[S.rowBetween]}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={[S.h2, { color: palette.text }]}>{`Hi ${user.nickname}, how are you feeling today?`}</Text>
                  <Text style={[S.body, { color: palette.muted, marginTop: 4 }]}>Your calm streak is <Text style={{ fontWeight: '700', color: palette.text }}>{user.streak} days</Text>. Keep it going ✨</Text>
                </View>
                <View style={[S.row, { gap: 12 }]}>
                  <HabitRing value={(user.streak % 10) * 10} label="Habit progress" size={64} palette={palette} />
                  <APressable onPress={() => scrollToId('mood')} style={[S.primaryBtn, { backgroundColor: palette.primary }]}>
                    <Text style={S.primaryBtnText}>Check in now</Text>
                  </APressable>
                </View>
              </View>
            </GradientCard>

            {/* Mood + tools */}
            <View style={isDesktop ? S.row : undefined}>
              <View style={[S.cardGrow, { marginRight: isDesktop ? 8 : 0 }]}>
                <GradientCard palette={palette} onLayout={e => onLayoutAnchor('mood', e.nativeEvent.layout.y)}>
                  <Text style={[S.h6, { color: palette.text }]}>Quick Mood Check</Text>
                  <Text style={[S.meta, { color: palette.muted }]}>Tap an emoji to log your mood.</Text>
                  <View style={[S.row, { gap: 12, marginTop: 12 }]}>
                    {['😞', '😕', '😐', '🙂', '😄'].map((e, i) => (
                      <APressable key={e} onPress={() => onLogMood(i + 1)} style={S.emojiBtn}>
                        <Text style={{ fontSize: 24 }}>{e}</Text>
                      </APressable>
                    ))}
                  </View>
                  <View style={[S.row, { gap: 8, marginTop: 12 }]}>
                    <GhostButton palette={palette} onPress={() => setJournalOpen(true)}>📝 Add a note</GhostButton>
                    <GhostButton palette={palette} onPress={() => setBreatheOpen(true)}>🎯 Suggested action</GhostButton>
                  </View>
                </GradientCard>
              </View>
              <View style={[S.cardGrow, { marginLeft: isDesktop ? 8 : 0 }] }>
                <GradientCard palette={palette}>
                  <Text style={[S.h6, { color: palette.text }]}>Quick Tools</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {quickTools.map(t => (
                      <GhostTile key={t.key} title={t.title} sub={t.sub} icon={t.icon} onPress={t.onPress} palette={palette} />
                    ))}
                  </View>
                </GradientCard>
              </View>
            </View>

            {/* Chat */}
            <ChatCard
              palette={palette}
              onLayout={e => onLayoutAnchor('chat', e.nativeEvent.layout.y)}
              messages={messages}
              onSend={sendUser}
            />
          </View>

          {/* Right column */}
          <View style={[{ width: isDesktop ? 320 : '100%', gap: 16 }]}>
            <GradientCard palette={palette}>
              <Text style={[S.h6, { color: palette.text }]}>Your week at a glance</Text>
              <Text style={[S.meta, { color: palette.muted }]}>Mood trend & sleep hours</Text>
              <View style={{ gap: 8, marginTop: 12 }}>
                <AnimatedSparkline data={moodSeries} label="Mood (1‑5)" max={5} color={palette.primary} palette={palette} />
                <AnimatedSparkline data={sleepSeries} label="Sleep (hrs)" max={10} color={palette.primary} palette={palette} />
              </View>
              <View style={[S.row, { gap: 8, marginTop: 12 }]}>
                <ProgressBar label="Calm minutes" value={64} palette={palette} />
                <ProgressBar label="Journal entries" value={40} palette={palette} />
              </View>
            </GradientCard>

            <GradientCard palette={palette}>
              <Text style={[S.h6, { color: palette.text }]}>Goals & Achievements</Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                <GoalItem title="Sleep 7h avg" progress={70} palette={palette} />
                <GoalItem title="Breathe 5x/week" progress={45} palette={palette} />
                <GoalItem title="Log mood daily" progress={80} palette={palette} />
              </View>
              <APressable onPress={() => setRewardsOpen(true)} style={[S.primaryBtn, { backgroundColor: palette.emphasis, marginTop: 12 }]}>
                <Text style={S.primaryBtnText}>View badges</Text>
              </APressable>
            </GradientCard>

            <SafetyCard palette={palette} />
          </View>
        </View>
      </ScrollView>

      {/* Floating buttons */}
      <View style={[S.fabs]}>
        <APressable onPress={() => scrollToId('chat')} style={[S.fab, { backgroundColor: palette.primary }]}>
          <Text style={S.fabText}>💬 Chat</Text>
        </APressable>
        <APressable style={[S.fab, { backgroundColor: '#f43f5e' }]}>
          <Text style={S.fabText}>🛟 Crisis Support</Text>
        </APressable>
      </View>

      {/* Drawers & Modals */}
      <Drawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} title="Notifications" palette={palette}>
        <NotificationList palette={palette} />
      </Drawer>

      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings" palette={palette}>
        <SettingsContent theme={theme} setTheme={setTheme} palette={palette} />
      </Sheet>

      <Modal open={rewardsOpen} onClose={() => setRewardsOpen(false)} title="Rewards" palette={palette}>
        <RewardsContent palette={palette} />
      </Modal>

      <Modal open={breatheOpen} onClose={() => setBreatheOpen(false)} title="1‑minute Box Breathing" palette={palette}>
        <BreathContent onComplete={() => { setBreatheOpen(false); sendBot('Nice work. Notice how your body feels now — lighter, steadier?'); }} palette={palette} />
      </Modal>

      <Sheet open={journalOpen} onClose={() => setJournalOpen(false)} title="Journal" palette={palette}>
        <JournalContent onSave={() => { sendBot('Saved your journal. Do you want a short reflection on it?'); setJournalOpen(false); }} palette={palette} />
      </Sheet>
    </View>
  );
}

/* =====================
   Utilities
=====================*/
async function save(key: string, value: any) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {}
}
async function load<T>(key: string): Promise<T | null> {
  try { const v = await AsyncStorage.getItem(key); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}
function rid() { return Math.random().toString(36).slice(2, 10); }
function getStreakSync() {
  // very light demo implementation using AsyncStorage sync fallback — starts at 7
  return 7;
}
function markCheckInSync() {
  // no-op demo; wire to real logic as needed
}
function randomAffirmation() {
  const A = ['You are safe in this moment.', 'Your feelings are valid.', 'Small steps count.', 'Inhale calm, exhale tension.', 'You’ve handled tough days before.'];
  return A[Math.floor(Math.random() * A.length)];
}

/* =====================
   Building Blocks
=====================*/
function GradientCard({ children, palette, onLayout }: { children: React.ReactNode; palette: Palette; onLayout?: any }) {
  return (
    <View onLayout={onLayout} style={[S.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      {children}
    </View>
  );
}

function IconButton({ children, label, onPress, palette }: { children: React.ReactNode; label: string; onPress?: () => void; palette: Palette }) {
  return (
    <Pressable onPress={onPress} style={[S.iconBtn, { borderColor: palette.border, backgroundColor: palette.glass }] }>
      <Text accessibilityLabel={label}>{children as any}</Text>
    </Pressable>
  );
}

function GhostButton({ children, onPress, palette }: { children: React.ReactNode; onPress?: () => void; palette: Palette }) {
  return (
    <APressable onPress={onPress} style={[S.outlineBtn, { borderColor: palette.border, backgroundColor: palette.ghost }]}>
      <Text style={{ color: palette.text }}>{children as any}</Text>
    </APressable>
  );
}

function GhostTile({ title, sub, icon, onPress, palette }: { title: string; sub: string; icon: string; onPress?: () => void; palette: Palette }) {
  return (
    <APressable onPress={onPress} style={[S.tile, { borderColor: palette.border, backgroundColor: palette.ghost }]}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[S.body, { color: palette.text, fontWeight: '600', marginTop: 4 }]}>{title}</Text>
      <Text style={[S.meta, { color: palette.muted }]}>{sub}</Text>
    </APressable>
  );
}

function Bubble({ who, children, palette }: { who: 'bot' | 'me'; children: React.ReactNode; palette: Palette }) {
  const isMe = who === 'me';
  return (
    <View style={[S.row, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
      <View style={[S.bubble, isMe ? { backgroundColor: palette.primary } : { backgroundColor: palette.ghost, borderColor: palette.border }, !isMe && { borderWidth: StyleSheet.hairlineWidth }]}>
        <Text style={[S.body, { color: isMe ? '#fff' : palette.text }]}>{children as any}</Text>
      </View>
    </View>
  );
}

function ThemeSwitch({ theme, setTheme, palette }: { theme: ThemeMode; setTheme: (t: ThemeMode) => void; palette: Palette }) {
  const items: ThemeMode[] = ['light', 'system', 'dark'];
  return (
    <View style={[S.switchWrap, { borderColor: palette.border, backgroundColor: palette.glass }]}>
      {items.map(t => (
        <Pressable key={t} onPress={() => setTheme(t)} style={[S.switchBtn, { backgroundColor: theme === t ? (isDarkColor(palette.text) ? '#fff' : '#0f172a') : 'transparent' }]}>
          <Text style={{ fontSize: 12, color: theme === t ? (isDarkColor(palette.text) ? '#0f172a' : '#fff') : palette.text }}>{t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🖥️'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function AnimatedSparkline({ data, label, max = 10, color, palette }: { data: number[]; label: string; max?: number; color: string; palette: Palette }) {
  const width = 280, height = 64, pad = 8;
  const step = (width - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => `${pad + i * step},${height - pad - (v / max) * (height - pad * 2)}`).join(' ');
  const last = data[data.length - 1];
  const dash = useRef(new Animated.Value(1000)).current;
  useEffect(() => {
    dash.setValue(1000);
    Animated.timing(dash, { toValue: 0, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [points]);
  return (
    <View style={[S.sparkWrap, { borderColor: palette.border, backgroundColor: palette.ghost }] }>
      <View style={[S.rowBetween]}>
        <Text style={[S.meta, { color: palette.muted }]}>{label}</Text>
        <Text style={[S.meta, { color: palette.muted }]}>Latest: <Text style={{ color: palette.text, fontWeight: '700' }}>{String(last)}</Text></Text>
      </View>
      <Svg viewBox={`0 0 ${width} ${height}`} width={'100%'} height={height}>
        <Polyline
          fill="none"
          stroke={color}
          strokeWidth={2}
          points={points}
          strokeDasharray={1000}
          strokeDashoffset={dash as any}
        />
      </Svg>
    </View>
  );
}

function ProgressBar({ label, value, palette }: { label: string; value: number; palette: Palette }) {
  return (
    <View style={[S.progressWrap, { borderColor: palette.border, backgroundColor: palette.ghost }] }>
      <View style={[S.rowBetween]}>
        <Text style={[S.meta, { color: palette.muted }]}>{label}</Text>
        <Text style={[S.meta, { color: palette.muted }]}>{value}%</Text>
      </View>
      <View style={[S.progressBar, { backgroundColor: palette.track }]}>
        <Animated.View style={[S.progressFill, { width: `${value}%`, backgroundColor: palette.primary }]}/>
      </View>
    </View>
  );
}

function GoalItem({ title, progress, palette }: { title: string; progress: number; palette: Palette }) {
  return (
    <View style={[S.rowBetween, S.goalItem, { borderColor: palette.border, backgroundColor: palette.ghost }]}>
      <Text style={{ color: palette.text }}>{title}</Text>
      <View style={[S.row, { gap: 8 }] }>
        <View style={[S.progressBar, { width: 112, backgroundColor: palette.track }]}>
          <View style={[S.progressFill, { width: `${progress}%`, backgroundColor: palette.primary }]} />
        </View>
        <Text style={[S.meta, { color: palette.muted }]}>{progress}%</Text>
      </View>
    </View>
  );
}

function ChatCard({ messages, onSend, onLayout, palette }: { messages: { id: string; who: 'me' | 'bot'; text: string; ts: number }[]; onSend: (t: string) => void; onLayout?: any; palette: Palette; }) {
  const [text, setText] = useState('');
  const boxRef = useRef<ScrollView>(null);
  useEffect(() => {
    setTimeout(() => boxRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages]);
  function submit() { onSend(text); setText(''); }
  return (
    <GradientCard palette={palette} onLayout={onLayout}>
      <View style={[S.rowBetween]}>
        <Text style={[S.h6, { color: palette.text }]}>Chat</Text>
        <GhostButton palette={palette}>🎙️ Voice</GhostButton>
      </View>
      <ScrollView ref={boxRef} style={{ maxHeight: 320, marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
        {messages.map(m => (<Bubble key={m.id} who={m.who} palette={palette}>{m.text}</Bubble>))}
        <TypingHint palette={palette} />
      </ScrollView>
      <View style={[S.row, { gap: 8, marginTop: 12 }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder="Type a message…"
          placeholderTextColor={palette.muted}
          style={[S.input, { borderColor: palette.border, backgroundColor: palette.glass, color: palette.text }]} />
        <APressable onPress={submit} style={[S.primaryBtn, { backgroundColor: palette.primary }]}>
          <Text style={S.primaryBtnText}>Send</Text>
        </APressable>
      </View>
      <View style={[S.row, { gap: 8, marginTop: 8 }]}>
        {['✨ 1‑min Breathe', '📋 Plan my day'].map(txt => (
          <GhostButton key={txt} palette={palette}>{txt}</GhostButton>
        ))}
      </View>
    </GradientCard>
  );
}

function TypingHint({ palette }: { palette: Palette }) {
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
      <Animated.Text style={[S.meta, { color: palette.muted, opacity: fade }]}>Calm Pulse is ready</Animated.Text>
      <View style={[S.row, { gap: 4 }]}>
        {[0, 1, 2].map(i => (
          <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.muted, transform: [{ translateY: new Animated.Value(0) }] }} />
        ))}
      </View>
    </View>
  );
}

/* ===== Breath Content ===== */
function BreathContent({ onComplete, palette }: { onComplete: () => void; palette: Palette }) {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [sec, setSec] = useState(4);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSec(s => (s > 1 ? s - 1 : 4));
      setCount(c => c + 1);
      setPhase(p => (p === 'Inhale' ? 'Hold' : p === 'Hold' ? 'Exhale' : p === 'Exhale' ? 'Hold' : 'Inhale'));
    }, 1000);
    const stop = setTimeout(onComplete, 60 * 1000);
    return () => { clearInterval(id); clearTimeout(stop); };
  }, [onComplete]);
  const progress = (count % 16) * 6.25; // 0..100
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Text style={[S.meta, { color: palette.muted }]}>Follow the 4‑4‑4‑4 box breathing</Text>
      <HabitRing value={progress} label={`${phase} • ${sec}`} size={176} palette={palette} />
      <Text style={[S.meta, { color: palette.muted }]}>Completes automatically in 60s</Text>
    </View>
  );
}

/* ===== Journal Content ===== */
function JournalContent({ onSave, palette }: { onSave: (text: string) => void; palette: Palette }) {
  const [text, setText] = useState('');
  const prompts = [
    'Name one thing stressing you and one tiny action.',
    'What went better than expected today?',
    'If you were supporting a friend, what would you say?',
    'Describe a calm place using your senses.',
  ];
  const [p] = useState(prompts[Math.floor(Math.random() * prompts.length)]);
  return (
    <View>
      <Text style={[S.meta, { color: palette.muted }]}>Prompt</Text>
      <Text style={[S.smallBold, { color: palette.text }]}>{p}</Text>
      <TextInput
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Write freely…"
        placeholderTextColor={palette.muted}
        style={[S.textArea, { borderColor: palette.border, backgroundColor: palette.glass, color: palette.text }]} />
      <View style={[S.row, { justifyContent: 'flex-end', gap: 8 }]}>
        <GhostButton palette={palette} onPress={() => setText('')}>Clear</GhostButton>
        <APressable onPress={() => onSave(text)} style={[S.primaryBtn, { backgroundColor: palette.primary }]}>
          <Text style={S.primaryBtnText}>Save</Text>
        </APressable>
      </View>
    </View>
  );
}

/* ===== Safety Card ===== */
function SafetyCard({ palette }: { palette: Palette }) {
  return (
    <View style={[S.card, { backgroundColor: palette.safetyBg, borderColor: palette.border }]}>
      <Text style={[S.h6, { color: '#881337' }]}>Need urgent help?</Text>
      <Text style={[S.meta, { color: '#9f1239' }]}>If you’re in crisis, contact emergency services or a trusted helpline immediately.</Text>
      <View style={[S.row, { gap: 8, flexWrap: 'wrap', marginTop: 8 }]}>
        <GhostButton palette={palette}>India: 112</GhostButton>
        <GhostButton palette={palette}>Kiran: 1800‑599‑0019</GhostButton>
      </View>
    </View>
  );
}

/* ===== Drawer / Modal / Sheet ===== */
function Drawer({ open, onClose, title, palette, children }: { open: boolean; onClose: () => void; title: string; palette: Palette; children: React.ReactNode }) {
  const slide = useRef(new Animated.Value(360)).current;
  useEffect(() => {
    if (open) Animated.timing(slide, { toValue: 0, duration: 240, useNativeDriver: true }).start();
  }, [open]);
  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={S.modalBackdrop} />
      <Animated.View style={[S.drawer, { backgroundColor: palette.card, borderLeftColor: palette.border, transform: [{ translateX: slide }] }]}>
        <View style={[S.rowBetween]}>
          <Text style={[S.smallBold, { color: palette.text }]}>{title}</Text>
          <GhostButton palette={palette} onPress={onClose}>✕</GhostButton>
        </View>
        <ScrollView style={{ marginTop: 8 }}>{children}</ScrollView>
      </Animated.View>
    </RNModal>
  );
}

function Modal({ open, onClose, title, palette, children }: { open: boolean; onClose: () => void; title: string; palette: Palette; children: React.ReactNode }) {
  const pop = useRef(new Animated.Value(0.98)).current;
  useEffect(() => { if (open) Animated.spring(pop, { toValue: 1, useNativeDriver: true }).start(); }, [open]);
  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={S.modalBackdrop} />
      <Animated.View style={[S.sheet, { alignSelf: 'center', transform: [{ scale: pop }], backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={[S.rowBetween]}>
          <Text style={[S.smallBold, { color: palette.text }]}>{title}</Text>
          <GhostButton palette={palette} onPress={onClose}>✕</GhostButton>
        </View>
        <View style={{ marginTop: 8 }}>{children}</View>
      </Animated.View>
    </RNModal>
  );
}

function Sheet({ open, onClose, title, palette, children }: { open: boolean; onClose: () => void; title: string; palette: Palette; children: React.ReactNode }) {
  const slide = useRef(new Animated.Value(320)).current;
  useEffect(() => { if (open) Animated.timing(slide, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, [open]);
  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={S.modalBackdrop} />
      <Animated.View style={[S.sheet, { bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, transform: [{ translateY: slide }], backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={[S.rowBetween]}>
          <Text style={[S.smallBold, { color: palette.text }]}>{title}</Text>
          <GhostButton palette={palette} onPress={onClose}>✕</GhostButton>
        </View>
        <View style={{ marginTop: 8 }}>{children}</View>
      </Animated.View>
    </RNModal>
  );
}

/* =====================
   Settings, Notifications, Rewards
=====================*/
function SettingsContent({ theme, setTheme, palette }: { theme: ThemeMode; setTheme: (t: ThemeMode) => void; palette: Palette }) {
  return (
    <View style={[S.rowWrap, { gap: 12 }]}>
      <GradientCard palette={palette}>
        <Text style={[S.smallBold, { color: palette.text }]}>Appearance</Text>
        <View style={{ marginTop: 8 }}>
          <ThemeSwitch theme={theme} setTheme={setTheme} palette={palette} />
        </View>
      </GradientCard>
      <GradientCard palette={palette}>
        <Text style={[S.smallBold, { color: palette.text }]}>Accessibility</Text>
        <View style={[S.rowWrap, { gap: 8, marginTop: 8 }]}>
          <Toggle label="Reduce motion" palette={palette} />
          <Toggle label="High contrast" palette={palette} />
          <Toggle label="Larger text" palette={palette} />
          <Toggle label="Screen reader hints" palette={palette} />
        </View>
      </GradientCard>
      <GradientCard palette={palette}>
        <Text style={[S.smallBold, { color: palette.text }]}>Privacy & Data</Text>
        <View style={{ marginTop: 8 }}>
          <Text style={[S.meta, { color: palette.muted }]}>🔒 End‑to‑end encrypted chats</Text>
          <Text style={[S.meta, { color: palette.muted }]}>🗄️ Local passcode lock</Text>
          <Text style={[S.meta, { color: palette.muted }]}>🧹 Clear history (7/30/90 days)</Text>
        </View>
        <View style={[S.row, { gap: 8, marginTop: 8 }]}>
          <GhostButton palette={palette}>Export</GhostButton>
          <GhostButton palette={palette}>Clear</GhostButton>
        </View>
      </GradientCard>
    </View>
  );
}

function Toggle({ label, palette }: { label: string; palette: Palette }) {
  const [on, setOn] = useState(false);
  return (
    <View style={[S.rowBetween, S.toggle, { borderColor: palette.border, backgroundColor: palette.ghost }]}>
      <Text style={{ color: palette.text }}>{label}</Text>
      <Pressable onPress={() => setOn(!on)} style={[S.switch, { backgroundColor: on ? palette.primary : palette.track }]}>
        <View style={[S.knob, { transform: [{ translateX: on ? 16 : 0 }] }]} />
      </Pressable>
    </View>
  );
}

function NotificationList({ palette }: { palette: Palette }) {
  const items = [
    { t: 'Daily check‑in available', time: 'Now' },
    { t: 'New guided meditation added', time: '1h' },
    { t: 'Community reply in #Sleep Club', time: '3h' },
  ];
  return (
    <View style={{ gap: 8 }}>
      {items.map(i => (
        <View key={i.t} style={[S.rowBetween, S.goalItem, { borderColor: palette.border, backgroundColor: palette.ghost }]}>
          <Text style={{ color: palette.text }}>{i.t}</Text>
          <Text style={[S.meta, { color: palette.muted }]}>{i.time}</Text>
        </View>
      ))}
      <Text style={[S.meta, { color: palette.muted }]}>No more notifications</Text>
    </View>
  );
}

function RewardsContent({ palette }: { palette: Palette }) {
  const badges = [
    { n: 'First Step', d: 'Completed first check‑in' },
    { n: 'Calm Streak', d: '5‑day streak achieved' },
    { n: 'Deep Breaths', d: '10 breathing sessions' },
  ];
  return (
    <View>
      <View style={[S.rowWrap, { gap: 8 }]}>
        {badges.map(b => (
          <View key={b.n} style={[S.badgeCard, { borderColor: palette.border, backgroundColor: palette.ghost }]}>
            <Text style={{ fontSize: 24 }}>🏅</Text>
            <Text style={[S.smallBold, { color: palette.text, marginTop: 4 }]}>{b.n}</Text>
            <Text style={[S.meta, { color: palette.muted }]}>{b.d}</Text>
          </View>
        ))}
      </View>
      <Text style={[S.meta, { color: palette.muted, marginTop: 8 }]}>More badges unlock as you build habits.</Text>
    </View>
  );
}

/* =====================
   HabitRing (SVG circular progress)
=====================*/
function HabitRing({ value, label, size = 64, palette }: { value: number; label: string; size?: number; palette: Palette }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = c * (1 - clamped / 100);
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={palette.track} strokeWidth={stroke} fill="none" />
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={palette.primary} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={dash} strokeLinecap="round" fill="none" />
        </G>
      </Svg>
      <Text style={[S.tinyBold, { color: palette.muted, marginTop: 4 }]}>{label}</Text>
    </View>
  );
}

/* =====================
   Small utilities
=====================*/
function APressable({ children, style, onPress }: { children: React.ReactNode; style?: any; onPress?: () => void }) {
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

function isDarkColor(hexOrText: string) {
  return false; // simplified; not needed for this palette
}

/* =====================
   Theme
=====================*/
type Palette = {
  appBg: string; text: string; muted: string; border: string; card: string; ghost: string; glass: string; primary: string; emphasis: string; track: string; blob: string; safetyBg: string; gradA: string;
};
const L: Palette = {
  appBg: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  border: 'rgba(2,6,23,0.12)',
  card: 'rgba(255,255,255,0.9)',
  ghost: 'rgba(248,250,252,0.9)',
  glass: 'rgba(255,255,255,0.7)',
  primary: '#6366f1',
  emphasis: '#0f172a',
  track: 'rgba(148,163,184,0.4)',
  blob: '#a5b4fc',
  safetyBg: 'rgba(254,242,242,0.9)',
  gradA: 'rgba(238,242,255,0.9)'
};
const D: Palette = {
  appBg: '#0b1220',
  text: '#e5edff',
  muted: '#93a4c8',
  border: 'rgba(255,255,255,0.12)',
  card: 'rgba(10,14,30,0.9)',
  ghost: 'rgba(15,23,42,0.7)',
  glass: 'rgba(2,6,23,0.6)',
  primary: '#7dd3fc',
  emphasis: '#ffffff',
  track: 'rgba(148,163,184,0.35)',
  blob: '#334155',
  safetyBg: 'rgba(76,29,149,0.15)',
  gradA: 'rgba(30,41,59,0.7)'
};

/* =====================
   Styles
=====================*/
const S = StyleSheet.create({
  flex: { flex: 1 },
  desktopShell: { flexDirection: 'row' },
  colGrow: { flex: 1 },
  cardGrow: { flex: 1 },

  headerWrap: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  logoBlob: { width: 36, height: 36, borderRadius: 12 },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },

  // Typography
  h2: { fontSize: 20, fontWeight: '700' },
  h6: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14 },
  smallBold: { fontSize: 14, fontWeight: '700' },
  meta: { fontSize: 12 },
  tinyBold: { fontSize: 11, fontWeight: '700' },

  // Cards & UI
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 24, padding: 12, shadowOpacity: 0.08, shadowRadius: 8 },
  tile: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  outlineBtn: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },

  primaryBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  primaryBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 8, flex: 1 },
  textArea: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, marginTop: 8, minHeight: 140, textAlignVertical: 'top' },

  sparkWrap: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 10 },
  progressWrap: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 10 },
  progressBar: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 999 },

  goalItem: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  badgeCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 12, width: '31%', alignItems: 'center' },
  emojiBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },

  fabs: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', justifyContent: 'space-between' },
  fab: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  fabText: { color: '#fff', fontWeight: '600' },

  switchWrap: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, padding: 4, flexDirection: 'row', alignItems: 'center' },
  switchBtn: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginHorizontal: 2 },

  toggle: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10 },
  switch: { width: 36, height: 20, borderRadius: 12, padding: 2, justifyContent: 'center' },
  knob: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },

  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },

  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawer: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 360, borderLeftWidth: StyleSheet.hairlineWidth, padding: 12 },
  sheet: { position: 'absolute', left: 12, right: 12, borderWidth: StyleSheet.hairlineWidth, borderRadius: 24, padding: 12 },
});
