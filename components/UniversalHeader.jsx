import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from './theme/ThemeProvider';
import { height, WebsiteName, WebsiteNameResponsive } from './constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NAV_HEIGHT = 112;
const MAX_W = 1200;
const LOGOSIZE = 48;

function Container({ children, style }) {
  return (
    <View style={[{ width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: 16 }, style]}>
      {children}
    </View>
  );
}

export default function UniversalHeader() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDark, toggle } = useThemeMode();
  const { width } = useWindowDimensions();
  const sm = width < height; // breakpoint: small screens
  const [open, setOpen] = useState(false);
  const [isLogedIn, setIsLogedIn] = useState(false);

  const pal = useMemo(
    () =>
      isDark
        ? {
          bg: 'rgba(2,6,23,0.6)',
          border: 'rgba(30,41,59,0.6)',
          text: '#ffffff',
          muted: '#cbd5e1',
          brand: '#7dd3fc',
          ctaBg: '#ffffff',
          ctaText: '#0b1220',
          chipBg: 'rgba(255,255,255,0.08)',
          chipBorder: 'rgba(148,163,184,0.28)',
          menuBg: 'rgba(2,6,23,0.95)',
        }
        : {
          bg: 'rgba(255,255,255,0.75)',
          border: 'rgba(15,23,42,0.08)',
          text: '#0f172a',
          muted: '#334155',
          brand: '#0369a1',
          ctaBg: '#0f172a',
          ctaText: '#ffffff',
          chipBg: 'rgba(0,0,0,0.06)',
          chipBorder: 'rgba(15,23,42,0.12)',
          menuBg: 'rgba(255,255,255,0.98)',
        },
    [isDark]
  );

  const active = route?.name;
  const go = useCallback(
    (screen) => {
      setOpen(false);
      if (active !== screen) navigation.navigate(screen);
    },
    [active, navigation]
  );

  const links = [
    { label: 'Home', to: 'WelcomeScreen' },
    { label: 'Features', to: 'Services' },
    { label: 'About Us', to: 'AboutUs' },
    { label: 'Contact', to: 'ContactUs' },
  ];

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLogedIn(await AsyncStorage.getItem('isLogedIn') == 'true');
      } catch (e) {
        console.warn('Failed to read isLoggedIn from AsyncStorage:', e);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const CA_LOGO = require('../assets/ca-india-logo.png');

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
      <View
        style={[
          styles.navbar,
          { backgroundColor: pal.bg, borderBottomColor: pal.border },
          Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : null,
        ]}
      >
        <Container style={styles.navInner}>
          {/* Brand */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WelcomeScreen')}
            style={[styles.brandRow, { maxWidth: sm ? '65%' : '55%' }]}
          >
            <View
              style={[styles.caLogoContainer]}
            >
              <Image
                source={CA_LOGO}
                accessibilityLabel="logo"
                style={styles.caLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.brandText, { color: pal.text }]}>
              {WebsiteNameResponsive}
            </Text>
          </TouchableOpacity>


          {/* Desktop links */}
          <View style={[styles.navLinks, { display: sm ? 'none' : 'flex' }]}>
            {links.map((l) => (
              <Pressable style={styles.navButtons} key={l.to} onPress={() => go(l.to)} accessibilityRole="link" hitSlop={8}>
                <Text
                  style={[
                    styles.navLink,
                    { color: pal.muted },
                    active === l.to && { color: pal.text, fontWeight: '700' },
                  ]}
                >
                  {l.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Right controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Theme toggle */}
            <Pressable
              onPress={toggle}
              accessibilityRole="button"
              hitSlop={8}
              style={[styles.iconBtn, { backgroundColor: pal.chipBg, borderColor: pal.chipBorder }]}
            >
              {isDark ? <Ionicons name="sunny" size={16} color="#fde68a" /> : <Ionicons name="moon" size={16} color="#0f172a" />}
            </Pressable>

            {/* Desktop login */}
            {!sm && (
              !isLogedIn ? (
                <Pressable onPress={() => go('Login')} style={[styles.loginBtn, { backgroundColor: pal.ctaBg }]}>
                  <Text style={[styles.loginText, { color: pal.ctaText }]}>Login</Text>
                  <Ionicons name="arrow-forward" size={16} color={pal.ctaText} />
                </Pressable>
              ) : (
                <Pressable onPress={() => go('Homescreen')} style={[styles.loginBtn, { backgroundColor: pal.ctaBg }]}>
                  <Text style={[styles.loginText, { color: pal.ctaText }]}>Dashboard</Text>
                  <Ionicons name="arrow-forward" size={16} color={pal.ctaText} />
                </Pressable>
              )
            )}

            {/* Mobile menu button */}
            {sm && (
              <Pressable
                onPress={() => setOpen(true)}
                accessibilityRole="button"
                hitSlop={8}
                style={[styles.iconBtn, { backgroundColor: pal.chipBg, borderColor: pal.chipBorder }]}
              >
                <Ionicons name="menu" size={18} color={pal.text} />
              </Pressable>
            )}
          </View>
        </Container>
      </View >

      {/* Mobile menu */}
      < Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)
        }
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.menuWrap, { top: NAV_HEIGHT + 8 }]}>
          <View
            style={[
              styles.menuPanel,
              { backgroundColor: pal.menuBg, borderColor: pal.chipBorder },
              Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : null,
            ]}
          >
            {links.map((l) => (
              <Pressable key={l.to} onPress={() => go(l.to)} style={styles.menuItem} accessibilityRole="button">
                <Text style={[styles.menuText, { color: active === l.to ? pal.text : pal.muted }]}>{l.label}</Text>
                {active === l.to && <Ionicons name="checkmark" size={16} color={pal.text} />}
              </Pressable>
            ))}

            <View style={{ height: 1, backgroundColor: pal.chipBorder, marginVertical: 6 }} />
            {!isLogedIn ? (
              <Pressable onPress={() => go('Login')} style={styles.menuItem} accessibilityRole="button">
                <Text style={[styles.menuText, { color: pal.text }]}>Login</Text>
                <Ionicons name="arrow-forward" size={16} color={pal.text} />
              </Pressable>
            ) : (
              <Pressable onPress={() => go('Homescreen')} style={styles.menuItem} accessibilityRole="button">
                <Text style={[styles.menuText, { color: pal.text }]}>Dashboard</Text>
                <Ionicons name="arrow-forward" size={16} color={pal.text} />
              </Pressable>
            )
            }

            <Pressable
              onPress={() => {
                toggle();
                setOpen(false);
              }}
              style={[styles.menuItem, { marginTop: 2 }]}
              accessibilityRole="button"
            >
              <Text style={[styles.menuText, { color: pal.text }]}>{isDark ? 'Light mode' : 'Dark mode'}</Text>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={16} color={pal.text} />
            </Pressable>
          </View>
        </View>
      </Modal >
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: NAV_HEIGHT,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  navButtons: {
    backgroundColor: 'rgba(45, 45, 151, 0.43)',
    padding: 10,
    borderRadius: 8,
    paddingHorizontal: 15
  },
  navInner: {
    height: NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  caLogo: { width: LOGOSIZE, height: LOGOSIZE, borderRadius: LOGOSIZE / 4 },
  caLogoContainer: { paddingHorizontal: 15, paddingVertical: 5 },
  brandText: {
    fontWeight: '800',
    letterSpacing: 0.3,
    fontSize: 18,
  },

  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  navLink: { fontSize: 14 },

  iconBtn: { padding: 8, borderRadius: 10, borderWidth: 1 },

  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  loginText: { fontWeight: '800', fontSize: 13 },

  /* Mobile menu */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  menuWrap: {
    position: 'absolute',
    right: 12,
    left: 12,
    alignItems: 'flex-end',
  },
  menuPanel: {
    minWidth: 220,
    borderWidth: 1,
    borderRadius: 14,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
  },
  menuText: { fontSize: 14, fontWeight: '600' },
});
