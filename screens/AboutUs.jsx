import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Appearance,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import {
  Sun,
  Moon,
  HeartHandshake,
  ArrowLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const lightColors = {
  bg: '#f1f5f9',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  subtle: '#64748b',
  primary: '#4f46e5',
  primary_muted: '#eef2ff',
};

const darkColors = {
  bg: '#020617',
  card: '#0f172a',
  border: '#334155',
  text: '#e2e8f0',
  heading: '#ffffff',
  subtle: '#94a3b8',
  primary: '#818cf8',
  primary_muted: 'rgba(99, 102, 241, 0.1)',
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
  if (theme === 'light') {
    themeColors.heading = themeColors.text;
  }

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
      <Text style={[styles.logoText, { color: colors.heading }]}>
        Calm Pulse
      </Text>
    </View>
  );
}

const TeamMemberCard = ({ name, role }) => {
    const { colors } = useTheme();
    const initials = name.split(' ').map(n => n[0]).join('');
 
    return (
      <View style={styles.teamCardContainer}>
        <View style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary_muted }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
          <Text style={[styles.teamName, { color: colors.heading }]}>{name}</Text>
          <Text style={[styles.teamRole, { color: colors.subtle }]}>{role}</Text>
        </View>
      </View>
    );
};

const AboutUsContent = () => {
  const { width } = useWindowDimensions();
  const isMd = width >= 768;
  const { colors, theme, toggleTheme } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={[styles.header, { paddingHorizontal: isMd ? 48 : 20, backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <ArrowLeft size={20} color={colors.subtle} />
                <Text style={{ color: colors.subtle, fontWeight: '600', marginLeft: 8 }}>Back</Text>
            </Pressable>
            <Logo />
            <Pressable onPress={toggleTheme} style={styles.themeToggle}>
                {theme === 'light' ? <Moon size={20} color={colors.subtle} /> : <Sun size={20} color={colors.subtle} />}
            </Pressable>
        </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
        <View style={{ paddingHorizontal: isMd ? 48 : 20 }}>
          <View style={styles.heroSection}>
            <View style={{ backgroundColor: colors.primary_muted, padding: 12, borderRadius: 99, marginBottom: 16 }}>
                <HeartHandshake size={32} color={colors.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.heading, fontSize: isMd ? 48 : 36 }]}>
              Our Mission
            </Text>
            <Text style={[styles.heroSub, { color: colors.subtle }]}>
              To make mental wellness support accessible, private, and stigma-free for everyone, powered by compassionate AI.
            </Text>
          </View>
        </View>

        <View style={[styles.sectionWrapper, { backgroundColor: colors.card, borderColor: colors.border, paddingHorizontal: isMd ? 48 : 20 }]}>
            <View style={styles.sectionContent}>
                <Text style={[styles.sectionTitle, { color: colors.heading, fontSize: isMd ? 32 : 28 }]}>The Idea & Philosophy</Text>
                <Text style={[styles.bodyText, { color: colors.text }]}>
                    The idea behind Calm Pulse is simple: to be the friend that's always there. We wanted to create a truly private, judgment-free space for anyone going through a rough time, especially those who feel they have no one to whom they can truly open up.
                    {'\n\n'}
                    While not a replacement for professional therapy, Calm Pulse is designed to offer immediate, therapeutic support by integrating proven techniques that help you build resilience and achieve greater mental stability.
                    {'\n\n'}
                    Crucially, Calm Pulse is an unwavering companion, available 24/7. It is an entity present anytime, entirely for you whether you need to ask for help, vent your frustrations, rant about your day, or simply share a passing thought.
                </Text>
            </View>
        </View>
        
        <View style={{ paddingHorizontal: isMd ? 48 : 20 }}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.heading, fontSize: isMd ? 32 : 28 }]}>Meet the Team</Text>
            <View style={styles.teamGrid}>
              <TeamMemberCard name="Sidharth Lama" role="Back-end Developer" />
              <TeamMemberCard name="Bilal Sabugar" role="Front-end Developer" />
              <TeamMemberCard name="Riyaan Sheth" role="Coordinator" />
              <TeamMemberCard name="Nandani Singh" role="Coordinator" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const AboutUsScreen = () => {
  return (
    <ThemeProvider>
      <AboutUsContent />
    </ThemeProvider>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  themeToggle: {
    flex: 1,
    alignItems: 'flex-end',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  heroTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 18,
    lineHeight: 28,
    marginTop: 16,
    maxWidth: 600,
    textAlign: 'center',
  },
  sectionWrapper: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
  },
  section: {
    paddingVertical: 48,
  },
  sectionContent: {
      maxWidth: 800,
      width: '100%',
      alignSelf: 'center',
      paddingVertical: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 28,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  teamCardContainer: {
    width: '50%',
    padding: 8,
  },
  teamCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
  },
  avatarText: {
      fontSize: 28,
      fontWeight: 'bold',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  teamRole: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});