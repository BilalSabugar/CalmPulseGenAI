// screens/Login.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign } from '@expo/vector-icons';

import { useThemeMode } from '../components/theme/ThemeProvider';
import { useTheme } from '../components/theme/theme';
import userAuth from '../components/functions/userAuth';

export default function Login() {
  const nav = useNavigation();
  const { isDark } = useThemeMode();

  // Pull tokens (with safe fallbacks)
  const theme = useTheme?.() ?? {};
  const color = theme.color ?? {};
  const type = theme.type ?? {};
  const elevation = theme.elevation ?? {};
  const spacing = theme.spacing ?? {};
  const radius = theme.radius ?? {};

  const navigation = useNavigation();

  const [isRemember, setIsRemember] = useState(false);

  // spacing/radius fallbacks so missing keys never crash
  const S = {
    xs: spacing.xs ?? 6,
    sm: spacing.sm ?? 8,
    md: spacing.md ?? 12,
    lg: spacing.lg ?? 16,
    xl: spacing.xl ?? 24,
  };
  const R = {
    lg: radius.lg ?? 16,
    xl: radius.xl ?? 20,
    '2xl': radius['2xl'] ?? 24,
  };
  const SHADOW_CARD =
    elevation.card ?? {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      ...(Platform.OS === 'android' ? { elevation: 6 } : null),
    };

  const [Username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showpasscode, setShowpasscode] = useState(false);
  const [loading, setLoading] = useState(false);

  // entrance + glow
  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(16)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 1800, useNativeDriver: false }),
        ])
      ),
    ]).start();
  }, [fade, y, glow]);

  const handleLogin = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      userAuth(Username, passcode).then((user) => user && navigation.navigate('Homescreen'))
    }, 2000);
  };

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? '#0b1220' : '#eef2ff',
      alignItems: 'center',
      justifyContent: 'center',
      padding: S.lg,
    },
    arcs: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      borderTopLeftRadius: 9999,
      borderTopRightRadius: 9999,
      opacity: isDark ? 0.06 : 0.12,
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#93c5fd',
    },
    cardWrap: {
      width: 360,
      maxWidth: '92%',
      alignSelf: 'center',
    },
    glow: {
      position: 'absolute',
      alignSelf: 'center',
      width: 360,
      height: 180,
      top: -28,
      borderRadius: 180,
      backgroundColor: isDark ? '#6366f1' : '#93c5fd',
      ...(Platform.OS === 'web' ? { filter: 'blur(48px)' } : null),
    },
    card: {
      borderRadius: R['2xl'],
      padding: S.xl,
      paddingTop: S.lg,
      backgroundColor: isDark ? 'rgba(2,6,23,0.65)' : 'rgba(255,255,255,0.75)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
      ...SHADOW_CARD,
      ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : null),
    },
    logoBadge: {
      alignSelf: 'center',
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: S.md,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    title: {
      ...(type.h4 ?? { fontSize: 20, fontWeight: '700' }),
      textAlign: 'center',
      color: color.text ?? (isDark ? '#e5e7eb' : '#0f172a'),
    },
    sub: {
      ...(type.body ?? { fontSize: 13 }),
      textAlign: 'center',
      marginTop: S.xs,
      marginBottom: S.lg,
      lineHeight: 20,
      color: color.textMuted ?? (isDark ? '#93a2bf' : '#64748b'),
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
      backgroundColor: isDark ? 'rgba(2,6,23,0.5)' : 'rgba(241,245,249,0.7)',
      paddingHorizontal: 12,
      height: 44,
      marginTop: S.sm,
    },
    input: {
      flex: 1,
      ...(type.input ?? { fontSize: 14 }),
      color: color.text ?? (isDark ? '#e5e7eb' : '#0f172a'),
      height: "100%",
      paddingHorizontal: 5,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: S.sm,
      marginBottom: S.sm,
    },
    link: {
      ...(type.caption ?? { fontSize: 12 }),
      fontWeight: '600',
      color: color.link ?? '#2563eb',
    },
    cta: {
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: S.md,
      backgroundColor: '#111827',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.2)',
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    ctaText: { color: '#fff', fontWeight: '700', letterSpacing: 0.2 },
    divider: {
      marginTop: S.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rule: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
    },
    dividerText: {
      ...(type.caption ?? { fontSize: 12 }),
      marginHorizontal: 8,
      color: color.textMuted ?? (isDark ? '#93a2bf' : '#64748b'),
    },
    socialRow: {
      marginTop: S.md,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    socialBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(2,6,23,0.6)' : 'rgba(255,255,255,0.9)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
      marginHorizontal: 6,
    },
  });

  // Animated opacity for glow (cannot live inside StyleSheet)
  const glowOpacity = glow.interpolate
    ? glow.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.18] })
    : 0.12;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={isDark ? ['#0b1220', '#0b1220', '#0f172a'] : ['#e6f0ff', '#eaf6ff', '#ffffff']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.arcs} />

      <Animated.View style={[styles.cardWrap, { opacity: fade, transform: [{ translateY: y }] }]}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <View style={styles.card}>
          <View style={styles.logoBadge}>
            <Ionicons name="log-in-outline" size={20} color={isDark ? '#e5e7eb' : '#111827'} />
          </View>

          <Text style={styles.title}>Sign in with Username</Text>
          <Text style={styles.sub}>
            Welcome back! Please enter your details to continue.
          </Text>

          {/* Username */}
          <View style={styles.inputRow}>
            <Ionicons
              name="mail-outline"
              size={16}
              color={isDark ? '#a8b3cf' : '#64748b'}
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={Username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor={isDark ? '#8A94A7' : '#94A3B8'}
              style={styles.input}
              keyboardType="default"
              textContentType='username'
              autoCapitalize="none"
            />
          </View>

          {/* Passcode */}
          <View style={styles.inputRow}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={isDark ? '#a8b3cf' : '#64748b'}
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={passcode}
              onChangeText={setPasscode}
              placeholder="Enter 6-digit passcode"
              placeholderTextColor={isDark ? '#8A94A7' : '#94A3B8'}
              style={styles.input}
              secureTextEntry={!showpasscode}
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
              textContentType='password'
              keyboardType="numeric"
              maxLength={6}
            />
            <Pressable onPress={() => setShowpasscode(s => !s)} hitSlop={8} style={{ padding: 4 }}>
              <Ionicons
                name={showpasscode ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={isDark ? '#a8b3cf' : '#64748b'}
              />
            </Pressable>
          </View>
          <View style={styles.rowBetween}>
            <View style={styles.rowBetween}>
              <View />
              <Pressable onPress={() => setIsRemember(r => !r)}>
                <Text style={styles.link}>{`[${isRemember ? "*" : " "}] Remember Me!`}</Text>
              </Pressable>
            </View>
            <View style={styles.rowBetween}>
              <View />
              <Pressable onPress={() => alert("Forgot Password flow not implemented yet.")}>
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.cta,
              pressed && { transform: [{ translateY: 1 }] },
              loading && { opacity: 0.9 },
            ]}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Enter Calm Pulse</Text>}
          </Pressable>
          <Pressable
            onPress={() => nav.navigate('Register')}
            disabled={loading}
            style={[styles.cta, { backgroundColor: "transparent", marginTop: S.sm, shadowOpacity: 0 }]}
          >
            <Text style={[styles.ctaText, { color: !isDark ? "#000" : "#FFF" }]}>Register</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.rule} />
            <Text style={styles.dividerText}>Or sign in with</Text>
            <View style={styles.rule} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialBtn}>
              <AntDesign name="google" size={18} color={isDark ? '#e5e7eb' : '#111827'} />
            </Pressable>
            <Pressable style={styles.socialBtn}>
              <AntDesign name="facebook-square" size={18} color={isDark ? '#e5e7eb' : '#111827'} />
            </Pressable>
            <Pressable style={styles.socialBtn}>
              <AntDesign name="apple1" size={18} color={isDark ? '#e5e7eb' : '#111827'} />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
