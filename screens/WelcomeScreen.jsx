import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  Appearance,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import {
  MessageSquare,
  BarChart3,
  BrainCircuit,
  Sun,
  Moon,
  HeartHandshake,
  User,
  KeyRound,
  Sparkles,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import userAuth from '../components/functions/userAuth';

// --- Theme Creation ---
const lightColors = {
  bg: '#f8fafc', // slate-50
  card: '#ffffff',
  border: '#e2e8f0', // slate-200
  text: '#0f172a', // slate-900
  subtle: '#64748b', // slate-500
  primary: '#4f46e5', // indigo-600
  primary_muted: '#eef2ff', // indigo-50
  white: '#0f172a',
  input_bg: '#f1f5f9', // slate-100
};

const darkColors = {
  bg: '#020617', // slate-950
  card: '#0f172a', // slate-900
  border: '#334155', // slate-700
  text: '#f8fafc', // slate-50
  subtle: '#94a3b8', // slate-400
  primary: '#818cf8', // indigo-400
  primary_muted: 'rgba(99, 102, 241, 0.1)',
  white: '#ffffff',
  input_bg: '#1e293b', // slate-800
};


const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme || 'dark');
    });
    return () => subscription.remove();
  }, []);

  const themeColors = theme === 'light' ? lightColors : darkColors;
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, colors: themeColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// --- Styled Components ---

const Logo = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Image source={"../assets/logo.png"} style={{ height: 50, width: 50, borderRadius: 50 }} />
      <Text style={[styles.logoText, { color: colors.text }]}>
        Calm Pulse
      </Text>
    </View>
  );
}

const FeatureCard = ({ icon: Icon, title, sub, index }) => {
  const { colors } = useTheme();
  return (
    <Pressable style={({ pressed }) => [
      styles.featureCard,
      { backgroundColor: colors.card, borderColor: colors.border },
      pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
    ]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={[styles.featureCardIcon, { backgroundColor: colors.primary_muted }]}>
          <Icon size={20} color={colors.primary} />
        </View>
        <View style={[styles.featureCardIndex, { backgroundColor: colors.bg }]}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{index}</Text>
        </View>
      </View>
      <Text style={[styles.featureCardTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureCardSub, { color: colors.subtle }]}>{sub}</Text>
    </Pressable>
  );
};

const SectionTitle = ({ children }) => {
  const { colors } = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{children}</Text>
}


// --- Main Welcome Screen Component ---
// This internal component contains the actual UI and can safely use the theme context.
const WelcomeScreenContent = () => {
  const { width } = useWindowDimensions();
  const isMd = width >= 1024;
  const { colors, theme, toggleTheme } = useTheme();

  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');

  const [isUserFocused, setUserFocused] = useState(false);
  const [isPassFocused, setPassFocused] = useState(false);

  const handleNavigateToLogin = async () => {
    navigation.navigate('Login');
  };
  const handleLogin = async () => {
    userAuth(username, passcode).then((user) => user && navigation.navigate('Homescreen'))
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView>
        {/* --- Header --- */}
        <View style={[styles.header, { paddingHorizontal: isMd ? 48 : 20 }]}>
          <Logo />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMd ? 24 : 16 }}>
            {isMd && (
              <>
                <Pressable><Text style={[styles.navLink, { color: colors.subtle }]}>Features</Text></Pressable>
                <Pressable><Text style={[styles.navLink, { color: colors.subtle }]}>Safety</Text></Pressable>
              </>
            )}
            <Pressable
              onPress={handleNavigateToLogin}
              style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1.0 }]}>
              <Text style={[styles.headerButtonText, { color: darkColors.bg }]}>Start Chat</Text>
            </Pressable>
            <Pressable onPress={toggleTheme} style={({ pressed }) => [{ padding: 4, opacity: pressed ? 0.7 : 1.0 }]}>
              {theme === 'light' ? <Moon size={20} color={colors.subtle} /> : <Sun size={20} color={colors.subtle} />}
            </Pressable>
          </View>
        </View>

        <View style={{ padding: isMd ? 48 : 20 }}>
          {/* --- Hero Section --- */}
          <View style={[styles.heroSection, { flexDirection: isMd ? 'row' : 'column' }]}>
            <View style={{ flex: 1, alignItems: isMd ? 'flex-start' : 'center' }}>
              <Text style={[styles.heroTitle, { textAlign: isMd ? 'left' : 'center' }]}>
                Your Private AI Companion for Self-Care
              </Text>
              <Text style={[styles.heroSub, { color: colors.subtle, textAlign: isMd ? 'left' : 'center' }]}>
                An empathetic, always-available space to track your mood, practice healthy coping, and find your calm.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
                <Pressable onPress={handleNavigateToLogin} style={({ pressed }) => [styles.ctaButtonPrimary, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1.0 }]}>
                  <Text style={[styles.ctaButtonText, { color: darkColors.bg }]}>Start a Private Chat</Text>
                </Pressable>
              </View>
            </View>

            <View style={[styles.mockChatContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.subtle, fontSize: 12, marginBottom: 8, fontWeight: '500' }}>
                Calm Pulse • Empathetic Mode
              </Text>
              <View style={[styles.mockChatMessage, { backgroundColor: colors.bg, alignSelf: 'flex-start' }]}>
                <Text style={{ color: colors.text, lineHeight: 20 }}>Hey, I'm here for you. What's on your mind?</Text>
              </View>
              <View style={[styles.mockChatMessage, { backgroundColor: colors.primary, alignSelf: 'flex-end' }]}>
                <Text style={{ color: darkColors.bg, lineHeight: 20 }}>I'm anxious about exams and can't focus.</Text>
              </View>
            </View>
          </View>

          {/* --- How it works --- */}
          <View style={{ marginTop: 72 }}>
            <SectionTitle>How It Works</SectionTitle>
            <View style={{ flexDirection: isMd ? 'row' : 'column', gap: 20 }}>
              <FeatureCard icon={MessageSquare} index="1" title="Say Hello" sub="Start a private chat or use voice to talk it out." />
              <FeatureCard icon={HeartHandshake} index="2" title="Be Heard" sub="The bot listens with empathy and checks for risk." />
              <FeatureCard icon={BrainCircuit} index="3" title="Get Guidance" sub="Receive tailored exercises, tips, or calm time." />
              <FeatureCard icon={BarChart3} index="4" title="Track Progress" sub="Notice patterns and celebrate tiny wins." />
            </View>
          </View>

          {/* --- Get Started Now --- */}
          <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Get Started Now</Text>
            <Text style={{ color: colors.subtle, marginTop: 4, marginBottom: 24, lineHeight: 20 }}>
              No email required. Create a username to keep your space private and secure.
            </Text>

            <View>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Username</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.input_bg, borderColor: isUserFocused ? colors.primary : colors.border }]}>
                <User size={18} color={isUserFocused ? colors.primary : colors.subtle} />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="e.g., SkyWalker"
                  placeholderTextColor={colors.subtle}
                  style={[styles.textInput, { color: colors.text }]}
                  onFocus={() => setUserFocused(true)}
                  onBlur={() => setUserFocused(false)}
                />
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Passcode (Optional)</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.input_bg, borderColor: isPassFocused ? colors.primary : colors.border }]}>
                <KeyRound size={18} color={isPassFocused ? colors.primary : colors.subtle} />
                <TextInput
                  value={passcode}
                  onChangeText={setPasscode}
                  placeholder="••••••"
                  placeholderTextColor={colors.subtle}
                  keyboardType='numeric'
                  textContentType='password'
                  onSubmitEditing={handleLogin}
                  secureTextEntry
                  style={[styles.textInput, { color: colors.text }]}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
              </View>
            </View>

            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => [styles.ctaButtonPrimary, { backgroundColor: colors.primary, marginTop: 24, width: '100%', opacity: pressed ? 0.8 : 1.0 }]}>
              <Text style={[styles.ctaButtonText, { color: darkColors.bg }]}>Enter Calm Space</Text>
            </Pressable>
          </View>
        </View>

        {/* --- Footer --- */}
        <View style={[styles.footer, { borderColor: colors.border, paddingHorizontal: isMd ? 48 : 20 }]}>
          <View style={{ flexDirection: isMd ? 'row' : 'column', justifyContent: 'space-between', gap: 32 }}>
            <View style={{ maxWidth: 300, flex: 1 }}>
              <Logo />
              <Text style={{ color: colors.subtle, marginTop: 12, lineHeight: 20 }}>
                Your private AI companion for stress, stigma, and self-care.
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.footerTitle, { color: colors.text }]}>If you're in crisis</Text>
              <Text style={{ color: colors.subtle, lineHeight: 20 }}>
                Call your local emergency number or a trusted helpline immediately.
              </Text>
              <Text style={{ color: colors.text, marginTop: 8, fontWeight: '500' }}>India: 112 (Emergency)</Text>
            </View>
          </View>
          <Text style={[styles.copyright, { color: colors.subtle }]}>
            © 2025 Calm Pulse. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// This wrapper component provides the theme to the WelcomeScreenContent.
