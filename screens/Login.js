// ================================
// File: screens/Login.jsx
// Description: Animated login (original effects) + centralized contact info
// ================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addAlert } from '../utils/addAlert';
import { useNavigation } from '@react-navigation/native';
import { WebsiteName, width } from '../components/constants';
import isAdmin from '../utils/isAdmin';

// ✅ centralized contact (for the small help line at bottom)
import { contact } from '../src/content';

const { width: W, height: H } = Dimensions.get('window');

export default function Login() {
  // form state (UI only)
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  // decorative animated blobs (same as your original)
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = (v, d) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: d, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: d, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ).start();
    anim(blob1, 6000);
    anim(blob2, 8400);
  }, [blob1, blob2]);

  const b1Scale = blob1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const b2Scale = blob2.interpolate({ inputRange: [0, 1], outputRange: [1.1, 0.9] });

  // Secure overlay animation when Sign In pressed
  const [authing, setAuthing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const steps = useMemo(
    () => ['Encrypting session…', 'Verifying credentials…', 'Securely connecting…', 'Finalizing…'],
    [],
  );

  const lockScale = useRef(new Animated.Value(1)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  const handleLogin = async (emailID, password) => {
    const auth = getAuth();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, emailID.trim().toLowerCase(), password);

      if (remember) {
        await AsyncStorage.setItem('isAutoLogin', 'true');
      } else {
        await AsyncStorage.setItem('isAutoLogin', 'false');
      }
      await AsyncStorage.setItem('isLogedIn', 'true'); // keep original key to avoid breaking
      await AsyncStorage.setItem('email', `${emailID.trim()}`);
      await AsyncStorage.setItem('password', `${password}`);

      try {
        await addAlert(emailID, {
          type: 'security',
          title: 'New sign-in',
          body: 'You signed in on a new session.',
        });
      } catch {}

      const go = (await isAdmin(emailID.trim().toLowerCase())) ? 'Admin' : 'Homescreen';
      navigation.reset({ index: 0, routes: [{ name: go }] });
    } catch (error) {
      setErrorMsg(
        (error?.code || '').includes('auth')
          ? 'Invalid email or password. Please try again.'
          : 'Unable to sign in at the moment. Please try again.',
      );
      setAuthing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const startAuthAnim = () => {
    if (submitting) return;
    setAuthing(true);
    setStepIdx(0);
    progress.setValue(0);
    ringPulse.setValue(0);
    lockScale.setValue(1);

    // pulse ring loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 0, duration: 1000, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();

    // lock gentle breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(lockScale, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(lockScale, { toValue: 1.0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();

    // staged progress + messages
    let i = 0;
    const tick = () => {
      i += 1;
      setStepIdx(Math.min(i, steps.length - 1));
      Animated.timing(progress, {
        toValue: (i + 1) / steps.length,
        duration: 650,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      if (i < steps.length - 1) {
        setTimeout(tick, 800);
      } else {
        setTimeout(async () => {
          await handleLogin(email, pw);
        }, 700);
      }
    };
    setTimeout(tick, 300);
  };

  const ringScale = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ringOpacity = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0] });

  const canSubmit = email.trim().length > 3 && pw.length >= 6;

  return (
    <View style={s.wrap}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#020617', '#0b1220', '#020617']}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated blobs */}
      <Animated.View style={[s.blob, { top: H * 0.1, left: -80, transform: [{ scale: b1Scale }] }]} />
      <Animated.View style={[s.blob2, { bottom: -60, right: -60, transform: [{ scale: b2Scale }] }]} />

      {/* Decorative grid lines (subtle) */}
      <View pointerEvents="none" style={s.grid}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={`v-${i}`} style={[s.gridLine, { left: (i + 1) * (W / 12) }]} />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={`h-${i}`} style={[s.gridLine, { top: (i + 1) * (H / 18), width: '100%', height: 1 }]} />
        ))}
      </View>

      {/* Glass Card */}
      <View style={s.center}>
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 60} tint="dark" style={s.card}>
          <View style={{ gap: 12 }}>
            <View style={s.logoRow}>
              <View style={s.logoBox}>
                <Text style={s.logo}>I A S & Co.</Text>
              </View>
              <Text style={s.logoSub}>Chartered Accountants</Text>
            </View>

            <Text style={s.title}>Welcome Back!</Text>
            <Text style={s.sub}>Secure access to your workspace. Please sign in with your credentials.</Text>

            {/* Email */}
            <View style={s.inputWrap}>
              <Feather name="mail" size={16} color="#93c5fd" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#8b9bb2"
                keyboardType="email-address"
                autoCapitalize="none"
                style={s.input}
                autoCorrect={false}
                autoComplete="email"
                textContentType="username"
              />
            </View>

            {/* Password */}
            <View style={s.inputWrap}>
              <Feather name="lock" size={16} color="#93c5fd" />
              <TextInput
                value={pw}
                onChangeText={setPw}
                placeholder="Password"
                placeholderTextColor="#8b9bb2"
                secureTextEntry={!showPw}
                style={s.input}
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={{ paddingLeft: 6 }}>
                <Feather name={showPw ? 'eye' : 'eye-off'} size={16} color="#8b9bb2" />
              </TouchableOpacity>
            </View>

            {errorMsg ? <Text style={s.error}>{errorMsg}</Text> : null}

            {/* Remember + Forgot */}
            <View style={s.rowBetween}>
              <TouchableOpacity onPress={() => setRemember(!remember)} style={s.chk} activeOpacity={0.8}>
                <View style={[s.box, remember && s.boxOn]} />
                <Text style={s.chkTxt}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={s.linkTxt}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In */}
            <TouchableOpacity
              disabled={!canSubmit || submitting}
              onPress={startAuthAnim}
              activeOpacity={0.9}
              style={[s.btn, (!canSubmit || submitting) && { opacity: 0.5 }]}
            >
              <Feather name="shield" size={16} color="#0b1220" />
              <Text style={s.btnTxt}>{submitting ? 'Please wait…' : 'Sign In'}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.hr} />
            <Text style={s.small}>
              New here? <Text style={s.linkTxt} onPress={() => navigation.navigate('Register')}>Create an account</Text>
            </Text>

            {/* 🔗 Help line (centralized contact; safe + neutral) */}
            <Text style={[s.small, { marginTop: 8 }]}>
              Need help? Email <Text style={s.linkTxt}>{contact.email}</Text> or call {contact.phone}.
            </Text>
          </View>
        </BlurView>
      </View>

      {/* Secure Authentication Overlay (Modal to ensure RN Web accessibility) */}
      <Modal visible={authing} animationType="fade" transparent onRequestClose={() => {}}>
        <View style={s.overlay}>
          <Animated.View style={[s.pulseRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <Animated.View style={[s.lockWrap, { transform: [{ scale: lockScale }] }]}>
            <Feather name="lock" size={28} color="#0b1220" />
          </Animated.View>

          <View style={s.authCard}>
            <Text style={s.authHdr}>Securing your session</Text>
            <Text style={s.authStep}>{steps[stepIdx]}</Text>

            {/* Progress bar */}
            <View style={s.bar}>
              <Animated.View
                style={[
                  s.barFill,
                  { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                ]}
              />
            </View>

            <Text style={s.authFine}>AES-256 | TLS 1.3 | Zero-trust</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0b1220', maxWidth: width, overflow: 'hidden' },

  blob: {
    position: 'absolute', width: 280, height: 280, borderRadius: 200,
    backgroundColor: '#22d3ee', opacity: 0.08,
  },
  blob2: {
    position: 'absolute', width: 320, height: 320, borderRadius: 220,
    backgroundColor: '#a855f7', opacity: 0.06,
  },

  grid: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0.06 },
  gridLine: { position: 'absolute', width: 1, height: '100%', backgroundColor: '#93c5fd' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
  card: {
    width: '100%', maxWidth: 960, borderRadius: 24, padding: 18, borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)', overflow: 'hidden',
  },

  logoRow: { flexDirection: 'column', alignItems: 'flex-start' },
  logoBox: { backgroundColor: '#0b1220' },
  logo: { color: '#e5e7eb', fontSize: 24, fontWeight: '900' },
  logoSub: { color: '#93c5fd', opacity: 0.8 },

  title: { color: '#e5e7eb', fontSize: 26, fontWeight: '500', marginTop: 10 },
  sub: { color: '#bcd0ea' },

  inputWrap: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.35)', backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderRadius: 12, paddingHorizontal: 12, height: 44,
  },
  input: { flex: 1, color: '#e5e7eb', paddingHorizontal: 15, backgroundColor: 'rgb(2, 6, 23)', width: '100%', height: '100%' },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  chk: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: '#93c5fd' },
  boxOn: { backgroundColor: '#93c5fd' },
  chkTxt: { color: '#d1d5db' },
  linkTxt: { color: '#93c5fd', textDecorationLine: 'underline' },

  btn: { marginTop: 14, backgroundColor: '#22d3ee', height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnTxt: { color: '#0b1220', fontWeight: '800', fontSize: 15, letterSpacing: 0.2 },

  hr: { height: 1, backgroundColor: 'rgba(148,163,184,0.25)', marginTop: 16 },
  small: { color: '#9fb2cc', marginTop: 10 },
  error: { color: '#fecaca', marginTop: 8 },

  /* overlay */
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.65)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  pulseRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#22d3ee' },
  lockWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#22d3ee', alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: 'rgba(2,6,23,0.6)' },
  authCard: { marginTop: 16, width: '100%', maxWidth: 420, backgroundColor: 'rgba(2,6,23,0.6)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)', borderRadius: 14, padding: 14 },
  authHdr: { color: '#e5e7eb', fontWeight: '800', fontSize: 14 },
  authStep: { color: '#cbd5e1', marginTop: 6 },
  bar: { height: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#0b1220', marginTop: 12 },
  barFill: { height: '100%', backgroundColor: '#22d3ee' },
  authFine: { color: '#7aa2d2', marginTop: 10, fontSize: 12 },
});
