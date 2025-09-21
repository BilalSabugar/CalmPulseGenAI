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
import { useNavigation } from '@react-navigation/native';
import userAuth from '../components/functions/userAuth';

const lightColors = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  subtle: '#64748b',
  primary: '#4f46e5',
  primary_muted: '#eef2ff',
  white: '#0f172a',
  input_bg: '#f1f5f9',
};

const darkColors = {
  bg: '#020617',
  card: '#0f172a',
  border: '#334155',
  text: '#f8fafc',
  subtle: '#94a3b8',
  primary: '#818cf8',
  primary_muted: 'rgba(99, 102, 241, 0.1)',
  white: '#ffffff',
  input_bg: '#1e293b',
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

const Logo = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Image source={require("../assets/logo.png")} style={{ height: 40, width: 40, borderRadius: 8 }} />
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
        <View style={[styles.featureCardIndex, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{index}</Text>
        </View>
      </View>
      <Text style={[styles.featureCardTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureCardSub, { color: colors.subtle }]}>{sub}</Text>
    </Pressable>
  );
};

const SectionTitle = ({ children, isMd }) => {
  const { colors } = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.text, fontSize: isMd ? 32 : 28 }]}>{children}</Text>
}

const WelcomeScreenContent = () => {
  const { width } = useWindowDimensions();
  const isMd = width >= 768;
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

  const heroTitleStyle = Platform.select({
    web: {
      backgroundImage: `linear-gradient(135deg, ${colors.primary}, #d4d2f8ff)`,
      WebkitBackgroundClip: 'text',
      color: 'transparent',
    },
    default: {
      color: colors.primary,
    }
  });

  const ChatPreview = () => (
    <View style={[styles.mockChatContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={{ color: colors.subtle, fontSize: 12, marginBottom: 8, fontWeight: '500' }}>
        Calm Pulse • Empathetic Mode
      </Text>
      <View style={[styles.mockChatMessage, { backgroundColor: colors.bg, alignSelf: 'flex-start' }]}>
        <Text style={{ color: colors.text, lineHeight: 20 }}>Hey, I'm here for you. What's on your mind?</Text>
      </View>
      <View style={[styles.mockChatMessage, { backgroundColor: colors.primary, alignSelf: 'flex-end' }]}>
        <Text style={{ color: theme === 'dark' ? darkColors.bg : lightColors.card, lineHeight: 20 }}>I'm anxious about exams and can't focus.</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView>
        <View style={[styles.header, { paddingHorizontal: isMd ? 48 : 20 }]}>
          <Logo />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMd ? 24 : 12 }}>
            <>
              <Pressable onPress={() => navigation.navigate('AboutUs')}><Text style={[styles.navLink, { color: colors.subtle }]}>About Us</Text></Pressable>
            </>

            {isMd && (
              <Pressable
                onPress={handleNavigateToLogin}
                style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1.0 }]}>
                <Text style={[styles.headerButtonText, { color: theme === 'dark' ? darkColors.bg : lightColors.card }]}>Start Chat</Text>
              </Pressable>
            )}
            <Pressable onPress={toggleTheme} style={({ pressed }) => [{ padding: 4, opacity: pressed ? 0.7 : 1.0 }]}>
              {theme === 'light' ? <Moon size={20} color={colors.subtle} /> : <Sun size={20} color={colors.subtle} />}
            </Pressable>
          </View>
        </View>

        <View style={{ padding: isMd ? 48 : 20 }}>
          <View style={[styles.heroSection, { flexDirection: isMd ? 'row' : 'column' }]}>
            <View style={{ flex: isMd ? 1 : 0, alignItems: isMd ? 'flex-start' : 'center' }}>
              <Text style={[styles.heroTitle, heroTitleStyle, { textAlign: isMd ? 'left' : 'center', fontSize: isMd ? 48 : 36 }]}>
                Your Private AI Companion for Self-Care
              </Text>
              <Text style={[styles.heroSub, { color: colors.subtle, textAlign: isMd ? 'left' : 'center' }]}>
                An empathetic, always-available space to track your mood, practice healthy coping, and find your calm.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
                <Pressable onPress={handleNavigateToLogin} style={({ pressed }) => [styles.ctaButtonPrimary, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1.0 }]}>
                  <Text style={[styles.ctaButtonText, { color: theme === 'dark' ? darkColors.bg : lightColors.card }]}>Start a Private Chat</Text>
                </Pressable>
              </View>
            </View>

            {isMd && <ChatPreview />}
          </View>

          <View style={{ marginTop: isMd ? 72 : 64 }}>
            <SectionTitle isMd={isMd}>How It Works</SectionTitle>
            <View style={{ flexDirection: isMd ? 'row' : 'column', gap: 20 }}>
              <FeatureCard icon={MessageSquare} index="1" title="Say Hello" sub="Start a private chat or use voice to talk it out." />
              <FeatureCard icon={HeartHandshake} index="2" title="Be Heard" sub="The bot listens with empathy and checks for risk." />
              <FeatureCard icon={BrainCircuit} index="3" title="Get Guidance" sub="Receive tailored exercises, tips, or calm time." />
              <FeatureCard icon={BarChart3} index="4" title="Track Progress" sub="Notice patterns and celebrate tiny wins." />
            </View>
          </View>

          {!isMd && (
            <View style={{ marginTop: 64 }}>
              <ChatPreview />
            </View>
          )}

          <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border, marginTop: isMd ? 72 : 64 }]}>
            <Text style={[styles.formTitle, { color: colors.text, fontSize: isMd ? 28 : 24 }]}>Get Started Now</Text>
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
              <Text style={[styles.inputLabel, { color: colors.text }]}>Passcode</Text>
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
              <Text style={[styles.ctaButtonText, { color: theme === 'dark' ? darkColors.bg : lightColors.card }]}>Enter Calm Space</Text>
            </Pressable>
          </View>
        </View>

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

const WelcomeScreen = () => {
  return (
    <ThemeProvider>
      <WelcomeScreenContent />
    </ThemeProvider>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  logoText: {
    fontSize: 18, fontWeight: 'bold'
  },
  navLink: {
    fontWeight: '600'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99
  },
  headerButtonText: {
    fontWeight: '700'
  },
  heroSection: {
    alignItems: 'center',
    gap: 48
  },
  heroTitle: {
    fontWeight: 'bold',
    lineHeight: 56,
  },
  heroSub: {
    fontSize: 18,
    lineHeight: 28,
    marginTop: 16,
    maxWidth: 500
  },
  ctaButtonPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  ctaButtonText: {
    fontWeight: 'bold',
    fontSize: 16
  },
  mockChatContainer: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    width: '100%',
    gap: 10
  },
  mockChatMessage: {
    padding: 12,
    borderRadius: 10,
    maxWidth: '85%'
  },
  sectionTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32
  },
  featureCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minWidth: 150
  },
  featureCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  featureCardIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  featureCardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 16
  },
  featureCardSub: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 22
  },
  formContainer: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 1
  },
  formTitle: {
    fontWeight: 'bold'
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  textInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    fontWeight: '500',
    outlineStyle: Platform.OS === 'web' ? 'none' : undefined,
  },
  footer: {
    paddingVertical: 40,
    borderTopWidth: 1,
    marginTop: 72
  },
  footerTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 16
  },
  copyright: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 12
  },
});