const WelcomeScreen = () => {
  return (
    <ThemeProvider>
      <WelcomeScreenContent />
    </ThemeProvider>
  );
};

export default WelcomeScreen;

// --- StyleSheet for improved organization ---
const styles = StyleSheet.create({
  logoText: { fontSize: 18, fontWeight: 'bold' },
  navLink: { fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  headerButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99 },
  headerButtonText: { fontWeight: '700' },
  heroSection: { alignItems: 'center', gap: 48 },
  heroTitle: { fontSize: Platform.OS === 'web' ? 48 : 36, fontWeight: 'bold', lineHeight: Platform.OS === 'web' ? 56 : 44, backgroundImage: 'linear-gradient(135deg, #6672f8ff, #d4d2f8ff)', WebkitBackgroundClip: 'text', color: 'transparent' },
  heroSub: { fontSize: 18, lineHeight: 28, marginTop: 16, maxWidth: 500 },
  ctaButtonPrimary: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 64, alignItems: 'center' },
  ctaButtonText: { fontWeight: 'bold', fontSize: 16 },
  mockChatContainer: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, width: '100%', gap: 10 },
  mockChatMessage: { padding: 12, borderRadius: 10, maxWidth: '85%' },
  sectionTitle: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  featureCard: { padding: 24, borderRadius: 16, borderWidth: 1, flex: 1, minWidth: 150 },
  featureCardIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureCardIndex: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  featureCardTitle: { fontWeight: 'bold', fontSize: 18, marginTop: 16 },
  featureCardSub: { fontSize: 14, marginTop: 4, lineHeight: 22 },
  formContainer: { padding: 32, borderRadius: 24, marginTop: 72, borderWidth: 1 },
  formTitle: { fontSize: 28, fontWeight: 'bold' },
  inputLabel: { fontWeight: '600', marginBottom: 8, fontSize: 14 },
  inputContainer: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  textInput: { flex: 1, paddingVertical: 14, fontSize: 16, fontWeight: '500', outlineStyle: 'none', paddingLeft: 10 },
  footer: { paddingVertical: 40, borderTopWidth: 1, marginTop: 72 },
  footerTitle: { fontWeight: 'bold', marginBottom: 12, fontSize: 16 },
  copyright: { textAlign: 'center', marginTop: 48, fontSize: 12 },
});